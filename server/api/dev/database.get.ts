import { listDatabase } from '../../services/database'

export default defineEventHandler((event) => {
  if (useRuntimeConfig(event).appEnv !== 'development') throw createError({ statusCode: 404, statusMessage: 'Não encontrado.' })
  return listDatabase()
})
