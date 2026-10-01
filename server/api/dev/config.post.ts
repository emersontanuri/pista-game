import { createSubcategory, deleteSubcategory, updateConfiguration } from '../../services/database'

export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).appEnv !== 'development') throw createError({ statusCode: 404, statusMessage: 'Não encontrado.' })
  const body = await readBody<{ type?: unknown; action?: unknown; key?: unknown; description?: unknown; weight?: unknown; category?: unknown; name?: unknown }>(event)
  if (body?.type === 'subcategory' && body.action === 'delete' && typeof body.key === 'number') { try { deleteSubcategory(body.key); return { ok: true } } catch (error) { throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Configuração inválida.' }) } }
  if ((body?.type !== 'category' && body?.type !== 'difficulty' && body?.type !== 'subcategory') || (typeof body.key !== 'string' && typeof body.key !== 'number') || typeof body.description !== 'string' || (body.type !== 'subcategory' && typeof body.weight !== 'number') || (body.type === 'subcategory' && (typeof body.category !== 'string' || typeof body.name !== 'string'))) throw createError({ statusCode: 400, statusMessage: 'Configuração inválida.' })
  try { if (body.type === 'subcategory' && body.action === 'create') createSubcategory(String(body.category), String(body.name), body.description); else updateConfiguration(body.type, body.key, body.description, typeof body.weight === 'number' ? body.weight : 0, typeof body.category === 'string' ? body.category : '', typeof body.name === 'string' ? body.name : ''); return { ok: true } } catch (error) { throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Configuração inválida.' }) }
})
