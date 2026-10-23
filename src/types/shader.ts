export type PaletteId = 0 | 1 | 2 | 3

export interface PaletteInfo {
  id: PaletteId
  name: string
  subtitle: string
  accentColor: string
  cssGradient: string
}

export const PALETTES: Record<PaletteId, PaletteInfo> = {
  0: {
    id: 0,
    name: 'Nordic Aurora',
    subtitle: 'Emerald, Vivid Cyan & Deep Indigo',
    accentColor: '#06b6d4',
    cssGradient: 'radial-gradient(ellipse at 50% 30%, #083344 0%, #022c22 45%, #09090b 100%)',
  },
  1: {
    id: 1,
    name: 'Deep Obsidian',
    subtitle: 'Slate Graphite, Cool Chrome & Sapphire',
    accentColor: '#94a3b8',
    cssGradient: 'radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 50%, #09090b 100%)',
  },
  2: {
    id: 2,
    name: 'Solar Ember',
    subtitle: 'Molten Bronze, Terracotta & Radiant Gold',
    accentColor: '#f97316',
    cssGradient: 'radial-gradient(ellipse at 50% 30%, #431407 0%, #291003 50%, #09090b 100%)',
  },
  3: {
    id: 3,
    name: 'Cosmic Twilight',
    subtitle: 'Electric Violet, Neon Magenta & Midnight',
    accentColor: '#c084fc',
    cssGradient: 'radial-gradient(ellipse at 50% 30%, #3b0764 0%, #1e0933 50%, #09090b 100%)',
  },
}

export interface TelemetryStats {
  fps: number
  dpr: number
  width: number
  height: number
  time: number
  mouseX: number
  mouseY: number
  isPaused: boolean
  isReducedMotion: boolean
}

export interface ShaderConfig {
  palette: PaletteId
  intensity: number
  speed: number
  grain: number
  scrim: number
  reducedMotion: boolean
}
