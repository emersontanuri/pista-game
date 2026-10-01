import { afterEach, describe, expect, it } from 'vitest'
import { unlinkSync } from 'node:fs'
import { deleteWord, listDatabase, resetDatabaseForTests, saveCard } from '../server/services/database'

const databasePath = 'server/data/test-delete-word.sqlite'
interface TestDatabase {
  words: Array<{ id: number; word: string }>
  clues: Array<{ word_id: number }>
}

afterEach(() => {
  resetDatabaseForTests()
  try { unlinkSync(databasePath) } catch { /* o arquivo pode não existir */ }
})

describe('deleteWord', () => {
  it('removes a word and its clues through the foreign-key cascade', () => {
    process.env.PERFIL_DATABASE_PATH = databasePath
    saveCard({ category: 'Pessoa', subcategory: 'Outros', difficulty: 5, answer: 'Palavra de teste', clues: ['Primeira dica', 'Segunda dica'] })
    const word = (listDatabase() as TestDatabase).words.find((row) => row.word === 'Palavra de teste')
    if (!word) throw new Error('Palavra de teste não foi criada')

    deleteWord(word.id)

    const database = listDatabase() as TestDatabase
    expect(database.words.some((row) => row.id === word.id)).toBe(false)
    expect(database.clues.some((clue) => clue.word_id === word.id)).toBe(false)
  })

  it('rejects an unknown word', () => {
    process.env.PERFIL_DATABASE_PATH = databasePath
    expect(() => deleteWord(999999)).toThrow('Palavra não encontrada')
  })
})
