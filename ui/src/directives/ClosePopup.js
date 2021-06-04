import { closePortals } from '../mixins/portal.js'
import { isKeyCode } from '../utils/key-composition.js'

/*
 * depth
 *   < 0  --> close all chain
 *   0    --> disabled
 *   > 0  --> close chain up to N parent
 */

function getDepth (value) {
  if (value === false) {
    return 0
  }
  if (value === true || value === void 0) {
    return 1
  }

  const depth = parseInt(value, 10)
  return isNaN(depth) ? 0 : depth
}

function destroy (el) {
  const ctx = el.__qclosepopup
  if (ctx !== void 0) {
    el.removeEventListener('click', ctx.handler)
    el.removeEventListener('keyup', ctx.handlerKey)
    delete el.__qclosepopup
  }
}

export default {
  name: 'close-popup',

  bind (el, { value }, vnode) {
    if (el.__qclosepopup !== void 0) {
      destroy(el)
      el.__qclosepopup_destroyed = true
    }

    const ctx = {
      depth: getDepth(value),

      handler (evt) {
        // allow @click to be emitted
        ctx.depth !== 0 && setTimeout(() => {
          closePortals(vnode.componentInstance || vnode.context, evt, ctx.depth)
        })
      },

      handlerKey (evt) {
        isKeyCode(evt, 13) === true && ctx.handler(evt)
      }
    }

    el.__qclosepopup = ctx

    el.addEventListener('click', ctx.handler)
    el.addEventListener('keyup', ctx.handlerKey)
  },

  update (el, { value, oldValue }) {
    if (el.__qclosepopup !== void 0 && oldValue !== value) {
      el.__qclosepopup.depth = getDepth(value)
    }
  },

  unbind (el) {
    if (el.__qclosepopup_destroyed === void 0) {
      destroy(el)
    }
    else {
      delete el.__qclosepopup_destroyed
    }
  }
}
