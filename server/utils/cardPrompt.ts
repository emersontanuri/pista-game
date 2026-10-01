import { CARD_CATEGORY_DEFINITIONS, CARD_SUBCATEGORIES, DIFFICULTY_DEFINITIONS, type CardCategory } from '../../shared/types/game'
import { getCategoryDescription, getDifficultyDescription, getSubcategoryDescription } from '../services/database'

export function buildCardPrompt(
  usedAnswers: string[],
  category: CardCategory,
  subcategory: string,
  difficulty: number,
) {
  let categoryDefinition = CARD_CATEGORY_DEFINITIONS[category]
  let difficultyDefinition = DIFFICULTY_DEFINITIONS[difficulty]
  let subcategoryDefinition = CARD_SUBCATEGORIES[category][subcategory] || CARD_SUBCATEGORIES[category].Outros
  try {
    categoryDefinition = getCategoryDescription(category) || categoryDefinition
    difficultyDefinition = getDifficultyDescription(difficulty) || difficultyDefinition
    subcategoryDefinition = getSubcategoryDescription(category, subcategory) || subcategoryDefinition
  } catch { /* static fallback */ }
  return `Crie uma carta para o jogo Pista!, um jogo brasileiro de descobrir respostas por dicas, para público geral.
Responda somente no JSON solicitado.
A categoria escolhida pelo jogo é exatamente "${category}" e deve ser respeitada.
A categoria escolhida significa: ${categoryDefinition}.
A subcategoria escolhida é exatamente "${subcategory}" e significa: ${subcategoryDefinition}.
A nota de dificuldade escolhida pelo jogo é ${difficulty}/10 (${difficultyDefinition}): use-a para calibrar o quão conhecida é a resposta e quão exigentes são as dicas.
Escolha uma resposta conhecida e evite: ${usedAnswers.join(', ') || 'nenhuma'}.
Gere exatamente 20 dicas únicas em português do Brasil.
As dicas devem ser independentes e não ordenadas por dificuldade.
Não revele a resposta diretamente nas dicas, como já colocar a palavra nas dicas, e não repita informações.`;
}
