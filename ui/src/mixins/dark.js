export default {
  props: {
    dark: {
      type: Boolean,
      default: null
    }
  },

  computed: {
    darkSuffix () {
      if (this.dark === null && this.$q.dark.isActive === null) {
        return 'dark-auto'
      }

      return this.dark === true || (this.dark === null && this.$q.dark.isActive === true)
        ? 'dark'
        : 'light'
    }
  }
}
