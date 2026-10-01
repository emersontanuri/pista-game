import { seedDatabase } from '../services/database'

const args = new Set(process.argv.slice(2))
const reset = args.has('--reset')

const unknownArgs = [...args].filter((arg) => arg !== '--reset')
if (unknownArgs.length) {
  throw new Error(`Flag desconhecida: ${unknownArgs[0]}`)
}

seedDatabase(reset)
console.log(reset ? 'Banco limpo e dados iniciais carregados.' : 'Dados iniciais carregados; registros existentes foram preservados.')
