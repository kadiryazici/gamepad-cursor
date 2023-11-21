import { Axis, Button, Trigger } from '../constants'
import type { Preset } from '../types'

export const mousePreset = (speed: number): Preset => (ctx) => {
  ctx.onCursorMove(({ getTriggerValue }) => {
    ctx.setInvisible(false)

    const rect = ctx.getCursorRect()
    const el = document.elementFromPoint(rect.x, rect.y)
    if (el) {
      const ctrlPressed = getTriggerValue(Trigger.RT) >= 0.05

      el.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        button: 0,
        buttons: 999,
        clientX: rect.x,
        clientY: rect.y,
        screenX: rect.x,
        screenY: rect.y,
        metaKey: ctrlPressed,
        ctrlKey: ctrlPressed,
      }))
    }
  })

  ctx.onUpdate(({
    getAxisValue,
    getDelta,
    isButtonJustReleased,
    getTriggerValue,
  }) => {
    ctx.moveCursor(
      getAxisValue(Axis.LeftX) * speed * getDelta(),
      getAxisValue(Axis.LeftY) * speed * getDelta(),
    )

    if (isButtonJustReleased(Button.A)) {
      const rect = ctx.getCursorRect()
      const el = document.elementFromPoint(rect.x, rect.y)
      if (el) {
        const ctrlPressed = getTriggerValue(Trigger.RT) >= 0.05

        el.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          button: 0,
          buttons: 1,
          clientX: rect.x,
          clientY: rect.y,
          screenX: rect.x,
          screenY: rect.y,
          metaKey: ctrlPressed,
          ctrlKey: ctrlPressed,
        }))
      }
    }
  })
}

