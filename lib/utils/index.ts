export function assign<T extends object>(obj: T, values: Partial<T>): void {
  Object.assign(obj, values)
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max)
}
