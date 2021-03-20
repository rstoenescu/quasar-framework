import { normalizeToInterval } from './format.js'
import { client } from '../plugins/Platform.js'

export const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([tabindex="-1"]):not([contenteditable="false"])',
  '.q-tab.q-focusable'
].join(',')

export const KEY_SKIP_SELECTOR = [
  'input:not([disabled])',
  'select:not([disabled])',
  'select:not([disabled]) *',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[contenteditable]:not([contenteditable="false"]) *',
  '.q-key-group-navigation--ignore-key',
  '.q-key-group-navigation--ignore-key *'
].join(',')

export const EDITABLE_SELECTOR = [
  'input:not([disabled]):not([readonly]):not([type="button"]):not([type="checkbox"]):not([type="file"]):not([type="hidden"]):not([type="image"]):not([type="radio"]):not([type="range"]):not([type="reset"]):not([type="submit"])',
  'textarea:not([disabled]):not([readonly])',
  '[contenteditable]:not([contenteditable="false"])',
  '[contenteditable]:not([contenteditable="false"]) *'
].join(',')

export function focusNoScroll (el) {
  if (el === document.activeElement || el === document.body) {
    return
  }

  if (client.is.ios !== true || typeof el.matches !== 'function' || el.matches(EDITABLE_SELECTOR) !== true) {
    el.focus({ preventScroll: true })
    return
  }

  const clone = el.cloneNode(true)
  const parent = el.parentNode

  clone.removeAttribute('id')
  clone.removeAttribute('autofocus')
  clone.removeAttribute('data-autofocus')
  clone.classList.add('q-focus__clone')

  parent.insertBefore(clone, el)

  el.focus()

  setTimeout(() => {
    requestAnimationFrame(() => {
      clone.remove()
    })
  }, 350)
}

export function changeFocusedElement (list, to, direction = 1, noWrap, start) {
  const lastIndex = list.length - 1

  if (noWrap === true && (to > lastIndex || to < 0)) {
    return
  }

  const initialEl = document.activeElement

  if (initialEl !== null) {
    initialEl._qKeyNavIgnore = true
  }

  const index = normalizeToInterval(to, 0, lastIndex)

  if (index === start || index > lastIndex) {
    return
  }

  focusNoScroll(list[index])

  if (initialEl !== null) {
    initialEl._qKeyNavIgnore = false
  }

  if (document.activeElement !== list[index]) {
    changeFocusedElement(list, index + direction, direction, noWrap, start === void 0 ? index : start)
  }
}
