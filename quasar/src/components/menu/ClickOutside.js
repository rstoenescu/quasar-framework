import { create, listenOpts, stopAndPrevent } from '../../utils/event.js'
import Platform from '../../plugins/Platform.js'

const evtOpts = listenOpts.hasPassive === true
  ? { passive: false, capture: true }
  : true

export default {
  name: 'click-outside',

  bind (el, { value, arg, modifiers }) {
    const ctx = {
      trigger: value,
      handler (evt) {
        const target = evt && evt.target

        if (target && target !== document.body) {
          if (target.preventClickOutside === true || el.contains(target)) {
            return
          }

          if (arg !== void 0) {
            const parents = Object.values(arg)
            for (let i = 0; i < parents.length; i++) {
              if (parents[i].contains(target)) {
                return
              }
            }
          }

          let parent = target
          while (parent !== document.body) {
            if (parent === el) {
              return
            }
            if (parent.classList.contains('q-menu') || parent.classList.contains('q-dialog')) {
              let sibling = parent
              while ((sibling = sibling.previousElementSibling) !== null) {
                if (sibling.contains(el)) {
                  return
                }
              }
            }
            parent = parent.parentNode
          }
        }

        // prevent accidental click/tap on something else
        // that has a trigger --> improves UX
        // stop modifier is used for QDialog
        if (Platform.is.mobile === true || modifiers.stop === true) {
          stopAndPrevent(evt)
        }

        ctx.trigger !== void 0 && ctx.trigger(evt)

        el.dispatchEvent(create('click-outside', { bubbles: true, cancelable: false }))
      }
    }

    if (el.__qclickoutside) {
      el.__qclickoutside_old = el.__qclickoutside
    }

    el.__qclickoutside = ctx
    document.body.addEventListener('mousedown', ctx.handler, evtOpts)
    document.body.addEventListener('touchstart', ctx.handler, evtOpts)
    document.body.addEventListener('focusin', ctx.handler, evtOpts)
  },

  update (el, { value, oldValue }) {
    if (value !== oldValue) {
      el.__qclickoutside.trigger = value
    }
  },

  unbind (el) {
    const ctx = el.__qclickoutside_old || el.__qclickoutside
    if (ctx !== void 0) {
      document.body.removeEventListener('mousedown', ctx.handler, evtOpts)
      document.body.removeEventListener('touchstart', ctx.handler, evtOpts)
      document.body.removeEventListener('focusin', ctx.handler, evtOpts)
      delete el[el.__qclickoutside_old ? '__qclickoutside_old' : '__qclickoutside']
    }
  }
}
