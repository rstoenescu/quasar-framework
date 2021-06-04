import { client } from '../plugins/Platform.js'
import { isDeepEqual } from '../utils/is.js'
import { getModifierDirections, getTouchTarget, shouldStart } from '../utils/touch.js'
import { addEvt, cleanEvt, position, leftClick, stopAndPrevent, preventDraggable, noop } from '../utils/event.js'
import { clearSelection } from '../utils/selection.js'

function parseArg (arg) {
  // delta (min velocity -- dist / time)
  // mobile min distance on first move
  // desktop min distance until deciding if it's a swipe or not
  const data = [0.06, 6, 50]

  if (typeof arg === 'string' && arg.length) {
    arg.split(':').forEach((val, index) => {
      const v = parseFloat(val)
      v && (data[index] = v)
    })
  }

  return data
}

function destroy (el) {
  const ctx = el.__qtouchswipe

  if (ctx !== void 0) {
    cleanEvt(ctx, 'main_mouse')
    cleanEvt(ctx, 'main_touch')
    cleanEvt(ctx, 'temp')

    client.is.firefox === true && preventDraggable(el, false)
    ctx.styleCleanup !== void 0 && ctx.styleCleanup()

    delete el.__qtouchswipe
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
  name: 'touch-swipe',

  bind (el, { modifiers, arg, value }) {
    if (el.__qtouchswipe !== void 0) {
      destroy(el)
      el.__qtouchswipe_destroyed = true
    }

    const ctx = {
      handler: value,
      sensitivity: parseArg(arg),
      arg,
      modifiers: { capture: null }, // make sure touch listeners are initiated
      direction: getModifierDirections(modifiers),

      noop,

      mouseStart (evt) {
        if (shouldStart(evt, ctx) && leftClick(evt)) {
          addEvt(ctx, 'temp', [
            [ document, 'mousemove', 'move', `notPassive${ctx.modifiers.mouseCapture === true ? 'Capture' : ''}` ],
            [ document, 'mouseup', 'end', 'notPassiveCapture' ]
          ])
          ctx.start(evt, true)
        }
      },

      touchStart (evt) {
        if (shouldStart(evt, ctx)) {
          const target = getTouchTarget(evt.target)
          addEvt(ctx, 'temp', [
            [ target, 'touchmove', 'move', 'notPassiveCapture' ],
            [ target, 'touchcancel', 'end', 'notPassiveCapture' ],
            [ target, 'touchend', 'end', 'notPassiveCapture' ]
          ])
          ctx.start(evt)
        }
      },

      start (evt, mouseEvent) {
        client.is.firefox === true && preventDraggable(el, true)

        const pos = position(evt)

        ctx.event = {
          x: pos.left,
          y: pos.top,
          time: Date.now(),
          mouse: mouseEvent === true,
          dir: false
        }
      },

      move (evt) {
        if (ctx.event === void 0) {
          return
        }

        if (ctx.event.dir !== false) {
          stopAndPrevent(evt)
          return
        }

        const time = Date.now() - ctx.event.time

        if (time === 0) {
          return
        }

        const
          pos = position(evt),
          distX = pos.left - ctx.event.x,
          absX = Math.abs(distX),
          distY = pos.top - ctx.event.y,
          absY = Math.abs(distY)

        if (ctx.event.mouse !== true) {
          if (absX < ctx.sensitivity[1] && absY < ctx.sensitivity[1]) {
            ctx.end(evt)
            return
          }
        }
        else if (absX < ctx.sensitivity[2] && absY < ctx.sensitivity[2]) {
          return
        }

        const
          velX = absX / time,
          velY = absY / time

        if (
          ctx.direction.vertical === true &&
          absX < absY &&
          absX < 100 &&
          velY > ctx.sensitivity[0]
        ) {
          ctx.event.dir = distY < 0 ? 'up' : 'down'
        }

        if (
          ctx.direction.horizontal === true &&
          absX > absY &&
          absY < 100 &&
          velX > ctx.sensitivity[0]
        ) {
          ctx.event.dir = distX < 0 ? 'left' : 'right'
        }

        if (
          ctx.direction.up === true &&
          absX < absY &&
          distY < 0 &&
          absX < 100 &&
          velY > ctx.sensitivity[0]
        ) {
          ctx.event.dir = 'up'
        }

        if (
          ctx.direction.down === true &&
          absX < absY &&
          distY > 0 &&
          absX < 100 &&
          velY > ctx.sensitivity[0]
        ) {
          ctx.event.dir = 'down'
        }

        if (
          ctx.direction.left === true &&
          absX > absY &&
          distX < 0 &&
          absY < 100 &&
          velX > ctx.sensitivity[0]
        ) {
          ctx.event.dir = 'left'
        }

        if (
          ctx.direction.right === true &&
          absX > absY &&
          distX > 0 &&
          absY < 100 &&
          velX > ctx.sensitivity[0]
        ) {
          ctx.event.dir = 'right'
        }

        if (ctx.event.dir !== false) {
          stopAndPrevent(evt)

          if (ctx.event.mouse === true) {
            document.body.classList.add('no-pointer-events--children')
            document.body.classList.add('non-selectable')
            clearSelection()

            ctx.styleCleanup = withDelay => {
              ctx.styleCleanup = void 0

              document.body.classList.remove('non-selectable')

              const remove = () => {
                document.body.classList.remove('no-pointer-events--children')
              }

              if (withDelay === true) { setTimeout(remove, 50) }
              else { remove() }
            }
          }

          ctx.handler({
            evt,
            touch: ctx.event.mouse !== true,
            mouse: ctx.event.mouse,
            direction: ctx.event.dir,
            duration: time,
            distance: {
              x: absX,
              y: absY
            }
          })
        }
        else {
          ctx.end(evt)
        }
      },

      end (evt) {
        if (ctx.event === void 0) {
          return
        }

        cleanEvt(ctx, 'temp')
        client.is.firefox === true && preventDraggable(el, false)
        ctx.styleCleanup !== void 0 && ctx.styleCleanup(true)
        evt !== void 0 && ctx.event.dir !== false && stopAndPrevent(evt)

        ctx.event = void 0
      }
    }

    el.__qtouchswipe = ctx

    configureEvents(el, ctx, modifiers)
  },

  update (el, { modifiers, arg, value, oldValue }) {
    const ctx = el.__qtouchswipe
    if (ctx !== void 0) {
      if (oldValue !== value) {
        typeof value !== 'function' && ctx.end()
        ctx.handler = value
      }

      if (ctx.arg !== arg) {
        ctx.sensitivity = parseArg(arg)
      }

      if (isDeepEqual(ctx.modifiers, modifiers) !== true) {
        configureEvents(el, ctx, modifiers)

        ctx.direction = getModifierDirections(modifiers)
      }
    }
  },

  unbind (el) {
    if (el.__qtouchswipe_destroyed === void 0) {
      destroy(el)
    }
    else {
      delete el.__qtouchswipe_destroyed
    }
  }
}
