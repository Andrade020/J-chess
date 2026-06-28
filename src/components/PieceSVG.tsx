import type { CSSProperties } from 'react'
import type { Cell, PieceSet } from '../lib/types'
import { pieceClasses, symId } from '../lib/pieces'

export default function PieceSVG({ cell, set, fill, size, noFlip }: {
  cell: Cell
  set: PieceSet
  fill?: boolean
  size?: string
  noFlip?: boolean
}) {
  const flip = (!noFlip && (set === 'kan' || set === 'geo') && cell.o === 'd')
    ? { transform: 'rotate(180deg)' } : {}

  if (set === 'sam' || set === 'oli' || set === 'com') {
    const suffix = (cell.p && cell.t !== 'K' && cell.t !== 'G') ? '-p' : ''
    const src = `/pieces/${set}/${cell.o}-${cell.t}${suffix}.svg`
    const style: CSSProperties = fill
      ? { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none', objectFit: 'contain', filter: 'drop-shadow(0 1.5px 2.5px rgba(30,18,4,.35))', ...flip }
      : { width: size, height: size, display: 'block', pointerEvents: 'none', objectFit: 'contain', ...flip }
    return <img src={src} style={style} alt="" draggable={false} />
  }

  const style: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none', filter: 'drop-shadow(0 1.5px 2.5px rgba(30,18,4,.35))', ...flip }
    : { width: size, height: size, display: 'block', pointerEvents: 'none', ...flip }

  return (
    <svg className={`pc ${pieceClasses(cell, set)}`} viewBox="0 0 100 100" style={style}>
      <use href={`#${symId(cell, set)}`} x="0" y="0" width="100" height="100" />
    </svg>
  )
}
