# nuxt-movoa

Unlimited AI video generator with sound: on paid plans the tenth take of a shot costs what the first did, and your first clip is free to make right now. `nuxt-movoa` is the Nuxt module for [Movoa](https://movoa.ai/): it auto-imports `submitMovoaVideo()`, `getMovoaVideoStatus()`, and `generateMovoaVideo()` in your Nuxt server routes so any endpoint can produce [text to video](https://movoa.ai/video/text-to-video) or [photo to video](https://movoa.ai/video/photo-to-video) clips with [native AI audio](https://movoa.ai/video/ai-video-with-audio).

## Setup

```bash
npx nuxi module add nuxt-movoa
```

Or install directly and add `nuxt-movoa` to `modules` in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-movoa'],
  movoa: {
    apiKey: '', // NUXT_MOVOA_API_KEY overrides at runtime
    defaultModel: 'minimax-h3',
  },
})
```

Create an API key at [movoa.ai/settings/apikeys](https://movoa.ai/settings/apikeys) and set `NUXT_MOVOA_API_KEY` in your environment. Runs spend credits at the rates on [movoa.ai/pricing](https://movoa.ai/pricing).

## Use in a Nuxt Server Route

```ts
// server/api/clip.post.ts
export default defineEventHandler(async (event) => {
  const { prompt, imageUrl } = await readBody(event)
  return submitMovoaVideo(prompt, {
    imageUrl,
    duration: 6,
    resolution: '480p',
    aspectRatio: '16:9',
  })
})
```

Poll with `getMovoaVideoStatus(id)` or wait for completion with `generateMovoaVideo(prompt)`.

## License

MIT
