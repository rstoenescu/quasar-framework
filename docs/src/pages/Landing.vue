<template lang="pug">
q-page.landing
  h1.landing__title Quasar Framework
  section.landing__hero.flex.flex-center
    .row.items-center.justify-center.landing__hero-inner
      .landing__hero-logo.col-12.flex.flex-center.q-mb-lg
        img.landing__logo-image(src="https://cdn.quasar.dev/logo-v2/svg/logo-vertical.svg")
      .landing__hero-text.col-12.column.items-center
        //- .text-h4.landing__hero-text-main.text-bold.text-brand-primary.q-pb-xs QUASAR FRAMEWORK
        .q-pb-lg.text-grey-6.landing__hero-quote.text-center
          | {{ $t('landing.mainMessage.start') }}
          | <span class="text-bold text-no-wrap">Vue.js 2</span> {{ $t('landing.mainMessage.end') }}
        q-btn.q-mb-md(color="accent" outline no-caps type="a" href="https://v2.quasar.dev" target="_blank" label="Looking for Quasar v2 with Vue 3?")
        .landing__hero-row.q-gutter-sm.row.items-center
          q-btn(color="brand-primary" unelevated no-caps to="/introduction-to-quasar" label="Why Quasar?")
          q-btn(color="brand-primary" outline no-caps to="/start" label="Get Started")
          q-btn(color="accent" unelevated no-caps to="/video-tutorials" label="Video Tutorials")

  section.landing__front.text-center
    div
      .row.justify-center
        introduction-video.landing__video

  section.bg-white.text-grey-10.text-center
    div
      .text-h4.q-mb-xl Our Premium Sponsors
      sponsor-list

  section.bg-white.text-grey-10.text-center.row.justify-center
    .landing__features.row
      .col-12.text-center
        h4 All Platforms in One Go
      .col-12.text-center.q-my-xl
        .landing__features-icons.q-gutter-lg
          q-icon(:name="fabApple")
          q-icon(:name="fabWindows")
          q-icon(:name="fabLinux")
          q-icon(:name="fabAndroid")
          q-icon(:name="fabChrome")
          q-icon(:name="fabFirefox")
          q-icon(:name="fabEdge")
          q-icon(:name="fabSafari")
      .col-12.text-center.q-my-xl
        p Combine the power of Quasar UI with Quasar CLI. One source code for all platforms simultaneously with all the latest and greatest best practices out of the box. Focus only on your app's features and forget about the boilerplate around it.
      .col-12.row.justify-center
        .q-gutter-md
          q-btn(color="red", no-caps, no-wrap, :icon-right="mdiLaunch", label="User Interface Components", to="/vue-components")
          q-btn(color="primary", no-caps, no-wrap, :icon-right="mdiLaunch", label="SPA (Single Page App)", to="/quasar-cli/developing-spa/introduction")
          q-btn(color="teal", no-caps, no-wrap, :icon-right="mdiLaunch", label="PWA (Progressive Web App)", to="/quasar-cli/developing-pwa/introduction")
          q-btn(color="pink", no-caps, no-wrap, :icon-right="mdiLaunch", label="BEX (Browser Extension)", to="/quasar-cli/developing-browser-extensions/introduction")
          q-btn(color="accent", no-caps, no-wrap, :icon-right="mdiLaunch", label="SSR (Server-side Rendered App)", to="/quasar-cli/developing-ssr/introduction")
          q-btn(color="orange", no-caps, no-wrap, :icon-right="mdiLaunch", label="Hybrid Mobile App", to="/quasar-cli/developing-mobile-apps")
          q-btn(color="indigo", no-caps, no-wrap, :icon-right="mdiLaunch", label="Multi-platform Desktop App", to="/quasar-cli/developing-electron-apps/introduction")

  section.bg-white.text-grey-10.text-center
    .landing__features.row.items-start.q-col-gutter-lg
      .col-12.text-center
        h4 Impressive User Interface Building Blocks
      .col-12.row
        .col-12.col-md-8.landing__features-section.row.text-left
          .col-12.text-left.text-subtitle1.text-bold.q-mt-lg.q-mb-md.q-mx-xs Components
          router-link.landing__features-link.col-6.col-sm-4(
            v-for="dir in features.comps"
            :key="dir.name"
            :to="'/vue-components/' + dir.path"
          ) {{ dir.name }}

        .col-6.col-sm-4.col-md-2.landing__features-section.column.text-left
          .text-left.text-subtitle1.text-bold.q-mt-lg.q-mb-md.q-mx-xs Directives
          router-link.landing__features-link(
            v-for="dir in features.dirs"
            :key="dir.name"
            :to="'/vue-directives/' + dir.path"
          ) {{ dir.name }}

        .col-6.col-sm-4.col-md-2.landing__features-section.column.text-left
          .text-left.text-subtitle1.text-bold.q-mt-lg.q-mb-md.q-mx-xs Plugins
          router-link.landing__features-link(
            v-for="dir in features.plugins"
            :key="dir.name"
            :to="'/quasar-plugins/' + dir.path"
          ) {{ dir.name }}

  section.bg-white.text-grey-10.text-center.row.justify-center
    .landing__features.row
      .col-12.q-my-xl.row.items-center.justify-center
        q-img.col-12.col-sm-4.landing__icongenie-logo(src="https://cdn.quasar.dev/img/iconfactory.png")
        .col-12.col-sm-8.column.items-center
          h4 Quasar Icon Genie
          .q-mt-lg.q-mb-xl Consumes a source icon and automatically clones, scales, minifies and places the (needed) 100+ generated icons and splash screens in the appropriate directories for you.
          q-btn(color="brand-primary", unelevated, no-caps, no-wrap, :icon-right="mdiLaunch", label="IconGenie", to="/icongenie/introduction")

  section.landing__footer.flex.flex-center
    div.text-center
      div.landing__footer-icons.row.flex-center.q-gutter-md
        a(href="https://github.quasar.dev", target="_blank", rel="noopener")
          q-icon(:name="fabGithub")

        a(href="https://blog.quasar.dev", target="_blank", rel="noopener")
          q-icon(:name="mdiBlogger")

        a(href="https://chat.quasar.dev", rel="noopener", target="_blank")
          q-icon(:name="mdiChat")

        a(href="https://forum.quasar.dev/", rel="noopener", target="_blank")
          q-icon(:name="mdiForum")

        a(href="https://twitter.quasar.dev", target="_blank", rel="noopener")
          q-icon(:name="fabTwitter")

        a(href="https://facebook.quasar.dev", target="_blank", rel="noopener")
          q-icon(:name="fabFacebook")

        a(href="https://donate.quasar.dev", rel="sponsored", target="_blank")
          q-icon(:name="fasMedkit")

      div.q-mt-lg
        | <doc-link to="https://github.com/quasarframework/quasar/blob/dev/LICENSE">MIT LICENSE</doc-link> | <doc-link to="https://www.iubenda.com/privacy-policy/40685560">Privacy Policy</doc-link> | <doc-link to="https://github.com/quasarframework/quasar-art">Quasar Artwork</doc-link>

      div Copyright © 2015 - {{ year }} PULSARDEV SRL, Razvan Stoenescu
</template>

<script>
import Sponsor from 'components/page-parts/sponsors-and-backers/Sponsor'
import SponsorList from 'components/page-parts/sponsors-and-backers/SponsorList'
import IntroductionVideo from 'components/page-parts/introduction-to-quasar/IntroductionVideo'
// import SurveyCountdown from '../components/SurveyCountdown'

import {
  fabGithub, fabTwitter, fabFacebook, fasMedkit,
  fabApple, fabWindows, fabLinux, fabAndroid, fabChrome,
  fabFirefox, fabEdge, fabSafari, fabGoogle
} from '@quasar/extras/fontawesome-v5'

import {
  mdiChevronDown, mdiLaunch, mdiBlogger,
  mdiChat, mdiForum
} from '@quasar/extras/mdi-v5'

import features from 'assets/features.js'

export default {
  name: 'Landing',

  components: {
    Sponsor,
    SponsorList,
    // SurveyCountdown,
    IntroductionVideo
  },

  meta: {
    title: 'Quasar Framework',
    titleTemplate: ''
  },

  created () {
    this.$root.store.toc = []

    this.year = (new Date()).getFullYear()
    this.features = features

    this.fabGithub = fabGithub
    this.fabTwitter = fabTwitter
    this.fabFacebook = fabFacebook
    this.fasMedkit = fasMedkit
    this.fabApple = fabApple
    this.fabWindows = fabWindows
    this.fabLinux = fabLinux
    this.fabAndroid = fabAndroid
    this.fabChrome = fabChrome
    this.fabFirefox = fabFirefox
    this.fabEdge = fabEdge
    this.fabSafari = fabSafari
    this.fabGoogle = fabGoogle

    this.mdiChevronDown = mdiChevronDown
    this.mdiLaunch = mdiLaunch
    this.mdiBlogger = mdiBlogger
    this.mdiChat = mdiChat
    this.mdiForum = mdiForum
  }
}
</script>

<style lang="sass">
.landing

  &__title
    font-size: 0
    line-height: 0
    opacity: 0
    margin: 0 !important

  > section
    display: flex
    justify-content: center
    padding: 70px 16px 100px

    > div
      position: relative
      max-width: 1040px
      width: 100%

  &__hero
    min-height: 400px

    &-inner
      max-width: 650px !important

    &-text-main
      font-size: 24px

    &-quote
      padding-top: 70px
      font-size: 16px

    .text-h1
      font-size: 5.2rem
      line-height: 5.2rem

  &__logo-image
    width: 280px
    height: 280px

  &__icongenie-logo
    max-width: 220px !important

  &__front

    > div
      max-width: 700px !important

  &__video
    width: 530px
    max-width: 100%

  &__logo
    max-width: 170px
    max-height: 170px

  &__features

    h4, h6
      margin: 26px 0

    h6
      margin-top: 18px

    p
      opacity: .6
      font-size: 16px

    &-icons
      font-size: 64px

    &-link
      color: $grey-9
      text-decoration: none !important
      padding: 2px 3px

      &:hover
        color: $brand-primary

  &__footer
    padding-top: 72px !important
    padding-bottom: 72px !important

  &__footer-icons
    font-size: 28px

    a
      text-decoration: none
      outline: 0
      color: $brand-primary
      transition: color .28s

      &:hover
        color: $teal

@media (max-width: 1092px)
  .landing
    &__hero
      &-quote
        padding-top: 30px
      .text-h1
        font-size: 3.5rem
        line-height: 4.05rem

@media (max-width: 1023px)
  .landing

    &__logo-image
      width: 190px
      height: 190px

    &__hero
      text-align: center

      &-row
        justify-content: center

      &-logo
        padding-right: 0
        justify-content: center

      &-text
        text-align: center

      &-quote
        margin-left: auto
        margin-right: auto

    > section.padding
      padding-top: 90px
      padding-bottom: 90px

    .landing__feature-item
      text-align: center
</style>
