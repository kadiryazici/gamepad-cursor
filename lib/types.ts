export interface ButtonMapState {
  pressed: boolean
  justPressed: boolean
  justReleased: boolean
}

export type TriggerMapState = number
export type AxisMapState = number

export type ButtonMap = Map<number, ButtonMapState>
export type TriggerMap = Map<number, TriggerMapState>
export type AxisMap = Map<number, AxisMapState>

export interface HookContext {
  getDelta(): number
  getTriggerValue(index: number): number
  getAxisValue(index: number): number
  isButtonPressed(index: number): boolean
  isButtonJustPressed(index: number): boolean
  isButtonJustReleased(index: number): boolean
}

export type Hook = (context: HookContext) => void

export interface Context {
  active: boolean
  cursor: HTMLElement
  buttonMap: ButtonMap
  triggerMap: TriggerMap
  axisMap: AxisMap
  updateHooks: Set<Hook>
  cursorMoveHooks: Set<Hook>
  delta: number
  animFrameId: number
  gamepadIndexes: number[]
  lastTime: number
  presetContext: PresetContext
  hookContext: HookContext
}

export interface PresetContext {
  moveCursor(x: number, y?: number): void
  getCursorRect(): DOMRect
  onUpdate(hook: Hook): void
  onCursorMove(hook: Hook): void
}

export type Preset = (context: PresetContext) => void

export interface Options {
  presets: Preset[]
  cursor: HTMLElement
}
