import { isDeepEqual } from '../utils/is.js'

const defaultCfg = {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true
}

function update (el, ctx, value) {
  ctx.handler = value
  ctx.observer !== void 0 && ctx.observer.disconnect()

  ctx.observer = new MutationObserver(list => {
    if (typeof ctx.handler === 'function') {
      const res = ctx.handler(list)
      if (res === false || ctx.once === true) {
        destroy(el)
      }
    }
  })

  ctx.observer.observe(el, ctx.opts)
}

function destroy (el) {
  const ctx = el.__qmutation

  if (ctx !== void 0) {
    ctx.observer !== void 0 && ctx.observer.disconnect()
    delete el.__qmutation
  }
}

export default {
  name: 'mutation',

  inserted (el, { modifiers: { once, ...opts }, value }) {
    if (el.__qmutation !== void 0) {
      destroy(el)
      el.__qmutation_destroyed = true
    }

    const ctx = {
      once
    }

    ctx.opts = Object.keys(opts).length === 0
      ? defaultCfg
      : opts
    update(el, ctx, value)

    el.__qmutation = ctx
  },

  update (el, { modifiers: { once, ...opts }, value, oldValue }) {
    const ctx = el.__qmutation
    if (ctx !== void 0) {
      const newOpts = Object.keys(opts).length === 0
        ? defaultCfg
        : opts
      if (
        oldValue !== value ||
        isDeepEqual(ctx.opts, newOpts) !== true
      ) {
        ctx.opts = newOpts
        update(el, ctx, value)
      }
    }
  },

  unbind (el) {
    if (el.__qmutation_destroyed === void 0) {
      destroy(el)
    }
    else {
      delete el.__qmutation_destroyed
    }
  }
}
