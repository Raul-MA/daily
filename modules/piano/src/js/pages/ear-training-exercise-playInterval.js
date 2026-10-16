export async function playInterval(ctx, q) {
    if (ctx.state.playing) return
    const controller = new AbortController()
    ctx.playback = controller
    const { signal } = controller
    ctx.state.playing = true
    ctx.state.status = 'Playing note 1…'
    ctx.update()
    try {
      await ctx.playNote(`assets/notes/${q.rootFile}.mp3`, signal)
      if (signal.aborted) return
      ctx.state.status = 'Playing note 2…'
      ctx.update()
      await ctx.delay(300, signal)
      if (signal.aborted) return
      await ctx.playNote(`assets/notes/${q.targetFile}.mp3`, signal)
      if (signal.aborted) return
      ctx.state.status = 'What interval was that?'
    } catch {
      if (!signal.aborted) ctx.state.status = 'Audio could not play. Please try again.'
    } finally {
      if (!signal.aborted) {
        ctx.playback = null
        ctx.state.playing = false
        ctx.update()
      }
    }
  }
