import { Axis, Button, Trigger } from './constants'
import { mousePreset } from './presets/mousePreset'
import { scrollPreset } from './presets/scrollPreset'
import type { AxisMap, AxisMapState, ButtonMap, ButtonMapState, Context, HookContext, Options, PresetContext, TriggerMap, TriggerMapState } from './types'
import { assign, clamp } from './utils'

function handleReset(ctx: Context) {
  ctx.buttonMap.forEach((state) => {
    state.justPressed = false
    state.pressed = false
  })

  for (const key of ctx.axisMap.keys())
    ctx.axisMap.set(key, 0)

  for (const key of ctx.triggerMap.keys())
    ctx.triggerMap.set(key, 0)
}

function handleTick(ctx: Context) {
  if (!ctx.active)
    return

  if (ctx.lastInvisible !== ctx.invisible) {
    ctx.cursor.style.visibility = ctx.invisible ? 'hidden' : 'visible'
    ctx.lastInvisible = ctx.invisible
  }

  const gamepads = navigator.getGamepads()

  ctx.buttonMap.forEach((state) => {
    if (state.justPressed)
      ctx.presetContext.setInvisible(false)

    state.justPressed = false
  })

  for (const gamepad of gamepads) {
    if (gamepad == null)
      continue

    for (const [index, state] of gamepad.buttons.entries()) {
      if (index === Trigger.LT || index === Trigger.RT) {
        ctx.triggerMap.set(index, state.value)
      }
      else {
        const currentState = ctx.buttonMap.get(index)!

        currentState.justPressed = !currentState.pressed && state.pressed
        currentState.justReleased = currentState.pressed && !state.pressed
        currentState.pressed = state.pressed
      }
    }

    gamepad.axes.forEach((value, index) => {
      ctx.axisMap.set(index, value)
    })
  }

  ctx.updateHooks.forEach(hook => hook(ctx.hookContext))
}

export function createGamepadPointer({
  cursor,
  presets = [],
}: Options) {
  const buttonMap: ButtonMap = new Map(Object.values(Button).map<[number, ButtonMapState]>(value => (
    [value, { justPressed: false, pressed: false, justReleased: false }]
  )))

  const axisMap: AxisMap = new Map(Object.values(Axis).map<[number, AxisMapState]>(value => (
    [value, 0]
  )))

  const triggerMap: TriggerMap = new Map(Object.values(Trigger).map<[number, TriggerMapState]>(value => (
    [value, 0]
  )))

  assign(cursor.style, {
    position: 'fixed',
    zIndex: '99999999',
    display: 'none',
  })

  const lastCursorPosition: [x: number, y: number] = [
    window.innerWidth / 2,
    window.innerHeight / 2,
  ]

  let ctx: Context

  const presetContext: PresetContext = {
    getCursorRect: () => ctx.cursor.getBoundingClientRect(),
    moveCursor: (x, y = 0) => {
      if (x === 0 && y === 0)
        return

      const rect = presetContext.getCursorRect()
      const nextX = clamp(rect.x + x, 0, window.innerWidth - 2)
      const nextY = clamp(rect.y + y, 0, window.innerHeight - 2)

      if (nextX === rect.x && nextY === rect.y)
        return

      assign(ctx.cursor.style, {
        left: `${nextX}px`,
        top: `${nextY}px`,
      })

      ctx.cursorMoveHooks.forEach(hook => hook(ctx.hookContext))
    },
    onUpdate: (hook) => {
      ctx.updateHooks.add(hook)
    },
    onCursorMove: (hook) => {
      ctx.cursorMoveHooks.add(hook)
    },
    setInvisible(value) {
      ctx.lastInvisible = ctx.invisible
      ctx.invisible = value
    },
    getInvisible: () => ctx.invisible,
  }

  const hookContext: HookContext = {
    getAxisValue: (index) => {
      const value = axisMap.get(index)!

      if (Math.abs(value) < 0.05)
        return 0
      return value
    },
    getTriggerValue: index => triggerMap.get(index) || 0,
    isButtonJustPressed: index => buttonMap.get(index)?.justPressed || false,
    isButtonJustReleased: index => buttonMap.get(index)?.justReleased || false,
    isButtonPressed: index => buttonMap.get(index)?.pressed || false,
    getDelta: () => ctx.delta,
  }

  ctx = Object.preventExtensions({
    active: false,
    lastTime: 0,
    axisMap,
    buttonMap,
    triggerMap,
    invisible: false,
    lastInvisible: false,
    cursor,
    delta: 0,
    animFrameId: -1,
    gamepadIndexes: [],
    updateHooks: new Set(),
    cursorMoveHooks: new Set(),
    presetContext,
    hookContext,
  })

  presets.forEach(preset => preset(ctx.presetContext))

  function update() {
    const currentTime = performance.now()
    ctx.delta = (currentTime - ctx.lastTime) / 1000
    ctx.lastTime = currentTime

    ctx.animFrameId = requestAnimationFrame(update)
    handleTick(ctx)
  }

  function startUpdate() {
    if (ctx.active || ctx.gamepadIndexes.length === 0)
      return

    assign(ctx.cursor.style, {
      display: 'block',
      left: `${lastCursorPosition[0]}px`,
      top: `${lastCursorPosition[1]}px`,
    })

    ctx.active = true
    ctx.lastTime = performance.now()
    ctx.animFrameId = requestAnimationFrame(update)
  }

  function stopUpdate() {
    if (!ctx.active)
      return

    const rect = presetContext.getCursorRect()
    lastCursorPosition[0] = rect.x
    lastCursorPosition[1] = rect.y

    handleReset(ctx)
    ctx.cursor.style.display = 'none'
    ctx.active = false
    cancelAnimationFrame(ctx.animFrameId)
    ctx.animFrameId = -1
  }

  function handlePageLeave() {
    stopUpdate()
  }

  function handlePageFocus() {
    handleReset(ctx)
    setTimeout(() => {
      startUpdate()
    }, 250)
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden')
      handlePageLeave()
    else
      handlePageFocus()
  })

  window.addEventListener('focus', handlePageFocus)
  window.addEventListener('blur', handlePageLeave)

  window.addEventListener('gamepadconnected', (e) => {
    ctx.gamepadIndexes.push(e.gamepad.index)
    startUpdate()
  })

  window.addEventListener('gamepaddisconnected', (e) => {
    const index = ctx.gamepadIndexes.indexOf(e.gamepad.index)
    if (index >= 0)
      ctx.gamepadIndexes.splice(index, 1)

    if (ctx.gamepadIndexes.length === 0)
      stopUpdate()
  })

  window.addEventListener('mousemove', (e) => {
    if (e.buttons !== 999)
      ctx.invisible = true
  })

  window.addEventListener('keydown', () => {
    ctx.invisible = true
  })
}

export type { Preset } from './types'
export { Axis, Button, Trigger }
export { mousePreset, scrollPreset }
