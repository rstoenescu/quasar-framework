import { client } from '../plugins/Platform.js'
import { isDeepEqual } from '../utils/is.js'
import { getTouchTarget } from '../utils/touch.js'
import { addEvt, cleanEvt, position, leftClick, stopAndPrevent, noop } from '../utils/event.js'
import { clearSelection } from '../utils/selection.js'

function parseArg (arg) {
  // duration in ms, touch in pixels, mouse in pixels
  const data = [600, 5, 7]

  if (typeof arg === 'string' && arg.length > 0) {
    arg.split(':').forEach((val, index) => {
      const v = parseInt(val, 10)
      v && (data[index] = v)
    })
  }

  return {
    duration: data[0],
    touchSensitivity: data[1],
    mouseSensitivity: data[2]
  }
}

function destroy (el) {
  const ctx = el.__qtouchhold
  if (ctx !== void 0) {
    cleanEvt(ctx, 'main')
    cleanEvt(ctx, 'temp')

    clearTimeout(ctx.timer)
    ctx.styleCleanup !== void 0 && ctx.styleCleanup()

    delete el.__qtouchhold
  }
}

function configureEvents (el, ctx, modifiers) {
  if (ctx.modifiers.mouse !== modifiers.mouse || ctx.modifiers.mouseCapture !== modifiers.mouseCapture) {
    ctx.modifiers.mouse === true && cleanEvt(ctx, 'main_mouse')

    modifiers.mouse === true && addEvt(ctx, 'main_mouse', [
      [ el, 'mousedown', 'mouseStart', `passive${modifiers.mouseCapture === true ? 'Capture' : ''}` ]
    ])
  }

  if (client.has.touch === true && ctx.modifiers.capture !== modifiers.capture) {
    cleanEvt(ctx, 'main_touch')

    addEvt(ctx, 'main_touch', [
      [ el, 'touchstart', 'touchStart', `passive${modifiers.capture === true ? 'Capture' : ''}` ],
      [ el, 'touchmove', 'noop', `notPassiveCapture` ]
    ])
  }

  ctx.modifiers = modifiers
}

export default {
  name: 'touch-hold',

  bind (el, { modifiers, arg, value }) {
    if (el.__qtouchhold !== void 0) {
      destroy(el)
      el.__qtouchhold_destroyed = true
    }

    const ctx = {
      handler: value,
      arg,
      modifiers: { capture: null }, // make sure touch listeners are initiated

      ...parseArg(arg),

      noop,

      mouseStart (evt) {
        if (typeof ctx.handler === 'function' && leftClick(evt) === true) {
          addEvt(ctx, 'temp', [
            [document, 'mousemove', 'move', 'passiveCapture'],
            [document, 'click', 'end', 'notPassiveCapture']
          ])
          ctx.start(evt, true)
        }
      },

      touchStart (evt) {
        if (evt.target !== void 0 && typeof ctx.handler === 'function') {
          const target = getTouchTarget(evt.target)
          addEvt(ctx, 'temp', [
            [target, 'touchmove', 'move', 'passiveCapture'],
            [target, 'touchcancel', 'end', 'notPassiveCapture'],
            [target, 'touchend', 'end', 'notPassiveCapture']
          ])
          ctx.start(evt)
        }
      },

      start (evt, mouseEvent) {
        ctx.origin = position(evt)

        const startTime = Date.now()

        if (client.is.mobile === true) {
          document.body.classList.add('non-selectable')
          clearSelection()

          ctx.styleCleanup = withDelay => {
            ctx.styleCleanup = void 0

            const remove = () => {
              document.body.classList.remove('non-selectable')
            }

            if (withDelay === true) {
              clearSelection()
              setTimeout(remove, 10)
            }
            else { remove() }
          }
        }

        ctx.triggered = false
        ctx.sensitivity = mouseEvent === true
          ? ctx.mouseSensitivity
          : ctx.touchSensitivity

        ctx.timer = setTimeout(() => {
          clearSelection()
          ctx.triggered = true

          ctx.handler({
            evt,
            touch: mouseEvent !== true,
            mouse: mouseEvent === true,
            position: ctx.origin,
            duration: Date.now() - startTime
          })
        }, ctx.duration)
      },

      move (evt) {
        const { top, left } = position(evt)
        if (
          Math.abs(left - ctx.origin.left) >= ctx.sensitivity ||
          Math.abs(top - ctx.origin.top) >= ctx.sensitivity
        ) {
          clearTimeout(ctx.timer)
        }
      },

      end (evt) {
        cleanEvt(ctx, 'temp')

        // delay needed otherwise selection still occurs
        ctx.styleCleanup !== void 0 && ctx.styleCleanup(ctx.triggered)

        if (ctx.triggered === true) {
          evt !== void 0 && stopAndPrevent(evt)
        }
        else {
          clearTimeout(ctx.timer)
        }
      }
    }

    el.__qtouchhold = ctx

    configureEvents(el, ctx, modifiers)
  },

  update (el, { modifiers, arg, value, oldValue }) {
    const ctx = el.__qtouchhold
    if (ctx !== void 0) {
      if (oldValue !== value) {
        typeof value !== 'function' && ctx.end()
        ctx.handler = value
      }

      if (ctx.arg !== arg) {
        Object.assign(ctx, parseArg(arg))
      }

      if (isDeepEqual(ctx.modifiers, modifiers) !== true) {
        configureEvents(el, ctx, modifiers)
      }
    }
  },

  unbind (el) {
    if (el.__qtouchhold_destroyed === void 0) {
      destroy(el)
    }
    else {
      delete el.__qtouchhold_destroyed
    }
  }
}
