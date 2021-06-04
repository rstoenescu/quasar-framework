import morph from '../utils/morph.js'

const morphGroups = {}
const mods = [
  'resize', 'useCSS', 'hideFromClone', 'keepToClone', 'tween'
]
const props = [
  'duration', 'delay', 'easing', 'fill',
  'classes', 'style', 'duration',
  'tweenFromOpacity', 'tweenToOpacity',
  'waitFor', 'onEnd'
]

function changeClass (ctx, action) {
  if (ctx.clsAction !== action) {
    ctx.clsAction = action
    ctx.el.classList[action]('q-morph--invisible')
  }
}

function trigger (group) {
  if (group.animating === true || group.queue.length < 2) {
    return
  }

  const [ from, to ] = group.queue

  group.animating = true
  from.animating = true
  to.animating = true

  changeClass(from, 'remove')
  changeClass(to, 'remove')

  const cancelFn = morph({
    from: from.el,
    to: to.el,
    onToggle () {
      changeClass(from, 'add')
      changeClass(to, 'remove')
    },
    ...to.opts,
    onEnd (dir, aborted) {
      to.opts.onEnd !== void 0 && to.opts.onEnd(dir, aborted)

      if (aborted === true) {
        return
      }

      from.animating = false
      to.animating = false

      group.animating = false
      group.cancel = void 0
      group.queue.shift()

      trigger(group)
    }
  })

  group.cancel = () => {
    cancelFn(true) // abort
    group.cancel = void 0
  }
}

function changeModel (ctx, name) {
  if (ctx.name === name) {
    const group = morphGroups[ctx.group]

    // if group is not registered
    if (group === void 0) {
      morphGroups[ctx.group] = {
        name: ctx.group,
        model: name,
        queue: [ ctx ],
        animating: false
      }

      changeClass(ctx, 'remove')
    }
    // if model changed
    else if (group.model !== name) {
      group.model = name
      group.queue.push(ctx)

      if (group.animating === false && group.queue.length === 2) {
        trigger(group)
      }
    }

    return
  }

  if (ctx.animating === false) {
    changeClass(ctx, 'add')
  }
}

function setOptsFromValue (ctx, value) {
  if (value.group !== void 0) {
    ctx.group = value.group
  }
  if (value.name !== void 0) {
    ctx.name = value.name
  }

  const opts = ctx.opts

  props.forEach(name => {
    if (value[name] !== void 0) {
      opts[name] = value[name]
    }
  })
}

function updateArg (ctx, arg) {
  const opts = typeof arg === 'string' && arg.length > 0
    ? arg.split(':') : []

  ctx.name = opts[0]
  ctx.group = opts[1]

  Object.assign(ctx.opts, {
    duration: isNaN(opts[2]) === true
      ? 300
      : parseFloat(opts[2]),
    waitFor: opts[3]
  })
}

function updateModifiers (ctx, modifiers) {
  const opts = ctx.opts

  mods.forEach(name => {
    opts[name] = modifiers[name] === true
  })
}

function updateValue (ctx, value) {
  let model

  if (Object(value) === value) {
    model = '' + value.model
    setOptsFromValue(ctx, value)
    updateModifiers(ctx, value)
  }
  else {
    model = '' + value
  }

  if (model !== ctx.model) {
    ctx.model = model
    changeModel(ctx, model)
  }
  else if (ctx.animating === false && ctx.clsAction !== void 0) {
    // ensure HMR
    ctx.el.classList[ctx.clsAction]('q-morph--invisible')
  }
}

function destroy (el) {
  const ctx = el.__qmorph

  if (ctx !== void 0) {
    const group = morphGroups[ctx.group]

    if (group !== void 0) {
      const index = group.queue.indexOf(ctx)

      if (index !== -1) {
        group.queue = group.queue.filter(item => item !== ctx)

        if (group.queue.length === 0) {
          group.cancel !== void 0 && group.cancel()
          delete morphGroups[ctx.group]
        }
      }
    }

    if (ctx.clsAction === 'add') {
      el.classList.remove('q-morph--invisible')
    }

    delete el.__qmorph
  }
}

export default {
  name: 'morph',

  inserted (el, { modifiers, arg, value }) {
    if (el.__qmorph !== void 0) {
      destroy(el)
      el.__qmorph_destroyed = true
    }

    const ctx = {
      el,

      arg,

      animating: false,
      opts: {}
    }

    updateModifiers(ctx, modifiers)
    updateArg(ctx, arg)
    updateValue(ctx, value)

    el.__qmorph = ctx
  },

  update (el, { modifiers, arg, value }) {
    const ctx = el.__qmorph
    if (ctx !== void 0) {
      updateModifiers(ctx, modifiers)
      if (ctx.arg !== arg) {
        updateArg(ctx, arg)
      }
      updateValue(ctx, value)
    }
  },

  unbind (el) {
    if (el.__qmorph_destroyed === void 0) {
      destroy(el)
    }
    else {
      delete el.__qmorph_destroyed
    }
  }
}
