<template lang="pug">
q-card.doc-example.q-my-lg(:class="classes", flat, bordered)
  q-toolbar.doc-example__toolbar
    card-title(:title="title", :slugifiedTitle="slugifiedTitle")

    q-space

    div.col-auto(v-key-group-navigation)
      q-btn(dense, flat, round, :icon="fabGithub", @click="openGitHub")
        q-tooltip View on GitHub
      q-btn.q-ml-sm(v-if="noEdit === false", dense, flat, round, :icon="fabCodepen", @click="openCodepen")
        q-tooltip Edit in Codepen
      q-btn.q-ml-sm(dense, flat, round, icon="code", @click="expanded = !expanded")
        q-tooltip View Source

  q-separator.doc-example__separator

  q-slide-transition
    div(v-show="expanded")
      q-tabs.doc-example__tabs(
        v-model="currentTab",
        align="left",
        :active-color="dark ? 'amber' : void 0",
        :indicator-color="dark ? 'amber' : 'primary'",
        dense,
        :breakpoint="0"
      )
        q-tab(
          v-for="tab in tabs"
          :key="`tab-${tab}`"
          :name="tab"
          :label="tab"
        )

      q-separator

      q-tab-panels.bg-code.text-grey-3.text-weight-regular(
        v-model="currentTab",
        animated
      )
        q-tab-panel.q-pa-none(
          v-for="tab in tabs"
          :key="`pane-${tab}`"
          :name="tab"
        )
          doc-code(lang="markup") {{ parts[tab] }}

      q-separator.doc-example__separator

  .row
    q-linear-progress(v-if="loading", color="primary", indeterminate)
    component.col.doc-example__content(v-else, :is="component", :class="componentClass")

  codepen(ref="codepen", :title="title", :slugifiedTitle="slugifiedTitle")
</template>

<script>
import { openURL } from 'quasar'

import {
  fabGithub, fabCodepen
} from '@quasar/extras/fontawesome-v5'

import { slugify } from 'assets/page-utils'

import DocCode from './DocCode.vue'
import Codepen from './Codepen.vue'
import CardTitle from './CardTitle.vue'

export default {
  name: 'DocExample',

  components: {
    DocCode,
    Codepen,
    CardTitle
  },

  props: {
    title: String,
    file: String,
    noEdit: Boolean,
    dark: Boolean,
    scrollable: Boolean,
    overflow: Boolean
  },

  data () {
    return {
      loading: true,
      component: null,
      tabs: [],
      currentTab: 'template',
      expanded: false,
      parts: {}
    }
  },

  computed: {
    classes () { // eslint-disable-line
      if (this.dark === true) {
        return 'doc-example--dark'
      }
    },

    componentClass () {
      return this.scrollable === true
        ? 'doc-example__content--scrollable scroll-y'
        : (this.overflow === true ? 'overflow-auto' : '')
    },

    slugifiedTitle () {
      return 'example--' + slugify(this.title)
    }
  },

  mounted () {
    Promise.all([
      import(
        /* webpackChunkName: "demo" */
        /* webpackMode: "lazy-once" */
        'examples/' + this.file + '.vue'
      ).then(comp => {
        this.component = comp.default
      }),

      import(
        /* webpackChunkName: "demo-source" */
        /* webpackMode: "lazy-once" */
        '!raw-loader!examples/' + this.file + '.vue'
      ).then(comp => {
        this.parseComponent(comp.default)
      })
    ]).then(() => {
      this.loading = false
    })
  },

  created () {
    this.fabGithub = fabGithub
    this.fabCodepen = fabCodepen
  },

  methods: {
    parseComponent (comp) {
      const
        template = this.parseTemplate('template', comp),
        script = this.parseTemplate('script', comp),
        style = this.parseTemplate('style', comp)

      this.parts = {
        template,
        script,
        style
      }
      this.tabs = [ 'template', 'script', 'style' ].filter(type => this.parts[type])
    },

    parseTemplate (target, template) {
      const
        string = `(<${target}(.*)?>[\\w\\W]*<\\/${target}>)`,
        regex = new RegExp(string, 'g'),
        parsed = regex.exec(template) || []

      return parsed[1] || ''
    },

    openGitHub () {
      openURL(`https://github.com/quasarframework/quasar/tree/dev/docs/src/examples/${this.file}.vue`)
    },

    openCodepen () {
      this.$refs.codepen.open(this.parts)
    }
  }
}
</script>

<style lang="sass">
.doc-example
  &__toolbar
    background: white
    color: $grey-8
    > .q-btn
      color: $grey-7

  &__tabs
    background: $grey-3
    color: $grey-7

  &--dark
    .doc-example__toolbar
      background: $grey-10
      color: #fff
      > .q-btn
        color: $grey-3
    .doc-example__separator
      background-color: $grey-8
    .doc-example__tabs
      background: $grey-9
      color: $grey-5

  &__content
    position: relative

    &--scrollable
      height: 500px
</style>
