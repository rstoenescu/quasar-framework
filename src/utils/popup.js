import { position as eventPosition } from './event.js'

export function getAnchorPosition (el, offset) {
  let
    {top, left, right, bottom} = el.getBoundingClientRect(),
    a = {
      top,
      left,
      width: el.offsetWidth,
      height: el.offsetHeight
    }

  if (offset) {
    a.top -= offset[1]
    a.left -= offset[0]
    if (bottom) {
      bottom += offset[1]
    }
    if (right) {
      right += offset[0]
    }
    a.width += offset[0]
    a.height += offset[1]
  }

  a.right = right || a.left + a.width
  a.bottom = bottom || a.top + a.height
  a.middle = a.left + ((a.right - a.left) / 2)
  a.center = a.top + ((a.bottom - a.top) / 2)

  return a
}

export function getTargetPosition (el) {
  return {
    top: 0,
    center: el.offsetHeight / 2,
    bottom: el.offsetHeight,
    left: 0,
    middle: el.offsetWidth / 2,
    right: el.offsetWidth
  }
}

export function getPositions (anchor, target) {
  const
    a = Object.assign({}, anchor),
    t = Object.assign({}, target)

  const positions = {
    x: ['left', 'right'].filter(p => p !== t.horizontal),
    y: ['top', 'bottom'].filter(p => p !== t.vertical)
  }

  const overlapAuto = {
    x: [a.horizontal, t.horizontal].indexOf('middle') !== -1,
    y: [a.vertical, t.vertical].indexOf('center') !== -1
  }

  positions.x.splice(overlapAuto.x ? 0 : 1, 0, 'middle')
  positions.y.splice(overlapAuto.y ? 0 : 1, 0, 'center')

  if (!overlapAuto.y) {
    a.vertical = a.vertical === 'top' ? 'bottom' : 'top'
  }

  if (!overlapAuto.x) {
    a.horizontal = a.horizontal === 'left' ? 'right' : 'left'
  }

  return {
    positions: positions,
    anchorPos: a
  }
}

export function repositionIfNeeded (anchor, target, selfOrigin, anchorOrigin, targetPosition) {
  const { positions, anchorPos } = getPositions(anchorOrigin, selfOrigin)
  let { innerHeight, innerWidth } = window
  // simple treatment of possible scrollbar
  innerHeight -= 20
  innerWidth -= 20

  if (targetPosition.top < 0) {
    targetPosition.top = 0
  }
  else if (targetPosition.top + target.bottom > innerHeight) {
    let newTop = anchor[anchorPos.vertical] - target[positions.y[0]]
    if (newTop + target.bottom <= innerHeight) {
      targetPosition.top = newTop
    }
    else {
      newTop = anchor[anchorPos.vertical] - target[positions.y[1]]
      targetPosition.top = (newTop + target.bottom <= innerHeight) ? newTop : innerHeight - target.bottom
    }
  }

  if (targetPosition.left < 0) {
    targetPosition.left = 0
  }
  else if (targetPosition.left + target.right > innerWidth) {
    let newLeft = anchor[anchorPos.horizontal] - target[positions.x[0]]
    if (newLeft + target.right <= innerWidth) {
      targetPosition.left = newLeft
    }
    else {
      newLeft = anchor[anchorPos.horizontal] - target[positions.x[1]]
      targetPosition.left = (newLeft + target.right <= innerWidth) ? newLeft : innerWidth - target.right
    }
  }

  return targetPosition
}

export function parseHorizTransformOrigin (pos) {
  return pos === 'middle' ? 'center' : pos
}

export function setPosition ({el, animate, anchorEl, anchorOrigin, selfOrigin, maxHeight, event, anchorClick, touchPosition, offset, touchOffset}) {
  let anchor
  el.style.maxHeight = maxHeight || '65vh'

  if (event && (!anchorClick || touchPosition)) {
    const {top, left} = eventPosition(event)
    anchor = {top, left, width: 1, height: 1, right: left + 1, center: top, middle: left, bottom: top + 1}
  }
  else {
    if (touchOffset) {
      const
        { top: anchorTop, left: anchorLeft } = anchorEl.getBoundingClientRect(),
        top = anchorTop + touchOffset.top,
        left = anchorLeft + touchOffset.left
      anchor = {top, left, width: 1, height: 1, right: left + 1, center: top, middle: left, bottom: top + 1}
    }
    else {
      anchor = getAnchorPosition(anchorEl, offset)
    }
  }

  let target = getTargetPosition(el)
  let targetPosition = {
    top: anchor[anchorOrigin.vertical] - target[selfOrigin.vertical],
    left: anchor[anchorOrigin.horizontal] - target[selfOrigin.horizontal]
  }

  targetPosition = repositionIfNeeded(anchor, target, selfOrigin, anchorOrigin, targetPosition)

  el.style.top = Math.max(0, targetPosition.top) + 'px'
  el.style.left = Math.max(0, targetPosition.left) + 'px'

  if (animate) {
    const directions = targetPosition.top < anchor.top ? ['up', 'down'] : ['down', 'up']
    el.classList.add(`animate-popup-${directions[0]}`)
    el.classList.remove(`animate-popup-${directions[1]}`)
  }
}

export function positionValidator (pos) {
  let parts = pos.split(' ')
  if (parts.length !== 2) {
    return false
  }
  if (!['top', 'center', 'bottom'].includes(parts[0])) {
    console.error('Anchor/Self position must start with one of top/center/bottom')
    return false
  }
  if (!['left', 'middle', 'right'].includes(parts[1])) {
    console.error('Anchor/Self position must end with one of left/middle/right')
    return false
  }
  return true
}

export function offsetValidator (val) {
  if (!val) { return true }
  if (val.length !== 2) { return false }
  if (typeof val[0] !== 'number' || typeof val[1] !== 'number') {
    return false
  }
  return true
}

export function parsePosition (pos) {
  let parts = pos.split(' ')
  return {vertical: parts[0], horizontal: parts[1]}
}
