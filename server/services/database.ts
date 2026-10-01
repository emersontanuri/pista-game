import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { CardCategory, GameCard } from '../../shared/types/game'
import { initialCatalog } from '../data/catalog'
import { CARD_CATEGORIES, CARD_CATEGORY_DEFINITIONS, CARD_SUBCATEGORIES, DIFFICULTY_DEFINITIONS } from '../../shared/types/game'

type Db = InstanceType<typeof Database>
let db: Db | undefined

function getDb() {
  if (db) return db
  const path = resolve(process.env.PERFIL_DATABASE_PATH || 'server/data/perfil.sqlite')
  mkdirSync(dirname(path), { recursive: true })
  db = new Database(path)
  db.pragma('foreign_keys = ON')
  db.exec(`CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT NOT NULL, category TEXT NOT NULL, subcategory TEXT NOT NULL DEFAULT 'Outros', difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 10), usage_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(word, category)); CREATE TABLE IF NOT EXISTS clues (id INTEGER PRIMARY KEY AUTOINCREMENT, word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE, clue TEXT NOT NULL, UNIQUE(word_id, clue)); CREATE TABLE IF NOT EXISTS categories (name TEXT PRIMARY KEY, description TEXT NOT NULL, weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0)); CREATE TABLE IF NOT EXISTS difficulties (level INTEGER PRIMARY KEY CHECK (level BETWEEN 1 AND 10), description TEXT NOT NULL, weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0)); CREATE TABLE IF NOT EXISTS subcategories (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL, UNIQUE(category, name));`)
  const columns = db.prepare('PRAGMA table_info(words)').all() as Array<{ name: string }>
  if (!columns.some((column) => column.name === 'subcategory')) db.exec("ALTER TABLE words ADD COLUMN subcategory TEXT NOT NULL DEFAULT 'Outros'")
  // A aplicação precisa das configurações para funcionar, mas o catálogo de
  // cartas deve ser carregado explicitamente pelo comando de seed.
  seedConfiguration(db)
  return db
}

export function seedDatabase(reset = false, database = getDb()) {
  if (reset) {
    database.transaction(() => {
      database.prepare('DELETE FROM clues').run()
      database.prepare('DELETE FROM words').run()
      database.prepare('DELETE FROM categories').run()
      database.prepare('DELETE FROM difficulties').run()
      database.prepare('DELETE FROM subcategories').run()
    })()
  }

  seedConfiguration(database)
  seed(database)
}

function seedConfiguration(database: Db) {
  const category = database.prepare('INSERT OR IGNORE INTO categories (name, description, weight) VALUES (?, ?, ?)')
  const difficulty = database.prepare('INSERT OR IGNORE INTO difficulties (level, description, weight) VALUES (?, ?, ?)')
  const subcategory = database.prepare('INSERT OR IGNORE INTO subcategories (category, name, description) VALUES (?, ?, ?)')
  const categoryWeights: Record<string, number> = { Pessoa: 3, Lugar: 3, Coisa: 3, Ano: 1, Digital: 3 }
  const difficultyWeights: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 6, 6: 8, 7: 8, 8: 7, 9: 3, 10: 2 }
  const seeded: Record<string, string[]> = { Pessoa: ['História', 'Cultura', 'Profissão', 'Biografia', 'Ciência', 'Esporte', 'Política', 'Entretenimento', 'Cotidiano', 'Outros'], Lugar: ['País', 'Cidade', 'Natureza', 'Monumento', 'Região', 'Edifício', 'Viagem', 'Espaço', 'Evento', 'Outros'], Coisa: ['Animal', 'Objeto', 'Conceito', 'Alimento', 'Veículo', 'Roupa', 'Instrumento', 'Material', 'Esporte', 'Outros'], Ano: ['História', 'Cultura', 'Ciência', 'Política', 'Esporte', 'Música', 'Cinema', 'Tecnologia', 'Sociedade', 'Outros'], Digital: ['Internet', 'Tecnologia', 'Jogos', 'Aplicativos', 'Redes sociais', 'Segurança', 'Programação', 'Inteligência artificial', 'Hardware', 'Outros'] }
  database.transaction(() => { for (const name of CARD_CATEGORIES) { category.run(name, CARD_CATEGORY_DEFINITIONS[name], categoryWeights[name] ?? 1); for (const sub of seeded[name] || Object.keys(CARD_SUBCATEGORIES[name])) subcategory.run(name, sub, CARD_SUBCATEGORIES[name][sub] || `${sub} em ${name.toLowerCase()}`) }; for (const level of Object.keys(DIFFICULTY_DEFINITIONS).map(Number)) difficulty.run(level, DIFFICULTY_DEFINITIONS[level] || '', difficultyWeights[level] ?? 1) })()
}

function seed(database: Db) {
  const insertWord = database.prepare('INSERT OR IGNORE INTO words (word, category, subcategory, difficulty) VALUES (?, ?, ?, ?)')
  const findWord = database.prepare('SELECT id FROM words WHERE word = ? AND category = ?')
  const insertClue = database.prepare('INSERT OR IGNORE INTO clues (word_id, clue) VALUES (?, ?)')
  database.transaction(() => { for (const card of initialCatalog) { insertWord.run(card.answer, card.category, card.subcategory, card.difficulty); const row = findWord.get(card.answer, card.category) as { id: number }; for (const clue of card.clues) insertClue.run(row.id, clue) } })()
}

export function saveCard(card: GameCard) {
  const database = getDb(); const insert = database.prepare('INSERT OR IGNORE INTO words (word, category, subcategory, difficulty) VALUES (?, ?, ?, ?)'); const update = database.prepare('UPDATE words SET subcategory = ?, difficulty = ?, usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP WHERE word = ? AND category = ?'); const find = database.prepare('SELECT id FROM words WHERE word = ? AND category = ?'); const addClue = database.prepare('INSERT OR IGNORE INTO clues (word_id, clue) VALUES (?, ?)')
  database.transaction(() => { insert.run(card.answer, card.category, card.subcategory, card.difficulty); update.run(card.subcategory, card.difficulty, card.answer, card.category); const row = find.get(card.answer, card.category) as { id: number }; for (const clue of card.clues) addClue.run(row.id, clue) })()
}

export function getFallbackCard(category: CardCategory, subcategory: string, usedAnswers: string[] = [], random = Math.random, allowedDifficulties: number[] = []): GameCard | null {
  const rows = getDb().prepare('SELECT id, word, subcategory, difficulty, usage_count FROM words WHERE category = ? AND subcategory = ? ORDER BY usage_count ASC').all(category, subcategory) as Array<{ id: number; word: string; subcategory: string; difficulty: number; usage_count: number }>
  const filteredRows = allowedDifficulties.length ? rows.filter((row) => allowedDifficulties.includes(row.difficulty)) : rows
  if (!filteredRows.length && subcategory !== 'Outros') return getFallbackCard(category, 'Outros', usedAnswers, random, allowedDifficulties)
  if (!filteredRows.length) return null
  const used = new Set(usedAnswers.map((answer) => answer.toLowerCase())); const available = filteredRows.filter((row) => !used.has(row.word.toLowerCase())); const pool = available.length ? available : filteredRows; const min = Math.min(...pool.map((row) => row.usage_count)); const candidates = pool.filter((row) => row.usage_count === min); const selected = candidates[Math.floor(random() * candidates.length)] || candidates[0]; if (!selected) return null
  const clues = getDb().prepare('SELECT clue FROM clues WHERE word_id = ? ORDER BY id ASC').all(selected.id) as Array<{ clue: string }>
  getDb().prepare('UPDATE words SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(selected.id)
  return { category, subcategory: selected.subcategory, difficulty: selected.difficulty, answer: selected.word, clues: clues.map(({ clue }) => clue) }
}

export function resetDatabaseForTests() { db?.close(); db = undefined }

export function listDatabase() {
  const database = getDb()
  const words = database.prepare('SELECT id, word, category, subcategory, difficulty, usage_count, created_at, updated_at FROM words ORDER BY category, subcategory, word').all()
  const clues = database.prepare('SELECT id, word_id, clue FROM clues ORDER BY word_id, id').all()
  const categories = database.prepare('SELECT name, description, weight FROM categories ORDER BY name').all()
  const difficulties = database.prepare('SELECT level, description, weight FROM difficulties ORDER BY level').all()
  const subcategories = database.prepare('SELECT id, category, name, description FROM subcategories ORDER BY category, id').all()
  return { words, clues, categories, difficulties, subcategories }
}

export function updateConfiguration(type: 'category' | 'difficulty' | 'subcategory', key: string | number, description: string, weight = 0, category = '', name = '') {
  const database = getDb(); if (!description.trim() || !Number.isInteger(weight) || weight < 0) throw new Error('Configuração inválida')
  if (type === 'category') database.prepare('UPDATE categories SET description = ?, weight = ? WHERE name = ?').run(description.trim(), weight, String(key))
  else if (type === 'difficulty') database.prepare('UPDATE difficulties SET description = ?, weight = ? WHERE level = ?').run(description.trim(), weight, Number(key))
  else { if (!category.trim() || !name.trim()) throw new Error('Configuração inválida'); database.transaction(() => { const current = database.prepare('SELECT category, name FROM subcategories WHERE id = ?').get(Number(key)) as { category: string; name: string } | undefined; if (!current || database.prepare('SELECT 1 FROM subcategories WHERE category = ? AND name = ? AND id <> ?').get(category.trim(), name.trim(), Number(key))) throw new Error('Subcategoria duplicada'); database.prepare('UPDATE subcategories SET category = ?, name = ?, description = ? WHERE id = ?').run(category.trim(), name.trim(), description.trim(), Number(key)); database.prepare('UPDATE words SET subcategory = ? WHERE category = ? AND subcategory = ?').run(name.trim(), category.trim(), current.name) })() }
}

export function createSubcategory(category: string, name: string, description: string) {
  const database = getDb(); category = category.trim(); name = name.trim(); description = description.trim()
  if (!category || !name || !description || !database.prepare('SELECT 1 FROM categories WHERE name = ?').get(category)) throw new Error('Configuração inválida')
  try { database.prepare('INSERT INTO subcategories (category, name, description) VALUES (?, ?, ?)').run(category, name, description) } catch { throw new Error('Subcategoria duplicada') }
}

export function deleteSubcategory(id: number) {
  const database = getDb(); const row = database.prepare('SELECT category, name FROM subcategories WHERE id = ?').get(id) as { category: string; name: string } | undefined
  if (!row) throw new Error('Subcategoria não encontrada')
  if (database.prepare('SELECT 1 FROM words WHERE category = ? AND subcategory = ? LIMIT 1').get(row.category, row.name)) throw new Error('Subcategoria em uso')
  database.prepare('DELETE FROM subcategories WHERE id = ?').run(id)
}

export function getSelectionConfiguration() {
  const database = getDb()
  const categories = Object.fromEntries((database.prepare('SELECT name, weight FROM categories').all() as Array<{ name: string; weight: number }>).map((row) => [row.name, row.weight])) as Record<string, number>
  const difficulties = Object.fromEntries((database.prepare('SELECT level, weight FROM difficulties').all() as Array<{ level: number; weight: number }>).map((row) => [row.level, row.weight])) as Record<number, number>
  const subcategories = database.prepare('SELECT category, name, description FROM subcategories ORDER BY category, id').all() as Array<{ category: string; name: string; description: string }>
  return { categories, difficulties, subcategories }
}

export function getCategoryDescription(category: CardCategory) {
  return (getDb().prepare('SELECT description FROM categories WHERE name = ?').get(category) as { description: string } | undefined)?.description
}

export function getDifficultyDescription(level: number) {
  return (getDb().prepare('SELECT description FROM difficulties WHERE level = ?').get(level) as { description: string } | undefined)?.description
}

export function getSubcategoryDescription(category: CardCategory, name: string) { return (getDb().prepare('SELECT description FROM subcategories WHERE category = ? AND name = ?').get(category, name) as { description: string } | undefined)?.description }
export function hasSubcategory(category: CardCategory, name: string) { return Boolean(getDb().prepare('SELECT 1 FROM subcategories WHERE category = ? AND name = ?').get(category, name)) }
