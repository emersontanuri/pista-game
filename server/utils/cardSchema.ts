import { CARD_CATEGORIES, CARD_SUBCATEGORIES, type GameCard } from '../../shared/types/game'
import { hasSubcategory } from '../services/database'
export function validateCard(value: unknown, usedAnswers: string[] = []): GameCard {
  if (!value || typeof value !== 'object') throw new Error('Formato inválido')
  const c = value as Record<string, unknown>; const category = typeof c.category === 'string' ? c.category.trim() : ''; const subcategory = typeof c.subcategory === 'string' ? c.subcategory.trim() : ''; const difficulty = typeof c.difficulty === 'number' ? c.difficulty : 0; const answer = typeof c.answer === 'string' ? c.answer.trim() : ''; const clues = Array.isArray(c.clues) ? c.clues.map((x) => typeof x === 'string' ? x.trim() : '') : []
  const staticSubcategory = Object.hasOwn(CARD_SUBCATEGORIES[category as GameCard['category']] || {}, subcategory)
  let validSubcategory = staticSubcategory
  try { validSubcategory = hasSubcategory(category as GameCard['category'], subcategory) } catch { /* static fallback */ }
  if (!CARD_CATEGORIES.includes(category as typeof CARD_CATEGORIES[number]) || !subcategory || !validSubcategory || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 10 || !answer || answer.length > 120) throw new Error('Categoria, subcategoria, dificuldade ou carta inválida')
  if (usedAnswers.map((x) => x.toLowerCase()).includes(answer.toLowerCase())) throw new Error('Resposta repetida')
  if (clues.length !== 20 || clues.some((x) => !x || x.length > 240)) throw new Error('A carta precisa ter 20 dicas')
  if (new Set(clues.map((x) => x.toLowerCase())).size !== 20) throw new Error('Dicas duplicadas')
  return { category: category as GameCard['category'], subcategory, difficulty, answer, clues }
}
