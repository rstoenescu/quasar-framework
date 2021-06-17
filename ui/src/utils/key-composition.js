export function shouldIgnoreKey (evt) {
  return evt !== Object(evt) ||
    evt.type.indexOf('key') !== 0 ||
    evt.target !== document.activeElement ||
    evt.target.composing === true
}

export function isKeyCode (evt, keyCodes) {
  return shouldIgnoreKey(evt) === true
    ? false
    : [].concat(keyCodes).includes(evt.keyCode)
}
