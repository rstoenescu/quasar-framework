export default function (vm, prop, wait = 250) {
  const debounced = {
    get value () {
      const value = vm[prop]

      if (value !== debounced.propValue) {
        debounced.propValue = value
        debounced.internalValue = value

        debounced.timer !== void 0 && clearTimeout(debounced.timer)
        debounced.timer = void 0
      }

      return debounced.internalValue
    },

    set value (value) {
      if (debounced.internalValue === value) {
        return
      }

      debounced.internalValue = value

      debounced.timer !== void 0 && clearTimeout(debounced.timer)
      debounced.timer = setTimeout(() => {
        vm[prop] = value

        debounced.timer = void 0
      }, wait)
    },

    destroy () {
      if (debounced.timer !== void 0) {
        clearTimeout(debounced.timer)
        debounced.timer = void 0

        vm[prop] = debounced.internalValue
      }
    }
  }

  vm.$once('hook:beforeDestroy', debounced.destroy)

  debounced.propValue = NaN
  debounced.internalValue = NaN

  return debounced
}
