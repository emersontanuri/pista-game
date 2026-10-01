import type { GameCard } from '../../shared/types/game'

export const initialCatalog: GameCard[] = [
  { category: 'Pessoa', subcategory: 'Outros', difficulty: 6, answer: 'Ada Lovelace', clues: Array.from({ length: 20 }, (_, i) => `Dica ${i + 1} sobre Ada Lovelace`) },
  { category: 'Lugar', subcategory: 'Outros', difficulty: 7, answer: 'Amazônia', clues: Array.from({ length: 20 }, (_, i) => `Dica ${i + 1} sobre a Amazônia`) },
  { category: 'Coisa', subcategory: 'Outros', difficulty: 5, answer: 'Bicicleta', clues: Array.from({ length: 20 }, (_, i) => `Dica ${i + 1} sobre bicicleta`) },
  { category: 'Ano', subcategory: 'Outros', difficulty: 6, answer: '1969', clues: Array.from({ length: 20 }, (_, i) => `Dica ${i + 1} sobre o ano de 1969`) },
  { category: 'Digital', subcategory: 'Outros', difficulty: 5, answer: 'Internet', clues: Array.from({ length: 20 }, (_, i) => `Dica ${i + 1} sobre a internet`) },
]
