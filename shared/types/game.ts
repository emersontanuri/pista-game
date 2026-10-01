export const CARD_CATEGORIES = ['Pessoa', 'Lugar', 'Coisa', 'Ano', 'Digital'] as const
export type CardCategory = typeof CARD_CATEGORIES[number]
export const CARD_CATEGORY_DEFINITIONS: Record<CardCategory, string> = {
  Pessoa: 'qualquer ser humano, vivo ou morto, real ou fictício; personagens; profissionais e conjunto de pessoas',
  Lugar: 'qualquer criação da natureza (ex.: rios, mares, ilhas, planetas); lugares feitos pelo homem que se constituem em referências geográficas (ex.: Big Ben); lugares fictícios (ex.: Castelo Rá-Tim-Bum)',
  Coisa: 'animais, seres inanimados e itens não encontrados nas categorias anteriores (ex.: mochila); conceitos intangíveis e abstratos (ex.: solução)',
  Ano: 'anos relacionados a grandes eventos conhecidos ou históricos',
  Digital: 'palavras que não existem no mundo analógico e físico; são famosas pela ocorrência no cotidiano através de realidade digital ou virtual',
}
export const CARD_SUBCATEGORIES: Record<CardCategory, Record<string, string>> = {
  Pessoa: { História: 'figuras históricas e líderes', Cultura: 'artistas, escritores e personagens culturais', Profissão: 'profissionais e ofícios', Outros: 'pessoas que não se encaixam nas subcategorias anteriores' },
  Lugar: { País: 'países e territórios', Cidade: 'cidades e áreas urbanas', Natureza: 'lugares e formações naturais', Outros: 'lugares que não se encaixam nas subcategorias anteriores' },
  Coisa: { Animal: 'animais e seres vivos', Objeto: 'objetos, ferramentas e itens', Conceito: 'ideias, sentimentos e conceitos', Outros: 'coisas que não se encaixam nas subcategorias anteriores' },
  Ano: { História: 'anos associados a acontecimentos históricos', Cultura: 'anos associados a obras ou acontecimentos culturais', Ciência: 'anos associados a descobertas e tecnologia', Outros: 'anos que não se encaixam nas subcategorias anteriores' },
  Digital: { Internet: 'sites, serviços e fenômenos da internet', Tecnologia: 'tecnologias, dispositivos e software', Jogos: 'jogos digitais e seus elementos', Outros: 'itens digitais que não se encaixam nas subcategorias anteriores' },
}
export const DIFFICULTY_DEFINITIONS: Record<number, string> = { 1: 'muito conhecida, praticamente universal', 2: 'muito conhecida pelo público geral', 3: 'conhecida, com poucas informações específicas', 4: 'conhecida por boa parte do público', 5: 'conhecimento geral intermediário', 6: 'exige alguma familiaridade com o tema', 7: 'menos óbvia e com referências específicas', 8: 'difícil para o público geral', 9: 'muito difícil e pouco conhecida', 10: 'extremamente difícil, para especialistas ou entusiastas' }
export const CARD_DIFFICULTIES = ['facil', 'medio', 'dificil'] as const
export type CardDifficulty = typeof CARD_DIFFICULTIES[number]
export const DIFFICULTY_LEVELS: Record<CardDifficulty, number[]> = { facil: [1, 2, 3, 4], medio: [5, 6, 7, 8], dificil: [9, 10] }
export type CardSubcategory = string
export interface GameCard { category: CardCategory; subcategory: CardSubcategory; difficulty: number; answer: string; clues: string[] }
export interface GameHistoryEntry { category: CardCategory; answer: string; difficulty: number; points: number }
export interface GameState { usedAnswers: string[]; history: GameHistoryEntry[]; score: number; cardsPlayed: number; currentCard: GameCard | null; revealedClues: number; revealedClueIndexes: number[]; roundFinished: boolean; currentCardPoints: number; selectedCategories: CardCategory[]; selectedDifficulties: CardDifficulty[] }
