<template lang="pug">
  router-link.doc-link(
    v-if="internal === true"
    tag="a"
    :to="to"
  )
    slot
  a.doc-link(
    v-else
    :href="to"
    target="_blank"
    rel="noopener"
  )
    slot
    q-icon(:name="mdiLaunch")
</template>

<script>
import {
  mdiLaunch
} from '@quasar/extras/mdi-v5'

export default {
  name: 'DocLink',

  created () {
    this.mdiLaunch = mdiLaunch
  },

  props: {
    to: String
  },

  computed: {
    internal () {
      return this.to.charAt(0) === '/'
    }
  }
}
</script>

<style lang="sass">
.doc-link
  color: $primary
  font-weight: 500
  text-decoration: none
  outline: 0
  border-bottom: 1px dotted currentColor
  vertical-align: center
  transition: opacity .2s
  white-space: nowrap

  &:hover
    opacity: .8

  &:focus-visible
    border-bottom: 2px solid currentColor

  .q-icon
    margin-top: -3px
    margin-left: 4px
</style>
