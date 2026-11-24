import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'

// Adds `submitMovoaVideo()`, `getMovoaVideoStatus()`, and `generateMovoaVideo()`
// to Nuxt server routes (auto-imported). Set NUXT_MOVOA_API_KEY (or movoa.apiKey
// in nuxt.config) with a key from https://movoa.ai/settings/apikeys.
export default defineNuxtModule({
  meta: {
    name: 'nuxt-movoa',
    configKey: 'movoa',
    compatibility: { nuxt: '>=3.13.0' },
  },
  defaults: {
    apiKey: '',
    defaultModel: 'minimax-h3',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.runtimeConfig.movoa = {
      apiKey: options.apiKey || '',
      defaultModel: options.defaultModel || 'minimax-h3',
      ...(nuxt.options.runtimeConfig.movoa || {}),
    }
    addServerImportsDir(resolve('./runtime/server/utils'))
  },
})
