import { client } from '../plugins/Platform.js'
import { isKeyCode } from '../utils/key-composition.js'

function destroy (el) {
  const ctx = el.__qgoback
  if (ctx !== void 0) {
    el.removeEventListener('click', ctx.goBack)
    el.removeEventListener('keyup', ctx.goBackKey)
    delete el.__qgoback
  }
}

export default {
  name: 'go-back',

  bind (el, { modifiers, value }, vnode) {
    if (el.__qgoback !== void 0) {
      destroy(el)
      el.__qgoback_destroyed = true
    }

    const ctx = {
      value,

      position: window.history.length - 1,
      single: modifiers.single,

      goBack () {
        const router = vnode.context.$router

        if (ctx.single === true) {
          router.go(-1)
        }
        else if (client.is.nativeMobile === true) {
          router.go(ctx.position - window.history.length)
        }
        else {
          router.replace(ctx.value)
        }
      },

      goBackKey (e) {
        // if ENTER key
        isKeyCode(e, 13) === true && ctx.goBack()
      }
    }

    el.__qgoback = ctx

    el.addEventListener('click', ctx.goBack)
    el.addEventListener('keyup', ctx.goBackKey)
  },

  update (el, { modifiers, value, oldValue }) {
    const ctx = el.__qgoback

    if (ctx !== void 0) {
      if (ctx.single !== modifiers.single) {
        ctx.single = modifiers.single
      }
      if (oldValue !== value) {
        ctx.value = value
      }
    }
  },

  unbind (el) {
    if (el.__qgoback_destroyed === void 0) {
      destroy(el)
    }
    else {
      delete el.__qgoback_destroyed
    }
  }
}
