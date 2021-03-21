export default {
  computed: {
    __refocusTargetEl () {
      if (this.disable !== true) {
        return this.$createElement('span', {
          ref: 'refocusTarget',
          staticClass: 'no-outline',
          attrs: { tabindex: -1 }
        })
      }
    }
  },

  methods: {
    __refocusTarget (e) {
      if (this.$el.contains(document.activeElement) === true) {
        const el = this.$q.interaction.isPointer === true
          ? this.$refs.refocusTarget
          : this.$el

        el !== void 0 && document.activeElement !== el && el.focus()
      }
    }
  }
}
