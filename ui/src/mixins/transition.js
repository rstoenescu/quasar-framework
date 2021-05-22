function hideScroll (el) {
  if (el !== null && el !== void 0) {
    el.classList.add('q-transition--hide-scroll')
  }
}

function restoreScroll (el) {
  if (el !== null && el !== void 0) {
    el.classList.remove('q-transition--hide-scroll')
  }
}

export const onTransitionHideScroll = {
  'before-leave': hideScroll,
  'after-leave': restoreScroll,
  'leave-cancelled': restoreScroll
}

export default {
  props: {
    transitionShow: {
      type: String,
      default: 'fade'
    },

    transitionHide: {
      type: String,
      default: 'fade'
    }
  },

  data () {
    return {
      transitionState: this.showing
    }
  },

  watch: {
    showing (val) {
      this.transitionShow !== this.transitionHide && this.$nextTick(() => {
        this.transitionState = val
      })
    }
  },

  computed: {
    transition () {
      return 'q-transition--' + (this.transitionState === true ? this.transitionHide : this.transitionShow)
    }
  }
}
