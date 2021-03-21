import Interaction from '../plugins/Interaction.js'
import { stop, prevent, addEvt, cleanEvt, getEventPath } from '../utils/event.js'
import {
  FOCUSABLE_SELECTOR,
  KEY_SKIP_SELECTOR,
  changeFocusedElement
} from '../utils/focus.js'

const keyCodes = {
  horizontal: {
    first: [ 36 ], // HOME
    prev: [ 37 ], // ARROW_LEFT
    next: [ 39 ], // ARROW_RIGHT
    last: [ 35 ] // END
  },
  vertical: {
    first: [ 33 ], // PG_UP
    prev: [ 38 ], // ARROW_UP
    next: [ 40 ], // ARROW_DOWN
    last: [ 34 ] // PG_DOWN
  }
}

keyCodes.all = Object.keys(keyCodes.horizontal).reduce((acc, key) => ({
  ...acc,
  [key]: keyCodes.horizontal[key].concat(keyCodes.vertical[key])
}), {})

keyCodes.horizontal.list = Object.keys(keyCodes.horizontal).reduce((acc, k) => acc.concat(keyCodes.horizontal[k]), [])
keyCodes.horizontal.listH = keyCodes.horizontal.list
keyCodes.vertical.list = Object.keys(keyCodes.vertical).reduce((acc, k) => acc.concat(keyCodes.vertical[k]), [])
keyCodes.vertical.listH = []
keyCodes.all.list = Object.keys(keyCodes.all).reduce((acc, k) => acc.concat(keyCodes.all[k]), [])
keyCodes.all.listH = keyCodes.horizontal.list

function matchNavigationKeyIgnoreEl (el) {
  return el.classList.contains('q-key-group-navigation--ignore-key') === true
}

function createFocusTargets (ctx) {
  const target = document.createElement('span')
  target.setAttribute('tabindex', -1)
  target.classList.add('no-outline')
  target.classList.add('absolute')
  target.classList.add('no-pointer-events')

  ctx.firstTarget = target
  ctx.lastTarget = target.cloneNode()
  ctx.lastTarget.setAttribute('tabindex', -1)
}

function addFocusTargets (ctx, el) {
  el.appendChild(ctx.lastTarget)

  if (el.childElementCount > 0) {
    el.insertBefore(ctx.firstTarget, el.childNodes[0])
  }
  else {
    el.appendChild(ctx.firstTarget)
  }
}

function removeFocusTargets (ctx) {
  ctx.firstTarget !== void 0 && ctx.firstTarget.remove()
  ctx.lastTarget !== void 0 && ctx.lastTarget.remove()
}

function parseArg (ctx, arg) {
  const data = [ 1, 1, 'q-key-group-navigation--active' ]

  if (typeof arg === 'string' && arg.length) {
    const splits = arg.split(':')

    for (let i = 0; i < 2; i++) {
      const v = parseInt(splits[i], 10)
      v && (data[i] = v)
    }

    if (typeof splits[3] === 'string' && splits[3].length > 0) {
      data[3] = splits[3]
    }
  }

  return {
    offsetY: data[0],
    offsetX: data[1],
    activeClass: data[2]
  }
}

function configureEvents (el, ctx, modifiers, value) {
  if (modifiers.vertical === true) {
    ctx.keyCodes = keyCodes.vertical
  }
  else {
    ctx.keyCodes = modifiers.horizontal === true
      ? keyCodes.horizontal
      : keyCodes.all
  }

  const enabled = [false, 0, '0'].indexOf(value) === -1

  if (ctx.enabled !== enabled) {
    ctx.enabled === true && cleanEvt(ctx, 'main')

    enabled === true && addEvt(ctx, 'main', [
      [ el, 'keydown', 'keyDown', 'capture' ],
      [ el, 'focusin', 'focusIn', 'capturePassive' ],
      [ el, 'focusout', 'focusOut', 'capturePassive' ],
      [ el, 'mousedown', 'setRestoreEl', 'capturePassive' ],
      [ el, 'touchstart', 'setRestoreEl', 'capturePassive' ]
    ])

    ctx.enabled = enabled
  }
}

export default {
  name: 'key-group-navigation',

  bind (el, { modifiers, arg, value }) {
    const ctx = {
      keyCodes: keyCodes.all,
      arg,
      modifiers: {},

      ...parseArg(arg),

      keyDown (evt) {
        const { keyCode, shiftKey, target } = evt

        if (
          (keyCode !== 9 && ctx.keyCodes.list.indexOf(keyCode) === -1) ||
          target.matches(KEY_SKIP_SELECTOR) === true
        ) {
          return
        }

        stop(evt)

        if (keyCode === 9) { // TAB
          addFocusTargets(ctx, el)

          if (shiftKey === true) {
            if (ctx.firstTarget !== void 0) {
              ctx.firstTarget.focus()
            }
            else {
              prevent(evt)
            }
          }
          else {
            if (ctx.lastTarget !== void 0) {
              ctx.lastTarget.focus()
            }
            else {
              prevent(evt)
            }
          }

          // required for IE11
          requestAnimationFrame(() => {
            removeFocusTargets(ctx)
          })

          return
        }

        const focusableElements = Array.prototype.slice.call(el.querySelectorAll(FOCUSABLE_SELECTOR))
        const lastElementIndex = focusableElements.length - 1

        if (lastElementIndex < 0) {
          return
        }

        if (ctx.keyCodes.first.indexOf(keyCode) > -1) {
          changeFocusedElement(focusableElements, 0, 1)
        }
        else if (ctx.keyCodes.last.indexOf(keyCode) > -1) {
          changeFocusedElement(focusableElements, lastElementIndex, -1)
        }
        else {
          const currentIndex = document.activeElement === null
            ? -1
            : focusableElements.indexOf(document.activeElement.closest(FOCUSABLE_SELECTOR))

          const offset = ctx.keyCodes.listH.indexOf(keyCode) === -1
            ? ctx.offsetY
            : ctx.offsetX

          if (ctx.keyCodes.prev.indexOf(keyCode) > -1) {
            changeFocusedElement(focusableElements, currentIndex - offset, -1, offset !== 1)
          }
          if (ctx.keyCodes.next.indexOf(keyCode) > -1) {
            changeFocusedElement(focusableElements, currentIndex + offset, 1, offset !== 1)
          }
        }

        ctx.focusRestoreEl = document.activeElement

        prevent(evt)
      },

      setRestoreEl (evt) {
        if (evt.target) {
          ctx.focusRestoreEl = evt.target
        }
      },

      focusIn (evt) {
        const active = Interaction.isKeyboard
        if (active === true) {
          const path = getEventPath(evt) // required for IE11
          const ignored = path.slice(0, path.indexOf(el)).find(matchNavigationKeyIgnoreEl) !== void 0

          if (ctx.active !== true && ignored !== true) {
            ctx.active = true
            el.classList.add(ctx.activeClass)
          }
          else if (ctx.active === true && ignored === true) {
            ctx.active = false
            el.classList.remove(ctx.activeClass)
          }
        }
        else if (active !== true && ctx.active === true) {
          ctx.active = false
          el.classList.remove(ctx.activeClass)
        }

        if (
          evt.target === ctx.firstTarget ||
          evt.target === ctx.lastTarget ||
          (
            evt.relatedTarget !== null &&
            (
              evt.relatedTarget._qKeyNavIgnore === true ||
              (
                evt.relatedTarget.classList !== void 0 && // required for IE11
                evt.relatedTarget.classList.contains('q-key-group-navigation--ignore-focus') === true
              )
            )
          )
        ) {
          return
        }

        if (
          ctx.focusRestoreEl === void 0 ||
          ctx.focusRestoreEl === null ||
          el.contains(evt.relatedTarget) === true
        ) {
          ctx.focusRestoreEl = document.activeElement
        }
        else {
          const focusedEl = ctx.focusRestoreEl.closest(FOCUSABLE_SELECTOR)

          if (focusedEl === null || typeof focusedEl.focus !== 'function') {
            if (typeof ctx.focusRestoreEl.focus === 'function') {
              ctx.focusRestoreEl.focus()
            }
          }
          else {
            focusedEl.focus()
          }
        }
      },

      focusOut (evt) {
        if (
          ctx.active === true &&
          (evt.relatedTarget === null || el.contains(evt.relatedTarget) === false)
        ) {
          ctx.active = false
          el.classList.remove(ctx.activeClass)
        }
      }
    }

    if (el.__qkeygrpnav) {
      el.__qkeygrpnav_old = el.__qkeygrpnav
    }

    el.__qkeygrpnav = ctx

    createFocusTargets(ctx)

    configureEvents(el, ctx, modifiers, value)
  },

  update (el, { modifiers, arg, value, oldValue }) {
    const ctx = el.__qkeygrpnav
    if (ctx !== void 0) {
      if (ctx.arg !== arg) {
        Object.assign(ctx, parseArg(arg))
      }

      configureEvents(el, ctx, modifiers, value)
    }
  },

  unbind (el) {
    const ctx = el.__qkeygrpnav_old || el.__qkeygrpnav
    if (ctx !== void 0) {
      removeFocusTargets(ctx)
      cleanEvt(ctx, 'main')
      ctx.active === true && el.classList.remove(ctx.activeClass)

      delete el[el.__qkeygrpnav_old ? '__qkeygrpnav_old' : '__qkeygrpnav']
    }
  }
}
