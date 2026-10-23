import { useState } from 'react'
import { Sliders, RotateCcw, Zap, Sparkles, Moon } from 'lucide-react'
import { PALETTES, type PaletteId, type ShaderConfig } from '../types/shader.ts'

interface ShaderControlsProps {
  config: ShaderConfig
  onChange: (newConfig: ShaderConfig) => void
  onReset: () => void
}

export function ShaderControls({ config, onChange, onReset }: ShaderControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePaletteSelect = (paletteId: PaletteId) => {
    onChange({ ...config, palette: paletteId })
  }

  const handleSliderChange = (key: keyof ShaderConfig, value: number) => {
    onChange({ ...config, [key]: value })
  }

  const toggleReducedMotion = () => {
    onChange({ ...config, reducedMotion: !config.reducedMotion })
  }

  return (
    <aside aria-label="Shader Settings" className="fixed bottom-4 right-4 z-30 font-mono text-xs">
      {/* Control trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="shader-controls-panel"
        className="hud-pill flex items-center gap-2 px-3 py-2 rounded-full text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer min-h-11 min-w-11 float-right"
      >
        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold uppercase tracking-wider text-[11px]">
          Shader Studio
        </span>
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: PALETTES[config.palette].accentColor }}
        />
      </button>

      {/* Control panel drawer */}
      {isOpen && (
        <div
          id="shader-controls-panel"
          className="hud-panel clear-both mt-2 p-4 rounded-xl w-72 sm:w-88 space-y-4 text-zinc-300 text-[11px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-zinc-100 uppercase tracking-wider text-[11px]">
                Shader Parameters
              </span>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Reset parameters to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Palette selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              Cosine Color Palette
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.values(PALETTES) as typeof PALETTES[PaletteId][]).map((p) => {
                const isActive = config.palette === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePaletteSelect(p.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer min-h-11 border ${
                      isActive
                        ? 'bg-zinc-800/90 text-white border-zinc-500 shadow-sm'
                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.accentColor }}
                    />
                    <div className="overflow-hidden">
                      <span className="font-semibold block text-[10px] leading-tight truncate">
                        {p.name}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive Uniform Sliders */}
          <div className="space-y-3 border-t border-zinc-800 pt-3">
            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Flow Velocity (u_speed)</span>
                <span className="text-zinc-200 font-medium">{config.speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={config.speed}
                onChange={(e) => handleSliderChange('speed', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                aria-label="Flow velocity"
              />
            </div>

            {/* Intensity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Warp Distortion (u_intensity)</span>
                <span className="text-zinc-200 font-medium">{config.intensity.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.2"
                step="0.1"
                value={config.intensity}
                onChange={(e) => handleSliderChange('intensity', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                aria-label="Warp distortion intensity"
              />
            </div>

            {/* Contrast Scrim */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Contrast Scrim (u_scrim)</span>
                <span className="text-zinc-200 font-medium">{(config.scrim * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={config.scrim}
                onChange={(e) => handleSliderChange('scrim', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                aria-label="Contrast scrim intensity"
              />
            </div>

            {/* Film Grain */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400">Film Dither Grain (u_grain)</span>
                <span className="text-zinc-200 font-medium">{(config.grain * 1000).toFixed(0)}‰</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.08"
                step="0.005"
                value={config.grain}
                onChange={(e) => handleSliderChange('grain', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                aria-label="Film dither grain"
              />
            </div>
          </div>

          {/* Reduced Motion Toggle Button */}
          <div className="border-t border-zinc-800 pt-3">
            <button
              type="button"
              onClick={toggleReducedMotion}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer min-h-11 ${
                config.reducedMotion
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {config.reducedMotion ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Zap className="w-4 h-4 text-cyan-400" />
                )}
                <div className="text-left">
                  <span className="font-semibold block text-[11px] leading-tight">
                    {config.reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
                  </span>
                  <span className="text-[9px] text-zinc-400">
                    {config.reducedMotion
                      ? 'Loop cancelled · Static frame active'
                      : 'Live 60 FPS animation loop'}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  config.reducedMotion ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {config.reducedMotion ? '0 FPS' : '60 FPS'}
              </span>
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
