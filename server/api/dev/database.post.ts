import { deleteWord } from '../../services/database'

export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).appEnv !== 'development') throw createError({ statusCode: 404, statusMessage: 'Não encontrado.' })
  const body = await readBody<{ action?: unknown; id?: unknown }>(event)
  if (body?.action !== 'delete' || typeof body.id !== 'number' || !Number.isInteger(body.id)) {
    throw createError({ statusCode: 400, statusMessage: 'Solicitação inválida.' })
  }
  try {
    deleteWord(body.id)
    return { ok: true }
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Não foi possível excluir a palavra.' })
  }
})
