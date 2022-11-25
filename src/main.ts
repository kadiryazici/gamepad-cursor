import { createGamepadPointer } from '../lib/lib'
import { mousePreset } from '../lib/presets/mousePreset'
import { scrollPreset } from '../lib/presets/scrollPreset'
import { assign } from '../lib/utils'

const el = document.createElement('div')

assign(el.style, {
  backgroundColor: 'red',
  width: '30px',
  height: '30px',
  position: 'fixed',
  zIndex: '1000',
  left: '0',
  top: '0',
  borderRadius: '0px 100px 100px 100px',
  boxShadow: '0px 0px 5px 1px rgba(0, 0, 0, .3)',
  pointerEvents: 'none',
})

document.body.append(el)

createGamepadPointer({
  cursor: el,
  presets: [
    mousePreset(2000),
    scrollPreset({
      speed: 2000,
    }),
  ],
})

