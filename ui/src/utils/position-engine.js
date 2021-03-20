import { client } from '../plugins/Platform.js'
import { isBuggyRTLScroll } from './scroll.js'

const SIDE_SPACE = 4 // how many pixels to reserve on the edge

const horizontalPos = {
  'start#ltr': 'left',
  'start#rtl': 'right',
  'end#ltr': 'right',
  'end#rtl': 'left'
}

;['left', 'middle', 'right'].forEach(pos => {
  horizontalPos[`${pos}#ltr`] = pos
  horizontalPos[`${pos}#rtl`] = pos
})

function isFixedPositioned (el) {
  while (el && el !== document) {
    if (window.getComputedStyle(el).position === 'fixed') {
      return true
    }
    el = el.parentNode
  }

  return false
}

function isDocumentScrollableX () {
  return window.getComputedStyle(document.documentElement).overflowX !== 'hidden' &&
    window.getComputedStyle(document.body).overflowX !== 'hidden'
}

function isDocumentScrollableY () {
  return window.getComputedStyle(document.documentElement).overflowY !== 'hidden' &&
    window.getComputedStyle(document.body).overflowY !== 'hidden'
}

function computeScrollLeft (fixedPositioned, viewport, rtl) {
  if (fixedPositioned === true) {
    return { vpLeft: viewport.offsetLeft, apLeft: viewport.offsetLeft }
  }

  const scrollLeft = window.pageXOffset || window.scrollX || document.body.scrollLeft || 0

  if (rtl !== true) {
    return { vpLeft: scrollLeft, apLeft: scrollLeft }
  }

  // TODO: check if the correction is needed also if isBuggyRTL
  const buggyRTL = isBuggyRTLScroll()
  const vpLeft = (buggyRTL === true ? 0 : document.documentElement.scrollWidth - document.documentElement.clientWidth) + scrollLeft
  return {
    vpLeft,
    apLeft: vpLeft + document.documentElement.scrollWidth - document.documentElement.clientWidth
  }
}

export function validatePosition (pos) {
  const parts = pos.split(' ')
  if (parts.length !== 2) {
    return false
  }
  if ([ 'top', 'center', 'bottom' ].includes(parts[0]) !== true) {
    console.error('Anchor/Self position must start with one of top/center/bottom')
    return false
  }
  if ([ 'left', 'middle', 'right', 'start', 'end' ].includes(parts[1]) !== true) {
    console.error('Anchor/Self position must end with one of left/middle/right/start/end')
    return false
  }
  return true
}

export function validateOffset (val) {
  if (val !== true) { return true }
  if (val.length !== 2) { return false }
  if (typeof val[0] !== 'number' || typeof val[1] !== 'number') {
    return false
  }
  return true
}

export function parsePosition (pos, rtl) {
  const parts = pos.split(' ')
  return {
    vertical: parts[0],
    horizontal: horizontalPos[`${parts[1]}#${rtl === true ? 'rtl' : 'ltr'}`]
  }
}

export function validateCover (val) {
  if (val === true || val === false) { return true }
  return validatePosition(val)
}

export function getAnchorProps (el, offset, rtlCorrection) {
  let { top, left, right, bottom, width, height } = el.getBoundingClientRect()

  if (width === 0) {
    width = el.offsetWidth
  }
  if (height === 0) {
    height = el.offsetHeight
  }

  if (offset !== void 0) {
    left -= offset[0]
    right += offset[0]
    top -= offset[1]
    bottom += offset[1]
  }

  // TODO: check if the correction is needed also if isBuggyRTL
  if (rtlCorrection === true) {
    const diff = document.documentElement.scrollWidth - document.documentElement.clientWidth
    left -= diff
    right -= diff
  }

  return {
    left,
    middle: left + (right - left) / 2,
    right,

    top,
    center: top + (bottom - top) / 2,
    bottom,

    leftRev: right,
    middleRev: left + (right - left) / 2,
    rightRev: left,

    topRev: bottom,
    centerRev: top + (bottom - top) / 2,
    bottomRev: top,

    width,
    height
  }
}

export function getTargetProps (el) {
  let { width, height } = el.getBoundingClientRect()

  if (width === 0) {
    width = el.offsetWidth
  }
  if (height === 0) {
    height = el.offsetHeight
  }

  return {
    width,
    height
  }
}

// cfg: { el, anchorEl, anchorOrigin, selfOrigin, offset, absoluteOffset, cover, fit, minHeight, minWidth, maxHeight, maxWidth, rtl }
export function setPosition (cfg) {
  const extEl = cfg.el

  if (extEl.classList.contains('q-body--prevent-scroll-reposition') === true) {
    return
  }

  let anchorProps, targetProps

  const
    intEl = extEl.children[0],
    firstRender = intEl.style.opacity !== 1,
    fixedPositioned = isFixedPositioned(cfg.anchorEl),
    anchorOrigin = { ...cfg.anchorOrigin },
    selfOrigin = { ...cfg.selfOrigin },
    viewport = fixedPositioned === true && client.is.ios === true && window.visualViewport !== void 0
      ? window.visualViewport
      : { offsetLeft: 0, offsetTop: 0 },
    { vpLeft, apLeft } = computeScrollLeft(fixedPositioned, viewport, cfg.rtl),
    vpTop = fixedPositioned === true
      ? viewport.offsetTop
      : (window.pageYOffset || window.scrollY || document.body.scrollTop || 0),
    vpWidth = document.documentElement[fixedPositioned === true || isDocumentScrollableX() !== true ? 'clientWidth' : 'scrollWidth'],
    vpHeight = document.documentElement[fixedPositioned === true || isDocumentScrollableY() !== true ? 'clientHeight' : 'scrollHeight']

  if (cfg.absoluteOffset === void 0) {
    anchorProps = getAnchorProps(cfg.anchorEl, cfg.cover === true ? [0, 0] : cfg.offset, cfg.rtl === true && fixedPositioned !== true)
  }
  else {
    const
      leftOffset = cfg.rtl === true && fixedPositioned !== true
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth
        : 0,
      { top: anchorTop, left: anchorLeft } = cfg.anchorEl.getBoundingClientRect(),
      top = anchorTop + (cfg.cover === true ? 0 : cfg.absoluteOffset.top),
      left = anchorLeft + (cfg.cover === true || cfg.fit === true ? 0 : cfg.absoluteOffset.left) - leftOffset

    anchorProps = {
      left,
      middle: left,
      right: left,

      top,
      center: top,
      bottom: top,

      leftRev: left,
      middleRev: left,
      rightRev: left,

      topRev: top,
      centerRev: top,
      bottomRev: top,

      width: 0,
      height: 0
    }
  }

  const intElStyle = {
    minWidth: cfg.minWidth || null,
    minHeight: cfg.minHeight || null,
    maxWidth: cfg.maxWidth || null,
    maxHeight: cfg.maxHeight || null
  }

  if (cfg.fit === true || cfg.cover === true) {
    if (cfg.minWidth === null) {
      intElStyle.minWidth = anchorProps.width + 'px'
    }
    if (cfg.cover === true && cfg.minHeight === null) {
      intElStyle.minHeight = anchorProps.height + 'px'
    }
  }

  Object.assign(intEl.style, intElStyle)

  if (firstRender === true) {
    const clone = intEl.cloneNode(true)
    clone.classList.add('q-portal__clone')
    document.body.appendChild(clone)
    targetProps = getTargetProps(clone)
    clone.remove()
  }
  else {
    targetProps = getTargetProps(intEl)
  }

  if (intElStyle.minWidth !== null && anchorProps.width > targetProps.width) {
    intElStyle.minWidth = targetProps.width + 'px'
  }
  if (intElStyle.minHeight !== null && anchorProps.height > targetProps.height) {
    intElStyle.minHeight = targetProps.height + 'px'
  }

  const extElStyle = {
    position: fixedPositioned === true ? 'fixed' : 'absolute',

    left: null,
    right: null,
    marginLeft: null,
    marginRight: null,
    maxWidth: null,

    top: null,
    bottom: null,
    marginTop: null,
    marginBottom: null,
    maxHeight: null
  }

  const
    halfWidth = Math.min(vpLeft + anchorProps[cfg.anchorOrigin.horizontal], vpWidth - apLeft - anchorProps[cfg.anchorOrigin.horizontal]) - SIDE_SPACE,
    halfHeight = Math.min(vpTop + anchorProps[cfg.anchorOrigin.vertical], vpHeight - vpTop - anchorProps[cfg.anchorOrigin.vertical]) - SIDE_SPACE

  // horizontal repositioning
  if (
    selfOrigin.horizontal === 'left' &&
    targetProps.width + SIDE_SPACE > vpWidth - apLeft - anchorProps[anchorOrigin.horizontal] &&
    vpLeft + anchorProps[anchorOrigin.horizontal + 'Rev'] > vpWidth - apLeft - anchorProps[anchorOrigin.horizontal]
  ) {
    selfOrigin.horizontal = 'right'
    anchorOrigin.horizontal = anchorOrigin.horizontal + 'Rev'
  }
  else if (
    selfOrigin.horizontal === 'right' &&
    targetProps.width + SIDE_SPACE > vpLeft + anchorProps[anchorOrigin.horizontal] &&
    vpWidth - apLeft - anchorProps[anchorOrigin.horizontal + 'Rev'] > vpLeft + anchorProps[anchorOrigin.horizontal]
  ) {
    selfOrigin.horizontal = 'left'
    anchorOrigin.horizontal = anchorOrigin.horizontal + 'Rev'
  }
  else if (
    selfOrigin.horizontal === 'middle' &&
    targetProps.width / 2 > halfWidth
  ) {
    selfOrigin.horizontal = vpLeft + anchorProps[anchorOrigin.horizontal] < vpWidth / 2
      ? 'left'
      : 'right'
    anchorOrigin.horizontal = selfOrigin.horizontal
  }

  // horizontal styles
  if (selfOrigin.horizontal === 'left') {
    extElStyle.left = 0
    extElStyle.marginLeft = `${vpLeft + anchorProps[anchorOrigin.horizontal]}px`
    extElStyle.maxWidth = `${vpWidth - vpLeft - anchorProps[anchorOrigin.horizontal] - SIDE_SPACE}px`
  }
  else if (selfOrigin.horizontal === 'right') {
    extElStyle.right = '100%'
    extElStyle.marginRight = `-${vpLeft + anchorProps[anchorOrigin.horizontal]}px`
    extElStyle.maxWidth = `${vpLeft + anchorProps[anchorOrigin.horizontal] - SIDE_SPACE}px`
  }
  else {
    extElStyle.right = '100%'
    extElStyle.marginRight = `-${vpLeft + anchorProps[anchorOrigin.horizontal]}px`
  }

  // vertical repositioning
  if (
    selfOrigin.vertical === 'top' &&
    targetProps.height + SIDE_SPACE > vpHeight - vpTop - anchorProps[anchorOrigin.vertical] &&
    vpTop + anchorProps[anchorOrigin.vertical + 'Rev'] > vpHeight - vpTop - anchorProps[anchorOrigin.vertical]
  ) {
    selfOrigin.vertical = 'bottom'
    anchorOrigin.vertical = anchorOrigin.vertical + 'Rev'
  }
  else if (
    selfOrigin.vertical === 'bottom' &&
    targetProps.height + SIDE_SPACE > vpTop + anchorProps[anchorOrigin.vertical] &&
    vpHeight - vpTop - anchorProps[anchorOrigin.vertical + 'Rev'] > vpTop + anchorProps[anchorOrigin.vertical]
  ) {
    selfOrigin.vertical = 'top'
    anchorOrigin.vertical = anchorOrigin.vertical + 'Rev'
  }
  else if (
    selfOrigin.vertical === 'center' &&
    targetProps.height / 2 > halfHeight
  ) {
    selfOrigin.vertical = vpTop + anchorProps[anchorOrigin.vertical] < vpHeight / 2
      ? 'top'
      : 'bottom'
    anchorOrigin.vertical = selfOrigin.vertical
  }

  // vertical styles
  if (selfOrigin.vertical === 'top') {
    extElStyle.top = 0
    extElStyle.marginTop = `${vpTop + anchorProps[anchorOrigin.vertical]}px`
    extElStyle.maxHeight = `${vpHeight - vpTop - anchorProps[anchorOrigin.vertical] - SIDE_SPACE}px`
  }
  else if (selfOrigin.vertical === 'bottom') {
    extElStyle.bottom = '100%'
    extElStyle.marginBottom = `-${vpTop + anchorProps[anchorOrigin.vertical]}px`
    extElStyle.maxHeight = `${vpTop + anchorProps[anchorOrigin.vertical] - SIDE_SPACE}px`
  }
  else {
    extElStyle.bottom = '100%'
    extElStyle.marginBottom = `-${vpTop + anchorProps[anchorOrigin.vertical]}px`
  }

  if (selfOrigin.horizontal === 'middle' && selfOrigin.vertical === 'center') {
    intElStyle.transform = 'translate(50%, 50%)'
    extElStyle.transformOrigin = '100% 100%'
  }
  else if (selfOrigin.horizontal === 'middle') {
    intElStyle.transform = 'translateX(50%)'
    extElStyle.transformOrigin = '100% 50%'
  }
  else if (selfOrigin.vertical === 'center') {
    intElStyle.transform = 'translateY(50%)'
    extElStyle.transformOrigin = '50% 100%'
  }
  else {
    intElStyle.transform = null
    extElStyle.transformOrigin = '50% 50%'
  }

  Object.assign(extEl.style, extElStyle)
  Object.assign(intEl.style, intElStyle)

  if (firstRender === true) {
    requestAnimationFrame(() => {
      intEl.style.opacity = 1
    })
  }
}
