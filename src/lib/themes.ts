import type { BoardTheme } from './types'

export interface ThemeColors {
  frame: string       // outer board frame background
  gridBorder: string  // board grid outer border
  sq: string          // square color when alt is off
  sqL: string         // light square (alt on)
  sqD: string         // dark square (alt on)
  label: string       // coordinate label color
  lastMove: string    // last-move square overlay
  checkSq: string     // check square overlay
  selSq: string       // selected square overlay
  dragSrc: string     // drag-source square
  tgt: string         // move-target dot
}

export const THEMES: Record<BoardTheme, ThemeColors> = {
  wood: {
    frame:      '#5a4124',
    gridBorder: '#3a2a14',
    sq:         '#e4c891',
    sqL:        '#efdcb4',
    sqD:        '#d8b87f',
    label:      '#ecd4a3',
    lastMove:   'rgba(205,210,100,.68)',
    checkSq:    'rgba(210,85,63,.5)',
    selSq:      'rgba(20,85,30,.52)',
    dragSrc:    'rgba(235,210,65,.72)',
    tgt:        'rgba(0,0,0,.17)',
  },
  green: {
    frame:      '#2a4a28',
    gridBorder: '#1a3018',
    sq:         '#8db870',
    sqL:        '#eeeed2',
    sqD:        '#769656',
    label:      '#c8d8a0',
    lastMove:   'rgba(244,246,128,.78)',
    checkSq:    'rgba(200,60,50,.5)',
    selSq:      'rgba(0,100,0,.52)',
    dragSrc:    'rgba(220,235,60,.72)',
    tgt:        'rgba(0,0,0,.18)',
  },
  ocean: {
    frame:      '#1c3f5c',
    gridBorder: '#0e2538',
    sq:         '#5090b8',
    sqL:        '#7bbcd8',
    sqD:        '#3a78a0',
    label:      '#a0d4e8',
    lastMove:   'rgba(200,230,100,.72)',
    checkSq:    'rgba(200,60,50,.5)',
    selSq:      'rgba(0,100,120,.52)',
    dragSrc:    'rgba(200,230,80,.72)',
    tgt:        'rgba(0,0,0,.18)',
  },
  stone: {
    frame:      '#2c2c2c',
    gridBorder: '#1a1a1a',
    sq:         '#909090',
    sqL:        '#b8b8b8',
    sqD:        '#686868',
    label:      '#d0d0d0',
    lastMove:   'rgba(200,210,80,.72)',
    checkSq:    'rgba(200,60,50,.5)',
    selSq:      'rgba(60,120,60,.52)',
    dragSrc:    'rgba(220,230,60,.72)',
    tgt:        'rgba(0,0,0,.2)',
  },
  night: {
    frame:      '#16162a',
    gridBorder: '#0a0a1a',
    sq:         '#2c2c50',
    sqL:        '#3c3c6c',
    sqD:        '#1e1e38',
    label:      '#7878b8',
    lastMove:   'rgba(140,180,230,.58)',
    checkSq:    'rgba(200,60,50,.5)',
    selSq:      'rgba(40,100,140,.58)',
    dragSrc:    'rgba(140,180,230,.58)',
    tgt:        'rgba(255,255,255,.15)',
  },
  sand: {
    frame:      '#7a6644',
    gridBorder: '#5a4a2e',
    sq:         '#c8a870',
    sqL:        '#dcc090',
    sqD:        '#b09060',
    label:      '#e8d0a0',
    lastMove:   'rgba(210,210,80,.72)',
    checkSq:    'rgba(200,60,50,.5)',
    selSq:      'rgba(60,100,40,.52)',
    dragSrc:    'rgba(230,210,60,.72)',
    tgt:        'rgba(0,0,0,.17)',
  },
}

export const THEME_LABELS: Record<BoardTheme, string> = {
  wood:  'Madeira',
  green: 'Verde',
  ocean: 'Oceano',
  stone: 'Pedra',
  night: 'Noite',
  sand:  'Areia',
}
