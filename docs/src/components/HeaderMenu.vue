<template lang="pug">
div
  q-btn-dropdown.text-bold(:align="align", flat, no-caps, stretch, :label="`v${$q.version}`", auto-close)
    q-list(dense padding)
      q-item-label(header) Latest (v{{ $q.version }})
      q-item(clickable, to="/start/release-notes")
        q-item-section.text-teal(avatar)
          q-icon(name="assignment")
        q-item-section Release notes

      q-item(clickable, tag="a", href="https://github.com/quasarframework/quasar/issues", target="_blank", rel="noopener")
        q-item-section.text-purple(avatar)
          q-icon(name="bug_report")
        q-item-section Report a bug

      q-item(clickable, tag="a", href="https://github.com/quasarframework/quasar", target="_blank", rel="noopener")
        q-item-section(avatar)
          q-icon(name="fab fa-github")
        q-item-section Repository

      q-separator.q-mb-sm.q-mt-md

      q-item-label(header) Older Releases
      q-item(
        v-for="version in ['17', '16', '15', '14', '13']"
        :key="version"
        clickable
        tag="a"
        :href="`https://v0-${version}.quasar-framework.org/`"
        target="_blank"
        rel="noopener"
      )
        q-item-section {{ `v0.${version}` }} docs

  q-btn-dropdown.text-bold(:align="align", flat, no-caps, stretch, label="Tools", auto-close)
    q-list(dense padding)
      q-item(clickable, tag="a", href="https://awesome.quasar.dev", rel="noopener", target="_blank")
        q-item-section.text-yellow-9(avatar)
          q-icon(name="flare")
        q-item-section Awesome List

      q-item(to="/app-extensions/discover")
        q-item-section.text-primary(avatar)
          q-icon(name="note_add")
        q-item-section App Extensions

      q-item-label.q-mt-md(header) Helpers

      q-item(clickable, to="/style/theme-builder")
        q-item-section.text-teal(avatar)
          q-icon(name="style")
        q-item-section Theme Builder

      q-item(clickable, to="/style/dark-mode")
        q-item-section(avatar)
          q-icon(name="invert_colors")
        q-item-section
          .row.no-wrap.items-center
            span Dark Mode
            q-badge.q-ml-sm new

      q-item(clickable, tag="a", href="/layout-builder", target="_blank")
        q-item-section.text-primary(avatar)
          q-icon(name="dashboard")
        q-item-section Layout Builder

      q-item(clickable, to="/layout/gallery")
        q-item-section.text-grey-8(avatar)
          q-icon(name="shop_two")
        q-item-section Layout Gallery

      q-item(clickable, to="/layout/grid/flex-playground")
        q-item-section.text-orange(avatar)
          q-icon(name="fas fa-flask")
        q-item-section
          .row.no-wrap.items-center
            span Flex Playground

      q-item-label.q-mt-md(header) Playground

      q-item(clickable, tag="a", href="https://codepen.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-brown-5(avatar)
          q-icon(name="fab fa-codepen")
        q-item-section Codepen

      q-item(clickable, tag="a", href="https://jsfiddle.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-primary(avatar)
          q-icon(name="fab fa-jsfiddle")
        q-item-section jsFiddle

      q-item(clickable, tag="a", href="https://codesandbox.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-black(avatar)
          q-icon(name="fas fa-cubes")
        q-item-section Codesandbox

  q-btn-dropdown.text-bold(:align="align", flat, no-caps, stretch, label="Support", auto-close)
    q-list(dense padding)

      q-item(clickable, tag="a", href="https://chat.quasar.dev", rel="noopener", target="_blank")
        q-item-section.text-primary(avatar)
          q-icon(name="chat")
        q-item-section Discord Chat

      q-item(clickable, tag="a", href="https://forum.quasar.dev/", rel="noopener", target="_blank")
        q-item-section.text-secondary(avatar)
          q-icon(name="forum")
        q-item-section Forum

      q-item(clickable, tag="a", href="https://github.com/quasarframework", rel="noopener", target="_blank")
        q-item-section(avatar)
          q-icon(name="fab fa-github")
        q-item-section Github Repositories

      q-item-label.q-mt-md(header) Social

      q-item(clickable, tag="a", href="https://blog.quasar.dev", rel="noopener", target="_blank")
        q-item-section.text-primary(avatar)
          q-icon(name="fab fa-medium")
        q-item-section Blog

      q-item(clickable, tag="a", href="https://forum.quasar.dev/category/1/announcements", target="_blank", rel="noopener")
        q-item-section.text-purple(avatar)
          q-icon(name="announcement")
        q-item-section Announcements

      q-item(clickable, tag="a", href="https://twitter.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-blue(avatar)
          q-icon(name="fab fa-twitter")
        q-item-section Twitter

      q-item(clickable, tag="a", href="https://facebook.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-primary(avatar)
          q-icon(name="fab fa-facebook")
        q-item-section
          .row.no-wrap.items-center
            span Facebook

      q-item-label.q-mt-md(header) Donate

      q-item(clickable, tag="a", href="https://donate.quasar.dev", target="_blank", rel="noopener")
        q-item-section(avatar)
          q-icon(name="fab fa-github")
        q-item-section Github Sponsorship
  q-btn(@click="toggleDarkMode" :icon="darkModeBtnIcon" flat, :dense="$q.screen.lt.md", :ripple="false", :style="computedBtnStyle")
</template>

<script>
export default {
  props: {
    align: String
  },
  methods: {
    toggleDarkMode () {
      if (this.$q.dark.isActive) {
        this.$q.dark.set(false)
        this.$q.cookies.remove('dark')
      }
      else {
        this.$q.dark.set(true)
        this.$q.cookies.set('dark', 'true', { expires: 5 * 365 })
      }
    }
  },
  computed: {
    darkModeBtnIcon () {
      return this.$q.dark.isActive ? 'brightness_4' : 'brightness_7'
    },
    computedBtnStyle () {
      return this.$q.screen.lt.md ? 'align-self: flex-end; padding-right: 12px' : ''
    }
  }
}
</script>
