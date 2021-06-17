<template lang="pug">
div
  q-btn-dropdown.text-bold(:align="align", flat, no-caps, stretch, :label="`v${$q.version}`", auto-close)
    q-list(dense padding)
      q-item-label(header) Latest (v{{ $q.version }})
      q-item(clickable, to="/start/release-notes")
        q-item-section.text-teal(avatar)
          q-icon(:name="mdiClipboardText")
        q-item-section Release notes

      q-item(clickable, tag="a", href="https://github.com/quasarframework/quasar/issues", target="_blank", rel="noopener")
        q-item-section.text-purple(avatar)
          q-icon(:name="mdiBugCheck")
        q-item-section Report a bug

      q-item(clickable, tag="a", href="https://github.com/quasarframework/quasar", target="_blank", rel="noopener")
        q-item-section(avatar)
          q-icon(:name="fabGithub")
        q-item-section Repository

      q-separator.q-mb-sm.q-mt-md

      q-item-label(header) Newer Releases
      q-item(
        clickable
        tag="a"
        :href="`https://next.quasar.dev/start/upgrade-guide`"
        target="_blank"
        rel="noopener"
      )
        q-item-section
          .text-no-wrap.row.items-center
            | Quasar v2 docs
            q-icon.q-ml-xs(:name="mdiFire" color="negative" style="font-size: 2em")

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

  q-btn-dropdown.text-bold(:align="align", flat, no-caps, stretch, :label="$t('header.tools')", auto-close)
    q-list(dense padding)
      q-item(clickable, tag="a", href="https://awesome.quasar.dev", rel="noopener", target="_blank")
        q-item-section.text-yellow-9(avatar)
          q-icon(:name="mdiFlare")
        q-item-section Awesome List

      q-item(to="/app-extensions/discover")
        q-item-section.text-brand-primary(avatar)
          q-icon(:name="mdiFilePlus")
        q-item-section App Extensions

      q-item-label.q-mt-md(header) Helpers

      q-item(clickable, to="/icongenie")
        q-item-section.text-red(avatar)
          q-icon(:name="mdiStarCircle")
        q-item-section
          .row.no-wrap.items-center
            span Icon Genie CLI
            //- q-badge.q-ml-sm new

      q-item(clickable, to="/style/theme-builder")
        q-item-section.text-teal(avatar)
          q-icon(:name="mdiPaletteSwatch")
        q-item-section Theme Builder

      q-item(clickable, to="/style/dark-mode")
        q-item-section(avatar)
          q-icon(:name="mdiInvertColors")
        q-item-section Dark Mode

      q-item(clickable, tag="a", href="layout-builder", target="_blank")
        q-item-section.text-brand-primary(avatar)
          q-icon(:name="mdiViewDashboard")
        q-item-section Layout Builder

      q-item(clickable, to="/layout/gallery")
        q-item-section.text-grey-8(avatar)
          q-icon(:name="mdiShoppingMusic")
        q-item-section Layout Gallery

      q-item(clickable, to="/layout/grid/flex-playground")
        q-item-section.text-orange(avatar)
          q-icon(:name="fasFlask")
        q-item-section
          .row.no-wrap.items-center
            span Flex Playground

      q-item-label.q-mt-md(header) Playground

      q-item(clickable, tag="a", href="https://codepen.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-brown-5(avatar)
          q-icon(:name="fabCodepen")
        q-item-section Codepen

      q-item(clickable, tag="a", href="https://jsfiddle.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-brand-primary(avatar)
          q-icon(:name="fabJsfiddle")
        q-item-section jsFiddle

      q-item(clickable, tag="a", href="https://codesandbox.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-black(avatar)
          q-icon(:name="fasCubes")
        q-item-section Codesandbox

  q-btn-dropdown.text-bold(:align="align", flat, no-caps, stretch, :label="$t('header.support')", auto-close)
    q-list(dense padding)

      q-item(clickable, tag="a", href="https://chat.quasar.dev", rel="noopener", target="_blank")
        q-item-section.text-brand-primary(avatar)
          q-icon(:name="mdiChat")
        q-item-section {{ $t('header.discordChat') }}

      q-item(clickable, tag="a", href="https://forum.quasar.dev/", rel="noopener", target="_blank")
        q-item-section.text-secondary(avatar)
          q-icon(:name="mdiForum")
        q-item-section {{ $t('header.forum') }}

      q-item(clickable, tag="a", href="https://github.com/quasarframework", rel="noopener", target="_blank")
        q-item-section(avatar)
          q-icon(:name="fabGithub")
        q-item-section GitHub Repositories

      q-item-label.q-mt-md(header) {{ $t('header.social') }}

      q-item(clickable, tag="a", href="https://blog.quasar.dev", rel="noopener", target="_blank")
        q-item-section.text-brand-primary(avatar)
          q-icon(:name="mdiBlogger")
        q-item-section {{ $t('header.blog') }}

      q-item(clickable, tag="a", href="https://forum.quasar.dev/category/1/announcements", target="_blank", rel="noopener")
        q-item-section.text-purple(avatar)
          q-icon(:name="mdiBullhorn")
        q-item-section {{ $t('header.announcements') }}

      q-item(clickable, tag="a", href="https://twitter.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-blue(avatar)
          q-icon(:name="fabTwitter")
        q-item-section Twitter

      q-item(clickable, tag="a", href="https://facebook.quasar.dev", target="_blank", rel="noopener")
        q-item-section.text-blue-8(avatar)
          q-icon(:name="fabFacebook")
        q-item-section
          .row.no-wrap.items-center
            span Facebook

      q-item-label.q-mt-md(header) {{ $t('header.donate') }}

      q-item(clickable, tag="a", href="https://donate.quasar.dev", target="_blank", rel="noopener")
        q-item-section(avatar)
          q-icon(:name="mdiCharity")
        q-item-section GitHub {{ $t('header.sponsorship') }}

  locale-dropdown(:align="align")

</template>

<script>
import {
  fabGithub, fasFlask, fabCodepen, fabJsfiddle,
  fasCubes, fabTwitter, fabFacebook
} from '@quasar/extras/fontawesome-v5'

import {
  mdiBlogger, mdiForum, mdiChat, mdiBullhorn,
  mdiViewDashboard, mdiShoppingMusic, mdiClipboardText,
  mdiBugCheck, mdiFlare, mdiFilePlus, mdiPaletteSwatch,
  mdiInvertColors, mdiCharity, mdiStarCircle, mdiFire
} from '@quasar/extras/mdi-v5'

import LocaleDropdown from './LocaleDropdown'

export default {
  name: 'HeaderMenu',

  props: {
    align: String
  },

  components: {
    LocaleDropdown
  },

  created () {
    this.fabGithub = fabGithub
    this.fasFlask = fasFlask
    this.fabCodepen = fabCodepen
    this.fabJsfiddle = fabJsfiddle
    this.fasCubes = fasCubes
    this.fabTwitter = fabTwitter
    this.fabFacebook = fabFacebook

    this.mdiBlogger = mdiBlogger
    this.mdiChat = mdiChat
    this.mdiForum = mdiForum
    this.mdiBullhorn = mdiBullhorn
    this.mdiViewDashboard = mdiViewDashboard
    this.mdiShoppingMusic = mdiShoppingMusic
    this.mdiClipboardText = mdiClipboardText
    this.mdiBugCheck = mdiBugCheck
    this.mdiFlare = mdiFlare
    this.mdiFilePlus = mdiFilePlus
    this.mdiPaletteSwatch = mdiPaletteSwatch
    this.mdiInvertColors = mdiInvertColors
    this.mdiCharity = mdiCharity
    this.mdiStarCircle = mdiStarCircle
    this.mdiFire = mdiFire
  }
}
</script>
