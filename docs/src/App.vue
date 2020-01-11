<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import getMeta from 'assets/get-meta.js'

export default {
  name: 'App',

  meta: {
    title: 'Quasar Framework',
    titleTemplate: title => `${title} | Quasar Framework`,

    meta: getMeta(
      'Quasar Framework - Build high-performance VueJS user interfaces in record time',
      'Developer-oriented, front-end framework with VueJS components for best-in-class high-performance, responsive websites, PWA, SSR, Mobile and Desktop apps, all from the same codebase. Sensible people choose Vue. Productive people choose Quasar. Be both.'
    )
  },
  created () {
    if (this.$q.cookies.has('dark') || this.$store.state.dark) {
      this.$q.dark.set(true)
    }
  }
}
</script>
