import { Axis } from '../constants'
import type { Preset } from '../types'

export const scrollPreset = ({
  speed = 1000,
  threshold = 0.35,
} = {}): Preset => ({
  getCursorRect,
  onUpdate,
}) => {
  onUpdate(({ getAxisValue, getDelta }) => {
    const rect = getCursorRect()
    const el = document.elementFromPoint(rect.x, rect.y)
    if (el) {
      let xVelocity = getAxisValue(Axis.RightX)
      let yVelocity = getAxisValue(Axis.RightY)

      if (Math.abs(xVelocity) < threshold)
        xVelocity = 0
      else
        xVelocity = xVelocity * speed * getDelta()

      if (Math.abs(yVelocity) < threshold)
        yVelocity = 0
      else
        yVelocity = yVelocity * speed * getDelta()

      if (xVelocity === 0 && yVelocity === 0)
        return

      let currentEl = el as HTMLElement | null

      while (currentEl != null) {
        if (xVelocity !== 0 || yVelocity !== 0) {
          let scrollableX = false
          let scrollableY = false

          if (xVelocity !== 0)
            scrollableX = xVelocity > 0 ? isScrollableRight(currentEl) : isScrollableLeft(currentEl)

          if (yVelocity !== 0)
            scrollableY = yVelocity > 0 ? isScrollableBottom(currentEl) : isScrollableTop(currentEl)

          if (scrollableY || scrollableX) {
            currentEl.scrollLeft += xVelocity
            currentEl.scrollTop += yVelocity
            break
          }
        }

        currentEl = currentEl.parentElement
      }
    }
  })
}

function isScrollableRight(el: HTMLElement) {
  if (el === document.documentElement)
    return el.scrollLeft + window.innerWidth < el.offsetWidth

  return el.offsetWidth + el.scrollLeft < el.scrollWidth
}

function isScrollableLeft(el: HTMLElement) {
  return el.scrollLeft > 0
}

function isScrollableTop(el: HTMLElement) {
  return el.scrollTop > 0
}

function isScrollableBottom(el: HTMLElement) {
  if (el === document.documentElement)
    return el.scrollTop + window.innerHeight < el.offsetHeight

  return el.offsetHeight + el.scrollTop < el.scrollHeight
}

