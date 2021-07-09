import { shouldIgnoreKey } from '../utils/key-composition.js'

// leave NAMED_MASKS at top of file (code referenced from docs)
const NAMED_MASKS = {
  date: '####/##/##',
  datetime: '####/##/## ##:##',
  time: '##:##',
  fulltime: '##:##:##',
  phone: '(###) ### - ####',
  card: '#### #### #### ####'
}

const TOKENS = {
  '#': { pattern: '[\\d]', negate: '[^\\d]' },

  S: { pattern: '[a-zA-Z]', negate: '[^a-zA-Z]' },
  N: { pattern: '[0-9a-zA-Z]', negate: '[^0-9a-zA-Z]' },

  A: { pattern: '[a-zA-Z]', negate: '[^a-zA-Z]', transform: v => v.toLocaleUpperCase() },
  a: { pattern: '[a-zA-Z]', negate: '[^a-zA-Z]', transform: v => v.toLocaleLowerCase() },

  X: { pattern: '[0-9a-zA-Z]', negate: '[^0-9a-zA-Z]', transform: v => v.toLocaleUpperCase() },
  x: { pattern: '[0-9a-zA-Z]', negate: '[^0-9a-zA-Z]', transform: v => v.toLocaleLowerCase() }
}

const KEYS = Object.keys(TOKENS)
KEYS.forEach(key => {
  TOKENS[key].regex = new RegExp(TOKENS[key].pattern)
})

const
  tokenRegexMask = new RegExp('\\\\([^.*+?^${}()|([\\]])|([.*+?^${}()|[\\]])|([' + KEYS.join('') + '])|(.)', 'g'),
  escRegex = /[.*+?^${}()|[\]\\]/g

const MARKER = String.fromCharCode(1)

export default {
  props: {
    mask: String,
    reverseFillMask: Boolean,
    fillMask: [Boolean, String],
    unmaskedValue: Boolean
  },

  watch: {
    type () {
      this.__updateMaskInternals()
    },

    autogrow () {
      this.__updateMaskInternals()
    },

    mask (v) {
      if (v !== void 0) {
        this.__updateMaskValue(this.innerValue, true)
      }
      else {
        const val = this.__unmask(this.innerValue)
        this.__updateMaskInternals()
        this.value !== val && this.$emit('input', val)
      }
    },

    fillMask () {
      this.hasMask === true && this.__updateMaskValue(this.innerValue, true)
    },

    reverseFillMask () {
      this.hasMask === true && this.__updateMaskValue(this.innerValue, true)
    },

    unmaskedValue () {
      this.hasMask === true && this.__updateMaskValue(this.innerValue)
    }
  },

  methods: {
    __getInitialMaskedValue () {
      this.__updateMaskInternals()

      if (this.hasMask === true) {
        const masked = this.__mask(this.__unmask(this.value))

        return this.fillMask !== false
          ? this.__fillWithMask(masked)
          : masked
      }

      return this.value
    },

    __getPaddedMaskMarked (size) {
      if (size < this.maskMarked.length) {
        return this.maskMarked.slice(-size)
      }

      let
        maskMarked = this.maskMarked,
        pad = ''
      const
        padPos = maskMarked.indexOf(MARKER)

      if (padPos > -1) {
        for (let i = size - maskMarked.length; i > 0; i--) {
          pad += MARKER
        }

        maskMarked = maskMarked.slice(0, padPos) + pad + maskMarked.slice(padPos)
      }

      return maskMarked
    },

    __updateMaskInternals () {
      this.hasMask = this.mask !== void 0 &&
        this.mask.length > 0 &&
        (this.autogrow === true || ['textarea', 'text', 'search', 'url', 'tel', 'password'].includes(this.type))

      if (this.hasMask === false) {
        this.computedUnmask = void 0
        this.maskMarked = ''
        this.maskReplaced = ''
        return
      }

      const
        computedMask = NAMED_MASKS[this.mask] === void 0
          ? this.mask
          : NAMED_MASKS[this.mask],
        fillChar = typeof this.fillMask === 'string' && this.fillMask.length > 0
          ? this.fillMask.slice(0, 1)
          : '_',
        fillCharEscaped = fillChar.replace(escRegex, '\\$&'),
        unmask = [],
        extract = [],
        mask = []

      let
        firstMatch = this.reverseFillMask === true,
        unmaskChar = '',
        negateChar = ''

      computedMask.replace(tokenRegexMask, (_, char1, esc, token, char2) => {
        if (token !== void 0) {
          const c = TOKENS[token]
          mask.push(c)
          negateChar = c.negate
          if (firstMatch === true) {
            extract.push('(?:' + negateChar + '+)?(' + c.pattern + '+)?(?:' + negateChar + '+)?(' + c.pattern + '+)?')
            firstMatch = false
          }
          extract.push('(?:' + negateChar + '+)?(' + c.pattern + ')?')
        }
        else if (esc !== void 0) {
          unmaskChar = '\\' + (esc === '\\' ? '' : esc)
          mask.push(esc)
          unmask.push('([^' + unmaskChar + ']+)?' + unmaskChar + '?')
        }
        else {
          const c = char1 !== void 0 ? char1 : char2
          unmaskChar = c === '\\' ? '\\\\\\\\' : c.replace(escRegex, '\\\\$&')
          mask.push(c)
          unmask.push('([^' + unmaskChar + ']+)?' + unmaskChar + '?')
        }
      })

      const
        unmaskMatcher = new RegExp(
          '^' +
          unmask.join('') +
          '(' + (unmaskChar === '' ? '.' : '[^' + unmaskChar + ']') + '+)?' +
          '$'
        ),
        extractLast = extract.length - 1,
        extractMatcher = extract.map((re, index) => {
          if (index === 0 && this.reverseFillMask === true) {
            return new RegExp('^' + fillCharEscaped + '*' + re)
          }
          else if (index === extractLast) {
            return new RegExp(
              '^' + re +
              '(' + (negateChar === '' ? '.' : negateChar) + '+)?' +
              (this.reverseFillMask === true ? '$' : fillCharEscaped + '*')
            )
          }

          return new RegExp('^' + re)
        })

      this.computedMask = mask
      this.computedUnmask = val => {
        const unmaskMatch = unmaskMatcher.exec(val)
        if (unmaskMatch !== null) {
          val = unmaskMatch.slice(1).join('')
        }

        const
          extractMatch = [],
          extractMatcherLength = extractMatcher.length

        for (let i = 0, str = val; i < extractMatcherLength; i++) {
          const m = extractMatcher[i].exec(str)

          if (m === null) {
            break
          }

          str = str.slice(m.shift().length)
          extractMatch.push(...m)
        }
        if (extractMatch.length > 0) {
          return extractMatch.join('')
        }

        return val
      }
      this.maskMarked = mask.map(v => typeof v === 'string' ? v : MARKER).join('')
      this.maskReplaced = this.maskMarked.split(MARKER).join(fillChar)
    },

    __updateMaskValue (rawVal, updateMaskInternals, inputType) {
      const
        inp = this.$refs.input,
        end = inp.selectionEnd,
        endReverse = inp.value.length - end,
        unmasked = this.__unmask(rawVal)

      // Update here so unmask uses the original fillChar
      updateMaskInternals === true && this.__updateMaskInternals()

      const
        preMasked = this.__mask(unmasked),
        masked = this.fillMask !== false
          ? this.__fillWithMask(preMasked)
          : preMasked,
        changed = this.innerValue !== masked

      // We want to avoid "flickering" so we set value immediately
      inp.value !== masked && (inp.value = masked)

      changed === true && (this.innerValue = masked)

      document.activeElement === inp && this.$nextTick(() => {
        if (masked === this.maskReplaced) {
          const cursor = this.reverseFillMask === true ? this.maskReplaced.length : 0
          inp.setSelectionRange(cursor, cursor, 'forward')

          return
        }

        if (inputType === 'insertFromPaste' && this.reverseFillMask !== true) {
          const cursor = end - 1
          this.__moveCursorRight(inp, cursor, cursor)

          return
        }

        if (['deleteContentBackward', 'deleteContentForward'].indexOf(inputType) > -1) {
          const cursor = this.reverseFillMask === true
            ? (
              end === 0
                ? (masked.length > preMasked.length ? 1 : 0)
                : Math.max(0, masked.length - (masked === this.maskReplaced ? 0 : Math.min(preMasked.length, endReverse) + 1)) + 1
            )
            : end
          inp.setSelectionRange(cursor, cursor, 'forward')

          return
        }

        if (this.reverseFillMask === true) {
          if (changed === true) {
            const cursor = Math.max(0, masked.length - (masked === this.maskReplaced ? 0 : Math.min(preMasked.length, endReverse + 1)))

            if (cursor === 1 && end === 1) {
              inp.setSelectionRange(cursor, cursor, 'forward')
            }
            else {
              this.__moveCursorRightReverse(inp, cursor, cursor)
            }
          }
          else {
            const cursor = masked.length - endReverse
            inp.setSelectionRange(cursor, cursor, 'backward')
          }
        }
        else {
          if (changed === true) {
            const cursor = Math.max(0, this.maskMarked.indexOf(MARKER), Math.min(preMasked.length, end) - 1)
            this.__moveCursorRight(inp, cursor, cursor)
          }
          else {
            const cursor = end - 1
            this.__moveCursorRight(inp, cursor, cursor)
          }
        }
      })

      const val = this.unmaskedValue === true
        ? this.__unmask(masked)
        : masked

      this.value !== val && this.__emitValue(val, true)
    },

    __moveCursorForPaste (inp, start, end) {
      const preMasked = this.__mask(this.__unmask(inp.value))

      start = Math.max(0, this.maskMarked.indexOf(MARKER), Math.min(preMasked.length, start))

      inp.setSelectionRange(start, end, 'forward')
    },

    __moveCursorLeft (inp, start, end, selection) {
      const noMarkBefore = this.maskMarked.slice(start - 1).indexOf(MARKER) === -1
      let i = Math.max(0, start - 1)

      for (; i >= 0; i--) {
        if (this.maskMarked[i] === MARKER) {
          start = i
          noMarkBefore === true && start++
          break
        }
      }

      if (
        i < 0 &&
        this.maskMarked[start] !== void 0 &&
        this.maskMarked[start] !== MARKER
      ) {
        return this.__moveCursorRight(inp, 0, 0)
      }

      start >= 0 && inp.setSelectionRange(
        start,
        selection === true ? end : start, 'backward'
      )
    },

    __moveCursorRight (inp, start, end, selection) {
      const limit = inp.value.length
      let i = Math.min(limit, end + 1)

      for (; i <= limit; i++) {
        if (this.maskMarked[i] === MARKER) {
          end = i
          break
        }
        else if (this.maskMarked[i - 1] === MARKER) {
          end = i
        }
      }

      if (
        i > limit &&
        this.maskMarked[end - 1] !== void 0 &&
        this.maskMarked[end - 1] !== MARKER
      ) {
        return this.__moveCursorLeft(inp, limit, limit)
      }

      inp.setSelectionRange(selection ? start : end, end, 'forward')
    },

    __moveCursorLeftReverse (inp, start, end, selection) {
      const
        maskMarked = this.__getPaddedMaskMarked(inp.value.length)
      let i = Math.max(0, start - 1)

      for (; i >= 0; i--) {
        if (maskMarked[i - 1] === MARKER) {
          start = i
          break
        }
        else if (maskMarked[i] === MARKER) {
          start = i
          if (i === 0) {
            break
          }
        }
      }

      if (
        i < 0 &&
        maskMarked[start] !== void 0 &&
        maskMarked[start] !== MARKER
      ) {
        return this.__moveCursorRightReverse(inp, 0, 0)
      }

      start >= 0 && inp.setSelectionRange(
        start,
        selection === true ? end : start, 'backward'
      )
    },

    __moveCursorRightReverse (inp, start, end, selection) {
      const
        limit = inp.value.length,
        maskMarked = this.__getPaddedMaskMarked(limit),
        noMarkBefore = maskMarked.slice(0, end + 1).indexOf(MARKER) === -1
      let i = Math.min(limit, end + 1)

      for (; i <= limit; i++) {
        if (maskMarked[i - 1] === MARKER) {
          end = i
          end > 0 && noMarkBefore === true && end--
          break
        }
      }

      if (
        i > limit &&
        maskMarked[end - 1] !== void 0 &&
        maskMarked[end - 1] !== MARKER
      ) {
        return this.__moveCursorLeftReverse(inp, limit, limit)
      }

      inp.setSelectionRange(selection === true ? start : end, end, 'forward')
    },

    __onMaskedKeydown (e) {
      if (shouldIgnoreKey(e) === true) {
        return
      }

      const
        inp = this.$refs.input,
        start = inp.selectionStart,
        end = inp.selectionEnd

      if (e.keyCode === 37 || e.keyCode === 39) { // Left / Right
        const fn = this['__moveCursor' + (e.keyCode === 39 ? 'Right' : 'Left') + (this.reverseFillMask === true ? 'Reverse' : '')]

        e.preventDefault()
        fn(inp, start, end, e.shiftKey)
      }
      else if (
        e.keyCode === 8 && // Backspace
        this.reverseFillMask !== true &&
        start === end
      ) {
        this.__moveCursorLeft(inp, start, end, true)
      }
      else if (
        e.keyCode === 46 && // Delete
        this.reverseFillMask === true &&
        start === end
      ) {
        this.__moveCursorRightReverse(inp, start, end, true)
      }

      this.$emit('keydown', e)
    },

    __mask (val) {
      if (val === void 0 || val === null || val === '') { return '' }

      if (this.reverseFillMask === true) {
        return this.__maskReverse(val)
      }

      const mask = this.computedMask

      let valIndex = 0, output = ''

      for (let maskIndex = 0; maskIndex < mask.length; maskIndex++) {
        const
          valChar = val[valIndex],
          maskDef = mask[maskIndex]

        if (typeof maskDef === 'string') {
          output += maskDef
          valChar === maskDef && valIndex++
        }
        else if (valChar !== void 0 && maskDef.regex.test(valChar)) {
          output += maskDef.transform !== void 0
            ? maskDef.transform(valChar)
            : valChar
          valIndex++
        }
        else {
          return output
        }
      }

      return output
    },

    __maskReverse (val) {
      const
        mask = this.computedMask,
        firstTokenIndex = this.maskMarked.indexOf(MARKER)

      let valIndex = val.length - 1, output = ''

      for (let maskIndex = mask.length - 1; maskIndex >= 0 && valIndex > -1; maskIndex--) {
        const maskDef = mask[maskIndex]

        let valChar = val[valIndex]

        if (typeof maskDef === 'string') {
          output = maskDef + output
          valChar === maskDef && valIndex--
        }
        else if (valChar !== void 0 && maskDef.regex.test(valChar)) {
          do {
            output = (maskDef.transform !== void 0 ? maskDef.transform(valChar) : valChar) + output
            valIndex--
            valChar = val[valIndex]
          // eslint-disable-next-line no-unmodified-loop-condition
          } while (firstTokenIndex === maskIndex && valChar !== void 0 && maskDef.regex.test(valChar))
        }
        else {
          return output
        }
      }

      return output
    },

    __unmask (val) {
      return typeof val !== 'string' || this.computedUnmask === void 0
        ? (typeof val === 'number' ? this.computedUnmask('' + val) : val)
        : this.computedUnmask(val)
    },

    __fillWithMask (val) {
      if (this.maskReplaced.length - val.length <= 0) {
        return val
      }

      return this.reverseFillMask === true && val.length > 0
        ? this.maskReplaced.slice(0, -val.length) + val
        : val + this.maskReplaced.slice(val.length)
    }
  }
}
