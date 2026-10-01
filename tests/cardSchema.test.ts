import { describe, expect, it } from 'vitest'
import { validateCard } from '../server/utils/cardSchema'
const valid = { category: 'Pessoa', subcategory: 'Outros', difficulty: 6, answer: 'Ada Lovelace', clues: Array.from({ length: 20 }, (_, i) => `Dica ${i + 1}`) }
describe('validateCard', () => { it('accepts valid cards', () => expect(validateCard(valid)).toEqual(valid)); it('requires 20 clues', () => expect(() => validateCard({ ...valid, clues: valid.clues.slice(0, 19) })).toThrow()); it('rejects duplicates', () => expect(() => validateCard({ ...valid, clues: [...valid.clues.slice(0, 19), valid.clues[0]] })).toThrow()); it('rejects used answers', () => expect(() => validateCard(valid, ['ada lovelace'])).toThrow()) })
