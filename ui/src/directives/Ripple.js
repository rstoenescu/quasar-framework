import { css } from '../utils/dom.js'
import { position, stop, addEvt, cleanEvt, listenOpts } from '../utils/event.js'
import { getTouchTarget } from '../utils/touch.js'
import { isKeyCode } from '../utils/key-composition.js'
import { client } from '../plugins/Platform.js'
import { $q } from '../install.js'

const { passiveCapture } = listenOpts

function startPhase1 (evtStart, el, ctx, forceCenter) {
  ctx.modifiers.stop === true && stop(evtStart)

  const
    { color, early } = ctx.modifiers,
    center = ctx.modifiers.center === true || forceCenter === true,
    node = document.createElement('span'),
    innerNode = document.createElement('span'),
    pos = position(evtStart),
    { left, top, width, height } = el.getBoundingClientRect(),
    diameter = Math.sqrt(width * width + height * height),
    radius = diameter / 2,
    centerX = `${(width - diameter) / 2}px`,
    x = center ? centerX : `${pos.left - left - radius}px`,
    centerY = `${(height - diameter) / 2}px`,
    y = center ? centerY : `${pos.top - top - radius}px`,
    delay = Date.now() + 300

  innerNode.className = 'q-ripple__inner'
  css(innerNode, {
    height: `${diameter}px`,
    width: `${diameter}px`,
    transform: `translate3d(${x},${y},0) scale3d(.2,.2,1)`,
    opacity: 0
  })

  node.className = `q-ripple${color ? ' text-' + color : ''}`
  node.setAttribute('dir', 'ltr')
  node.appendChild(innerNode)
  el.appendChild(node)

  let timer, startPhase2, eventSource, target, waitForScroll

  const abort = () => {
    clearTimeout(timer)

    const index = ctx.abort.indexOf(abort)
    if (index > -1) {
      ctx.abort.splice(index, 1)
      node.remove()

      switch (eventSource) {
        case 'mouse':
          document.removeEventListener('mouseup', startPhase2, passiveCapture)
          el.removeEventListener('mouseout', startPhase2, passiveCapture)
          break
        case 'keyboard':
          document.removeEventListener('keyup', startPhase2, passiveCapture)
          break
        case 'touch':
          target.removeEventListener('touchmove', abort, passiveCapture)
          target.removeEventListener('touchmove', startPhase2, passiveCapture)
          target.removeEventListener('touchend', startPhase2, passiveCapture)
          target.removeEventListener('touchcancel', startPhase2, passiveCapture)
          ctx.preventMouse--
          break
      }
    }
  }
  ctx.abort.push(abort)

  const phase2 = () => {
    if (waitForScroll !== true) {
      innerNode.classList.remove('q-ripple__inner--enter')
      innerNode.classList.add('q-ripple__inner--leave')
      innerNode.style.opacity = 0

      timer = setTimeout(abort, 275)
    }
  }

  if (early === true) {
    if (evtStart.type.indexOf('mouse') === 0) {
      eventSource = 'mouse'

      startPhase2 = evtEnd => {
        if (
          evtEnd.type !== 'mouseout' ||
          el.contains(evtEnd.toElement) !== true
        ) {
          timer = setTimeout(phase2, delay - Date.now())
        }
      }

      document.addEventListener('mouseup', startPhase2, passiveCapture)
      el.addEventListener('mouseout', startPhase2, passiveCapture)
    }
    else if (evtStart.type.indexOf('key') === 0) {
      eventSource = 'keyboard'
      ctx.preventKeyboard = true

      startPhase2 = () => {
        ctx.preventKeyboard = false
        timer = setTimeout(phase2, delay - Date.now())
      }

      document.addEventListener('keyup', startPhase2, passiveCapture)
    }
    else {
      eventSource = 'touch'
      waitForScroll = true
      target = getTouchTarget(evtStart.target)
      ctx.preventMouse++

      startPhase2 = evtEnd => {
        if (
          evtEnd.type !== 'touchmove' ||
          evtEnd.changedTouches.length === 0 ||
          el.contains(document.elementFromPoint(evtEnd.changedTouches[0].clientX, evtEnd.changedTouches[0].clientY)) !== true
        ) {
          timer = setTimeout(phase2, delay - Date.now())
        }
      }

      target.addEventListener('touchmove', abort, passiveCapture)
      target.addEventListener('touchmove', startPhase2, passiveCapture)
      target.addEventListener('touchend', startPhase2, passiveCapture)
      target.addEventListener('touchcancel', startPhase2, passiveCapture)
    }
  }

  timer = setTimeout(() => {
    if (waitForScroll === true) {
      waitForScroll = void 0
      target.removeEventListener('touchmove', abort, passiveCapture)
    }

    innerNode.classList.add('q-ripple__inner--enter')
    innerNode.style.transform = `translate3d(${centerX},${centerY},0) scale3d(1,1,1)`
    innerNode.style.opacity = 0.2

    if (early !== true) {
      timer = setTimeout(phase2, delay - Date.now())
    }
  }, waitForScroll === true ? 70 : 50) // allow a longer delay to catch scroll
}

function updateCtx (ctx, el, { modifiers, arg, value }) {
  ctx.enabled = value !== false

  if (ctx.enabled === true) {
    const cfg = Object.assign({}, $q.config.ripple, modifiers, value)
    const earlyChanged = ctx.modifiers.early === void 0 || ctx.modifiers.early !== cfg.early

    ctx.modifiers = {
      early: cfg.early === true,
      stop: cfg.stop === true,
      center: cfg.center === true,
      color: cfg.color || arg,
      keyCodes: [].concat(cfg.keyCodes || 13)
    }

    if (earlyChanged === true) {
      cleanEvt(ctx, 'main')

      if (cfg.early === true) {
        addEvt(ctx, 'main', [
          [ el, 'mousedown', 'start', 'passive' ],
          [ el, 'touchstart', 'start', 'passive' ],
          [ el, 'keydown', 'keystart', 'passive' ]
        ])
      }
      else {
        addEvt(ctx, 'main', [
          [ el, 'click', 'start', 'passive' ],
          [ el, 'keyup', 'keystart', 'passive' ]
        ])
      }
    }
  }
  else {
    ctx.abort.slice().forEach(fn => { fn() })
    cleanEvt(ctx, 'main')
    ctx.preventMouse = 0
    ctx.preventKeyboard = false
  }
}

export default {
  name: 'ripple',

  inserted (el, binding) {
    const ctx = {
      modifiers: {},
      abort: [],
      preventMouse: 0,
      preventKeyboard: false,

      start (evt) {
        if (
          ctx.enabled === true &&
          evt.qSkipRipple !== true &&
          (evt.type !== 'mousedown' || ctx.preventMouse === 0) &&
          // on ENTER in form IE emits a PointerEvent with negative client cordinates
          (client.is.ie !== true || evt.clientX >= 0)
        ) {
          startPhase1(evt, el, ctx, $q.interaction.isKeyboard)
        }
      },

      keystart (evt) {
        if (
          ctx.preventKeyboard !== true &&
          ctx.enabled === true &&
          evt.qSkipRipple !== true &&
          isKeyCode(evt, ctx.modifiers.keyCodes) === true
        ) {
          startPhase1(evt, el, ctx, true)
        }
      }
    }

    updateCtx(ctx, el, binding)

    if (el.__qripple) {
      el.__qripple_old = el.__qripple
    }

    el.__qripple = ctx
  },

  update (el, binding) {
    el.__qripple !== void 0 && updateCtx(el.__qripple, el, binding)
  },

  unbind (el) {
    const ctx = el.__qripple_old || el.__qripple
    if (ctx !== void 0) {
      ctx.abort.slice().forEach(fn => { fn() })
      cleanEvt(ctx, 'main')
      delete el[el.__qripple_old ? '__qripple_old' : '__qripple']
    }
  }
}
