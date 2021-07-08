export function slot (vm, slotName, otherwise) {
  return vm.$scopedSlots[slotName] !== void 0
    ? vm.$scopedSlots[slotName]()
    : otherwise
}

export function uniqueSlot (vm, slotName, otherwise) {
  return vm.$scopedSlots[slotName] !== void 0
    ? [].concat(vm.$scopedSlots[slotName]())
    : otherwise
}

/**
 * Source definitely exists,
 * so it's merged with the possible slot
 */
export function mergeSlot (source, vm, slotName) {
  return vm.$scopedSlots[slotName] !== void 0
    ? source.concat(vm.$scopedSlots[slotName]())
    : source
}

/**
 * Merge with possible slot,
 * even if source might not exist
 */
export function mergeSlotSafely (source, vm, slotName) {
  if (vm.$scopedSlots[slotName] === void 0) {
    return source
  }

  const slot = vm.$scopedSlots[slotName]()
  return source !== void 0
    ? source.concat(slot)
    : slot
}
