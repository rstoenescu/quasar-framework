import { mergeSlot } from '../utils/slot.js'
import { FOCUSABLE_SELECTOR, changeFocusedElement } from '../utils/focus'

export default {
  computed: {
    focusGuardElements () {
      return {
        firstGuard: this.$createElement('span', {
          staticClass: 'no-outline absolute no-pointer-events q-key-group-navigation--ignore-focus',
          attrs: { tabindex: 0 },
          on: { focus: this.__focusLast }
        }),
        lastGuard: this.$createElement('span', {
          staticClass: 'no-outline absolute no-pointer-events q-key-group-navigation--ignore-focus',
          attrs: { tabindex: 0 },
          on: { focus: this.__focusFirst }
        })
      }
    }
  },

  methods: {
    __focusFirst () {
      const innerNode = this.__getInnerNode()
      if (innerNode !== void 0) {
        const focusableElements = Array.prototype.slice.call(innerNode.querySelectorAll(FOCUSABLE_SELECTOR), 1, -1)
        changeFocusedElement(focusableElements, 0, 1)
      }
    },

    __focusLast () {
      const innerNode = this.__getInnerNode()
      if (innerNode !== void 0) {
        const focusableElements = Array.prototype.slice.call(innerNode.querySelectorAll(FOCUSABLE_SELECTOR), 1, -1)
        changeFocusedElement(focusableElements, focusableElements.length - 1, -1)
      }
    },

    __getFocusWrappedContent (slotName) {
      return mergeSlot([
        this.focusGuardElements.firstGuard
      ], this, slotName).concat(
        this.focusGuardElements.lastGuard
      )
    }
  }
}
