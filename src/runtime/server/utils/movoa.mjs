import { useRuntimeConfig } from '#imports'

const BASE_URL = 'https://movoa.ai'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function resolveConfig(overrides = {}) {
  const rc = useRuntimeConfig().movoa || {}
  const apiKey = (overrides.apiKey ?? rc.apiKey ?? process.env.NUXT_MOVOA_API_KEY ?? process.env.MOVOA_API_KEY ?? '').trim()
  const defaultModel = overrides.model || rc.defaultModel || 'minimax-h3'
  if (!apiKey) {
    throw new Error('movoa: set NUXT_MOVOA_API_KEY (create a key at https://movoa.ai/settings/apikeys)')
  }
  return { apiKey, defaultModel }
}

/**
 * Submit a video generation job to movoa.ai and return { id, status }.
 */
export async function submitMovoaVideo(prompt, { imageUrl, model, duration = 6, resolution = '480p', aspectRatio = '16:9', sound = true, apiKey } = {}) {
  if (!prompt || !String(prompt).trim()) throw new Error('movoa: prompt is required')
  const cfg = resolveConfig({ apiKey, model })
  const options = { sound, duration, resolution, aspect_ratio: aspectRatio }
  if (imageUrl) options.image_input = [imageUrl]

  const res = await $fetch(`${BASE_URL}/api/ai/generate`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
    body: {
      provider: 'auto',
      mediaType: 'video',
      model: cfg.defaultModel,
      scene: imageUrl ? 'image-to-video' : 'text-to-video',
      prompt,
      options,
    },
  })
  if (res.code !== 0 || !res.data?.id) {
    throw new Error(`movoa: ${res.message || 'request refused'}`)
  }
  return res.data
}

/**
 * Poll a Movoa video task id once and return its current status and video URLs.
 */
export async function getMovoaVideoStatus(taskId, { apiKey } = {}) {
  const cfg = resolveConfig({ apiKey })
  const res = await $fetch(`${BASE_URL}/api/ai/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
    body: { taskId },
  })
  if (res.code !== 0) throw new Error(`movoa: ${res.message || 'query failed'}`)
  return res.data
}

/**
 * Submit a prompt and poll until the hosted MP4 with sound is ready.
 */
export async function generateMovoaVideo(prompt, opts = {}) {
  const { timeoutMs = 900000, pollMs = 8000 } = opts
  const run = await submitMovoaVideo(prompt, opts)
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await sleep(pollMs)
    let task
    try {
      task = await getMovoaVideoStatus(run.id, opts)
    } catch {
      continue
    }
    if (task?.status === 'success' && task.videos?.length) {
      return { id: run.id, url: task.videos[0], videos: task.videos }
    }
    if (task?.status === 'failed' || task?.status === 'canceled') {
      throw new Error(`movoa: run ${run.id} ${task.status}${task.errorMessage ? `: ${task.errorMessage}` : ''}`)
    }
  }
  throw new Error(`movoa: timed out waiting for run ${run.id}`)
}
