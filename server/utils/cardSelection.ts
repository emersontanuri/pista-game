import { CARD_CATEGORIES, CARD_SUBCATEGORIES, DIFFICULTY_LEVELS, type CardCategory, type CardDifficulty } from '../../shared/types/game'
import { getSelectionConfiguration } from '../services/database'

const defaultCategoryWeights: Record<CardCategory, number> = { Pessoa: 3, Lugar: 3, Coisa: 3, Ano: 1, Digital: 3 }
const defaultDifficultyWeights: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 6, 6: 8, 7: 8, 8: 7, 9: 3, 10: 2 }

function weightedPick<T>(items: T[], weights: number[], random: () => number) {
  const total = weights.reduce((sum, weight) => sum + weight, 0); let cursor = random() * total
  for (let index = 0; index < items.length; index++) { cursor -= weights[index] ?? 0; if (cursor < 0) return items[index] as T }
  return items[items.length - 1] as T
}

export function selectCardParameters(random = Math.random, selectedCategories: CardCategory[] = [], selectedDifficulties: CardDifficulty[] = []) {
  let categories = defaultCategoryWeights; let difficulties = defaultDifficultyWeights
  let configuration: ReturnType<typeof getSelectionConfiguration> | undefined
  try { configuration = getSelectionConfiguration(); categories = { ...categories, ...configuration.categories }; difficulties = { ...difficulties, ...configuration.difficulties } } catch { /* database unavailable during isolated utility tests */ }
  const categoryItems = selectedCategories.length ? selectedCategories : [...CARD_CATEGORIES]
  const category = weightedPick(categoryItems, categoryItems.map((item) => categories[item]), random)
  const difficultyLevels = selectedDifficulties.length ? selectedDifficulties.flatMap((item) => DIFFICULTY_LEVELS[item]) : Object.keys(difficulties).map(Number)
  const difficulty = weightedPick(difficultyLevels, difficultyLevels.map((item) => difficulties[item] ?? 0), random)
  let subcategories = Object.keys(CARD_SUBCATEGORIES[category])
  if (configuration) { const configured = configuration.subcategories.filter((item) => item.category === category).map((item) => item.name); if (configured.length) subcategories = configured }
  const subcategory = subcategories[Math.floor(random() * subcategories.length)] || 'Outros'
  return { category, subcategory, difficulty }
}
