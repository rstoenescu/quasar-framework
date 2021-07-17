import { h, defineComponent, ref, computed, watch, nextTick, getCurrentInstance } from 'vue'

import TouchPan from '../../directives/TouchPan.js'

import QSlider from '../slider/QSlider.js'
import QIcon from '../icon/QIcon.js'

import QTabs from '../tabs/QTabs.js'
import QTab from '../tabs/QTab.js'
import QTabPanels from '../tab-panels/QTabPanels.js'
import QTabPanel from '../tab-panels/QTabPanel.js'

import useDark, { useDarkProps } from '../../composables/private/use-dark.js'
import useCache from '../../composables/private/use-cache.js'
import { useFormInject, useFormProps } from '../../composables/private/use-form.js'

import { testPattern } from '../../utils/patterns.js'
import throttle from '../../utils/throttle.js'
import { stop } from '../../utils/event.js'
import { hexToRgb, rgbToHex, rgbToString, textToRgb, rgbToHsv, hsvToRgb, luminosity } from '../../utils/colors.js'
import { hDir } from '../../utils/private/render.js'

const palette = [
  'rgb(255,204,204)', 'rgb(255,230,204)', 'rgb(255,255,204)', 'rgb(204,255,204)', 'rgb(204,255,230)', 'rgb(204,255,255)', 'rgb(204,230,255)', 'rgb(204,204,255)', 'rgb(230,204,255)', 'rgb(255,204,255)',
  'rgb(255,153,153)', 'rgb(255,204,153)', 'rgb(255,255,153)', 'rgb(153,255,153)', 'rgb(153,255,204)', 'rgb(153,255,255)', 'rgb(153,204,255)', 'rgb(153,153,255)', 'rgb(204,153,255)', 'rgb(255,153,255)',
  'rgb(255,102,102)', 'rgb(255,179,102)', 'rgb(255,255,102)', 'rgb(102,255,102)', 'rgb(102,255,179)', 'rgb(102,255,255)', 'rgb(102,179,255)', 'rgb(102,102,255)', 'rgb(179,102,255)', 'rgb(255,102,255)',
  'rgb(255,51,51)', 'rgb(255,153,51)', 'rgb(255,255,51)', 'rgb(51,255,51)', 'rgb(51,255,153)', 'rgb(51,255,255)', 'rgb(51,153,255)', 'rgb(51,51,255)', 'rgb(153,51,255)', 'rgb(255,51,255)',
  'rgb(255,0,0)', 'rgb(255,128,0)', 'rgb(255,255,0)', 'rgb(0,255,0)', 'rgb(0,255,128)', 'rgb(0,255,255)', 'rgb(0,128,255)', 'rgb(0,0,255)', 'rgb(128,0,255)', 'rgb(255,0,255)',
  'rgb(245,0,0)', 'rgb(245,123,0)', 'rgb(245,245,0)', 'rgb(0,245,0)', 'rgb(0,245,123)', 'rgb(0,245,245)', 'rgb(0,123,245)', 'rgb(0,0,245)', 'rgb(123,0,245)', 'rgb(245,0,245)',
  'rgb(214,0,0)', 'rgb(214,108,0)', 'rgb(214,214,0)', 'rgb(0,214,0)', 'rgb(0,214,108)', 'rgb(0,214,214)', 'rgb(0,108,214)', 'rgb(0,0,214)', 'rgb(108,0,214)', 'rgb(214,0,214)',
  'rgb(163,0,0)', 'rgb(163,82,0)', 'rgb(163,163,0)', 'rgb(0,163,0)', 'rgb(0,163,82)', 'rgb(0,163,163)', 'rgb(0,82,163)', 'rgb(0,0,163)', 'rgb(82,0,163)', 'rgb(163,0,163)',
  'rgb(92,0,0)', 'rgb(92,46,0)', 'rgb(92,92,0)', 'rgb(0,92,0)', 'rgb(0,92,46)', 'rgb(0,92,92)', 'rgb(0,46,92)', 'rgb(0,0,92)', 'rgb(46,0,92)', 'rgb(92,0,92)',
  'rgb(255,255,255)', 'rgb(205,205,205)', 'rgb(178,178,178)', 'rgb(153,153,153)', 'rgb(127,127,127)', 'rgb(102,102,102)', 'rgb(76,76,76)', 'rgb(51,51,51)', 'rgb(25,25,25)', 'rgb(0,0,0)'
]

const thumbPath = 'M5 5 h10 v10 h-10 v-10 z'

export default defineComponent({
  name: 'QColor',

  props: {
    ...useDarkProps,
    ...useFormProps,

    modelValue: String,

    defaultValue: String,
    defaultView: {
      type: String,
      default: 'spectrum',
      validator: v => [ 'spectrum', 'tune', 'palette' ].includes(v)
    },

    formatModel: {
      type: String,
      default: 'auto',
      validator: v => [ 'auto', 'hex', 'rgb', 'hexa', 'rgba' ].includes(v)
    },

    palette: Array,

    noHeader: Boolean,
    noFooter: Boolean,

    square: Boolean,
    flat: Boolean,
    bordered: Boolean,

    disable: Boolean,
    readonly: Boolean
  },

  emits: [ 'update:modelValue', 'change' ],

  setup (props, { emit }) {
    const { proxy } = getCurrentInstance()
    const { $q } = proxy

    const isDark = useDark(props, $q)
    const { getCache } = useCache()

    const spectrumRef = ref(null)
    const errorIconRef = ref(null)

    const forceHex = computed(() => (
      props.formatModel === 'auto'
        ? null
        : props.formatModel.indexOf('hex') > -1
    ))

    const forceAlpha = computed(() => (
      props.formatModel === 'auto'
        ? null
        : props.formatModel.indexOf('a') > -1
    ))

    const topView = ref(
      props.formatModel === 'auto'
        ? (
            (props.modelValue === void 0 || props.modelValue === null || props.modelValue === '' || props.modelValue.startsWith('#'))
              ? 'hex'
              : 'rgb'
          )
        : (props.formatModel.startsWith('hex') ? 'hex' : 'rgb')
    )

    const view = ref(props.defaultView)
    const model = ref(parseModel(props.modelValue || props.defaultValue))

    const editable = computed(() => props.disable !== true && props.readonly !== true)

    const isHex = computed(() =>
      props.modelValue === void 0
      || props.modelValue === null
      || props.modelValue === ''
      || props.modelValue.startsWith('#')
    )

    const isOutputHex = computed(() => (
      forceHex.value !== null
        ? forceHex.value
        : isHex.value
    ))

    const formAttrs = computed(() => ({
      type: 'hidden',
      name: props.name,
      value: model.value[ isOutputHex.value === true ? 'hex' : 'rgb' ]
    }))

    const injectFormInput = useFormInject(formAttrs)

    const hasAlpha = computed(() => (
      forceAlpha.value !== null
        ? forceAlpha.value
        : model.value.a !== void 0
    ))

    const currentBgColor = computed(() => ({
      backgroundColor: model.value.rgb || '#000'
    }))

    const headerClass = computed(() => {
      const light = model.value.a !== void 0 && model.value.a < 65
        ? true
        : luminosity(model.value) > 0.4

      return 'q-color-picker__header-content absolute-full'
        + ` q-color-picker__header-content--${ light ? 'light' : 'dark' }`
    })

    const spectrumStyle = computed(() => ({
      background: `hsl(${ model.value.h },100%,50%)`
    }))

    const spectrumPointerStyle = computed(() => ({
      top: `${ 100 - model.value.v }%`,
      [ $q.lang.rtl === true ? 'right' : 'left' ]: `${ model.value.s }%`
    }))

    const computedPalette = computed(() => (
      props.palette !== void 0 && props.palette.length > 0
        ? props.palette
        : palette
    ))

    const classes = computed(() =>
      'q-color-picker'
      + (props.bordered === true ? ' q-color-picker--bordered' : '')
      + (props.square === true ? ' q-color-picker--square no-border-radius' : '')
      + (props.flat === true ? ' q-color-picker--flat no-shadow' : '')
      + (props.disable === true ? ' disabled' : '')
      + (isDark.value === true ? ' q-color-picker--dark q-dark' : '')
    )

    const attributes = computed(() => {
      if (props.disable === true) {
        return { 'aria-disabled': 'true' }
      }
      if (props.readonly === true) {
        return { 'aria-readonly': 'true' }
      }
      return {}
    })

    const spectrumDirective = computed(() => {
      // if editable.value === true
      return [ [
        TouchPan,
        onSpectrumPan,
        void 0,
        { prevent: true, stop: true, mouse: true }
      ] ]
    })

    watch(() => props.modelValue, v => {
      const localModel = parseModel(v || props.defaultValue)
      if (localModel.hex !== model.value.hex) {
        model.value = localModel
      }
    })

    watch(() => props.defaultValue, v => {
      if (!props.modelValue && v) {
        const localModel = parseModel(v)
        if (localModel.hex !== model.value.hex) {
          model.value = localModel
        }
      }
    })

    function updateModel (rgb, change) {
      // update internally
      model.value.hex = rgbToHex(rgb)
      model.value.rgb = rgbToString(rgb)
      model.value.r = rgb.r
      model.value.g = rgb.g
      model.value.b = rgb.b
      model.value.a = rgb.a

      const value = model.value[ isOutputHex.value === true ? 'hex' : 'rgb' ]

      // emit new value
      emit('update:modelValue', value)
      change === true && emit('change', value)
    }

    function parseModel (v) {
      const alpha = forceAlpha.value !== void 0
        ? forceAlpha.value
        : (
            props.formatModel === 'auto'
              ? null
              : props.formatModel.indexOf('a') > -1
          )

      if (typeof v !== 'string' || v.length === 0 || testPattern.anyColor(v.replace(/ /g, '')) !== true) {
        return {
          h: 0,
          s: 0,
          v: 0,
          r: 0,
          g: 0,
          b: 0,
          a: alpha === true ? 100 : void 0,
          hex: void 0,
          rgb: void 0
        }
      }

      const model = textToRgb(v)

      if (alpha === true && model.a === void 0) {
        model.a = 100
      }

      model.hex = rgbToHex(model)
      model.rgb = rgbToString(model)

      return Object.assign(model, rgbToHsv(model))
    }

    function changeSpectrum (left, top, change) {
      const panel = spectrumRef.value
      if (panel === null) { return }

      const
        width = panel.clientWidth,
        height = panel.clientHeight,
        rect = panel.getBoundingClientRect()

      let x = Math.min(width, Math.max(0, left - rect.left))

      if ($q.lang.rtl === true) {
        x = width - x
      }

      const
        y = Math.min(height, Math.max(0, top - rect.top)),
        s = Math.round(100 * x / width),
        v = Math.round(100 * Math.max(0, Math.min(1, -(y / height) + 1))),
        rgb = hsvToRgb({
          h: model.value.h,
          s,
          v,
          a: hasAlpha.value === true ? model.value.a : void 0
        })

      model.value.s = s
      model.value.v = v
      updateModel(rgb, change)
    }

    function onHueChange (val, change) {
      const h = Math.round(val)
      const rgb = hsvToRgb({
        h,
        s: model.value.s,
        v: model.value.v,
        a: hasAlpha.value === true ? model.value.a : void 0
      })

      model.value.h = h
      updateModel(rgb, change)
    }

    function onNumericChange (value, formatModel, max, evt, change) {
      evt !== void 0 && stop(evt)

      if (!/^[0-9]+$/.test(value)) {
        change === true && proxy.$forceUpdate()
        return
      }

      const val = Math.floor(Number(value))

      if (val < 0 || val > max) {
        change === true && proxy.$forceUpdate()
        return
      }

      const rgb = {
        r: formatModel === 'r' ? val : model.value.r,
        g: formatModel === 'g' ? val : model.value.g,
        b: formatModel === 'b' ? val : model.value.b,
        a: hasAlpha.value === true
          ? (formatModel === 'a' ? val : model.value.a)
          : void 0
      }

      if (formatModel !== 'a') {
        const hsv = rgbToHsv(rgb)
        model.value.h = hsv.h
        model.value.s = hsv.s
        model.value.v = hsv.v
      }

      updateModel(rgb, change)

      if (evt !== void 0 && change !== true && evt.target.selectionEnd !== void 0) {
        const index = evt.target.selectionEnd
        nextTick(() => {
          evt.target.setSelectionRange(index, index)
        })
      }
    }

    function onEditorChange (evt, change) {
      let rgb
      const inp = evt.target.value

      stop(evt)

      if (topView.value === 'hex') {
        if (
          inp.length !== (hasAlpha.value === true ? 9 : 7)
          || !/^#[0-9A-Fa-f]+$/.test(inp)
        ) {
          return true
        }

        rgb = hexToRgb(inp)
      }
      else {
        let model

        if (!inp.endsWith(')')) {
          return true
        }
        else if (hasAlpha.value !== true && inp.startsWith('rgb(')) {
          model = inp.substring(4, inp.length - 1).split(',').map(n => parseInt(n, 10))

          if (
            model.length !== 3
            || !/^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)$/.test(inp)
          ) {
            return true
          }
        }
        else if (hasAlpha.value === true && inp.startsWith('rgba(')) {
          model = inp.substring(5, inp.length - 1).split(',')

          if (
            model.length !== 4
            || !/^rgba\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},(0|0\.[0-9]+[1-9]|0\.[1-9]+|1)\)$/.test(inp)
          ) {
            return true
          }

          for (let i = 0; i < 3; i++) {
            const v = parseInt(model[ i ], 10)
            if (v < 0 || v > 255) {
              return true
            }
            model[ i ] = v
          }

          const v = parseFloat(model[ 3 ])
          if (v < 0 || v > 1) {
            return true
          }
          model[ 3 ] = v
        }
        else {
          return true
        }

        if (
          model[ 0 ] < 0 || model[ 0 ] > 255
          || model[ 1 ] < 0 || model[ 1 ] > 255
          || model[ 2 ] < 0 || model[ 2 ] > 255
          || (hasAlpha.value === true && (model[ 3 ] < 0 || model[ 3 ] > 1))
        ) {
          return true
        }

        rgb = {
          r: model[ 0 ],
          g: model[ 1 ],
          b: model[ 2 ],
          a: hasAlpha.value === true
            ? model[ 3 ] * 100
            : void 0
        }
      }

      const hsv = rgbToHsv(rgb)
      model.value.h = hsv.h
      model.value.s = hsv.s
      model.value.v = hsv.v

      updateModel(rgb, change)

      if (change !== true) {
        const index = evt.target.selectionEnd
        nextTick(() => {
          evt.target.setSelectionRange(index, index)
        })
      }
    }

    function onPalettePick (color) {
      const def = parseModel(color)
      const rgb = { r: def.r, g: def.g, b: def.b, a: def.a }

      if (rgb.a === void 0) {
        rgb.a = model.value.a
      }

      model.value.h = def.h
      model.value.s = def.s
      model.value.v = def.v

      updateModel(rgb, true)
    }

    function onSpectrumPan (evt) {
      if (evt.isFinal) {
        changeSpectrum(
          evt.position.left,
          evt.position.top,
          true
        )
      }
      else {
        onSpectrumChange(evt)
      }
    }

    const onSpectrumChange = throttle(
      evt => { changeSpectrum(evt.position.left, evt.position.top) },
      20
    )

    function onSpectrumClick (evt) {
      changeSpectrum(
        evt.pageX - window.pageXOffset,
        evt.pageY - window.pageYOffset,
        true
      )
    }

    function onActivate (evt) {
      changeSpectrum(
        evt.pageX - window.pageXOffset,
        evt.pageY - window.pageYOffset
      )
    }

    function updateErrorIcon (val) {
      // we MUST avoid vue triggering a render,
      // so manually changing this
      if (errorIconRef.value !== null) {
        errorIconRef.value.$el.style.opacity = val ? 1 : 0
      }
    }

    function getHeader () {
      return h('div', {
        class: 'q-color-picker__header relative-position overflow-hidden'
      }, [
        h('div', { class: 'q-color-picker__header-bg absolute-full' }),

        h('div', {
          class: headerClass.value,
          style: currentBgColor.value
        }, [
          h(QTabs, {
            modelValue: topView.value,
            dense: true,
            align: 'justify',
            ...getCache('topVTab', {
              'onUpdate:modelValue': val => { topView.value = val }
            })
          }, () => [
            h(QTab, {
              label: 'HEX' + (hasAlpha.value === true ? 'A' : ''),
              name: 'hex',
              ripple: false
            }),

            h(QTab, {
              label: 'RGB' + (hasAlpha.value === true ? 'A' : ''),
              name: 'rgb',
              ripple: false
            })
          ]),

          h('div', {
            class: 'q-color-picker__header-banner row flex-center no-wrap'
          }, [
            h('input', {
              class: 'fit',
              value: model.value[ topView.value ],
              ...(editable.value !== true
                ? { readonly: true }
                : {}
              ),
              ...getCache('topIn', {
                onInput: evt => {
                  updateErrorIcon(onEditorChange(evt) === true)
                },
                onChange: stop,
                onBlur: evt => {
                  onEditorChange(evt, true) === true && proxy.$forceUpdate()
                  updateErrorIcon(false)
                }
              })
            }),

            h(QIcon, {
              ref: errorIconRef,
              class: 'q-color-picker__error-icon absolute no-pointer-events',
              name: $q.iconSet.type.negative
            })
          ])
        ])
      ])
    }

    function getContent () {
      return h(QTabPanels, {
        modelValue: view.value,
        animated: true
      }, () => [
        h(QTabPanel, {
          class: 'q-color-picker__spectrum-tab overflow-hidden',
          name: 'spectrum'
        }, getSpectrumTab),

        h(QTabPanel, {
          class: 'q-pa-md q-color-picker__tune-tab',
          name: 'tune'
        }, getTuneTab),

        h(QTabPanel, {
          class: 'q-color-picker__palette-tab',
          name: 'palette'
        }, getPaletteTab)
      ])
    }

    function getFooter () {
      return h('div', {
        class: 'q-color-picker__footer relative-position overflow-hidden'
      }, [
        h(QTabs, {
          class: 'absolute-full',
          modelValue: view.value,
          dense: true,
          align: 'justify',
          ...getCache('ftIn', {
            'onUpdate:modelValue': val => { view.value = val }
          })
        }, () => [
          h(QTab, {
            icon: $q.iconSet.colorPicker.spectrum,
            name: 'spectrum',
            ripple: false
          }),

          h(QTab, {
            icon: $q.iconSet.colorPicker.tune,
            name: 'tune',
            ripple: false
          }),

          h(QTab, {
            icon: $q.iconSet.colorPicker.palette,
            name: 'palette',
            ripple: false
          })
        ])
      ])
    }

    function getSpectrumTab () {
      const data = {
        ref: spectrumRef,
        class: 'q-color-picker__spectrum non-selectable relative-position cursor-pointer'
          + (editable.value !== true ? ' readonly' : ''),
        style: spectrumStyle.value,
        ...(editable.value === true
          ? {
              onClick: onSpectrumClick,
              onMousedown: onActivate
            }
          : {}
        )
      }

      const child = [
        h('div', { style: { paddingBottom: '100%' } }),
        h('div', { class: 'q-color-picker__spectrum-white absolute-full' }),
        h('div', { class: 'q-color-picker__spectrum-black absolute-full' }),
        h('div', {
          class: 'absolute',
          style: spectrumPointerStyle.value
        }, [
          model.value.hex !== void 0
            ? h('div', { class: 'q-color-picker__spectrum-circle' })
            : null
        ])
      ]

      const sliders = [
        h('div', { class: 'q-color-picker__hue non-selectable' }, [
          h(QSlider, {
            modelValue: model.value.h,
            min: 0,
            max: 360,
            fillHandleAlways: true,
            readonly: editable.value !== true,
            thumbPath,
            'onUpdate:modelValue': onHueChange,
            ...getCache('lazyhue', {
              onChange: val => onHueChange(val, true)
            })
          })
        ])
      ]

      hasAlpha.value === true && sliders.push(
        h('div', { class: 'q-color-picker__alpha non-selectable' }, [
          h(QSlider, {
            modelValue: model.value.a,
            min: 0,
            max: 100,
            fillHandleAlways: true,
            readonly: editable.value !== true,
            thumbPath,
            ...getCache('alphaSlide', {
              'onUpdate:modelValue': value => onNumericChange(value, 'a', 100),
              onChange: value => onNumericChange(value, 'a', 100, void 0, true)
            })
          })
        ])
      )

      return [
        hDir('div', data, child, 'spec', editable.value, () => spectrumDirective.value),
        h('div', { class: 'q-color-picker__sliders' }, sliders)
      ]
    }

    function getTuneTab () {
      return [
        h('div', { class: 'row items-center no-wrap' }, [
          h('div', 'R'),
          h(QSlider, {
            modelValue: model.value.r,
            min: 0,
            max: 255,
            color: 'red',
            dark: isDark.value,
            readonly: editable.value !== true,
            ...getCache('rSlide', {
              'onUpdate:modelValue': value => onNumericChange(value, 'r', 255),
              onChange: value => onNumericChange(value, 'r', 255, void 0, true)
            })
          }),
          h('input', {
            value: model.value.r,
            maxlength: 3,
            readonly: editable.value !== true,
            onChange: stop,
            ...getCache('rIn', {
              onInput: evt => onNumericChange(evt.target.value, 'r', 255, evt),
              onBlur: evt => onNumericChange(evt.target.value, 'r', 255, evt, true)
            })
          })
        ]),

        h('div', { class: 'row items-center no-wrap' }, [
          h('div', 'G'),
          h(QSlider, {
            modelValue: model.value.g,
            min: 0,
            max: 255,
            color: 'green',
            dark: isDark.value,
            readonly: editable.value !== true,
            ...getCache('gSlide', {
              'onUpdate:modelValue': value => onNumericChange(value, 'g', 255),
              onChange: value => onNumericChange(value, 'g', 255, void 0, true)
            })
          }),
          h('input', {
            value: model.value.g,
            maxlength: 3,
            readonly: editable.value !== true,
            onChange: stop,
            ...getCache('gIn', {
              onInput: evt => onNumericChange(evt.target.value, 'g', 255, evt),
              onBlur: evt => onNumericChange(evt.target.value, 'g', 255, evt, true)
            })
          })
        ]),

        h('div', { class: 'row items-center no-wrap' }, [
          h('div', 'B'),
          h(QSlider, {
            modelValue: model.value.b,
            min: 0,
            max: 255,
            color: 'blue',
            readonly: editable.value !== true,
            dark: isDark.value,
            ...getCache('bSlide', {
              'onUpdate:modelValue': value => onNumericChange(value, 'b', 255),
              onChange: value => onNumericChange(value, 'b', 255, void 0, true)
            })
          }),
          h('input', {
            value: model.value.b,
            maxlength: 3,
            readonly: editable.value !== true,
            onChange: stop,
            ...getCache('bIn', {
              onInput: evt => onNumericChange(evt.target.value, 'b', 255, evt),
              onBlur: evt => onNumericChange(evt.target.value, 'b', 255, evt, true)
            })
          })
        ]),

        hasAlpha.value === true ? h('div', { class: 'row items-center no-wrap' }, [
          h('div', 'A'),
          h(QSlider, {
            modelValue: model.value.a,
            color: 'grey',
            readonly: editable.value !== true,
            dark: isDark.value,
            ...getCache('aSlide', {
              'onUpdate:modelValue': value => onNumericChange(value, 'a', 100),
              onChange: value => onNumericChange(value, 'a', 100, void 0, true)
            })
          }),
          h('input', {
            value: model.value.a,
            maxlength: 3,
            readonly: editable.value !== true,
            onChange: stop,
            ...getCache('aIn', {
              onInput: evt => onNumericChange(evt.target.value, 'a', 100, evt),
              onBlur: evt => onNumericChange(evt.target.value, 'a', 100, evt, true)
            })
          })
        ]) : null
      ]
    }

    function getPaletteTab () {
      return [
        h('div', {
          class: 'row items-center q-color-picker__palette-rows'
            + (editable.value === true ? ' q-color-picker__palette-rows--editable' : '')
        }, computedPalette.value.map(color => h('div', {
          class: 'q-color-picker__cube col-auto',
          style: { backgroundColor: color },
          ...(editable.value === true ? getCache('palette#' + color, {
            onClick: () => {
              onPalettePick(color)
            }
          }) : {})
        })))
      ]
    }

    return () => {
      const child = [ getContent() ]

      if (props.name !== void 0 && props.disable !== true) {
        injectFormInput(child, 'push')
      }

      props.noHeader !== true && child.unshift(
        getHeader()
      )

      props.noFooter !== true && child.push(
        getFooter()
      )

      return h('div', {
        class: classes.value,
        ...attributes.value
      }, child)
    }
  }
})
