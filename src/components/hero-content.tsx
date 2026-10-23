import { ArrowUpRight, Code2, Sparkles, Shield, Cpu, Moon, Zap } from 'lucide-react'
import type { PaletteInfo } from '../types/shader.ts'

interface HeroContentProps {
  currentPalette: PaletteInfo
  isReducedMotion: boolean
  onToggleReducedMotion: () => void
  onOpenShaderModal: () => void
  onToggleTelemetry: () => void
}

export function HeroContent({
  currentPalette,
  isReducedMotion,
  onToggleReducedMotion,
  onOpenShaderModal,
  onToggleTelemetry,
}: HeroContentProps) {
  return (
    <section aria-label="Hero Introduction" className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-32 sm:py-36 flex flex-col items-center text-center">
      {/* Editorial Category Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/60 backdrop-blur-md mb-6 shadow-lg animate-in fade-in duration-500">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: currentPalette.accentColor }}
        />
        <span className="text-[11px] font-mono tracking-wider text-zinc-300 uppercase">
          FE-AA3 · Signature Hero · Week 8
        </span>
        <span className="text-zinc-600 text-xs">|</span>
        <span className="text-[11px] font-mono text-zinc-400">
          GLSL Fragment Pipeline
        </span>
      </div>

      {/* Main Headline (Contrast protected) */}
      <div className="relative">
        {/* Soft background glow & dark scrim behind headline */}
        <div
          className="absolute -inset-x-8 -inset-y-4 -z-10 rounded-3xl bg-zinc-950/60 blur-xl pointer-events-none"
          aria-hidden="true"
        />

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-3xl">
          Visual signatures{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400">
            a template cannot clone.
          </span>
        </h1>
      </div>

      {/* Subtitle / Engineer Intro */}
      <div className="mt-6 max-w-2xl bg-zinc-950/40 p-4 sm:p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
        <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
          Crafted by <strong className="text-white font-semibold">Moloy</strong> — Frontend AI Engineer.
          Behind this surface runs a pure WebGL2 domain-warped fluid shader driven by recursive
          fractional Brownian motion, Inigo Quilez cosine gradients, and gravitational cursor advection.
        </p>

        {/* Feature Checkpoints */}
        <div className="mt-4 pt-4 border-t border-zinc-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>WebGL2 Quad</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Domain Warping</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>DPR Capped ≤ 2</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Tab Sleep & Pause</span>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenShaderModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/20 min-h-11 min-w-11"
        >
          <Code2 className="w-4 h-4 text-cyan-600" />
          <span>Walkthrough Shader Math</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleReducedMotion}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-11 min-w-11 ${
            isReducedMotion
              ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
              : 'hud-pill text-zinc-200 hover:text-white hover:border-zinc-500'
          }`}
        >
          {isReducedMotion ? (
            <>
              <Moon className="w-4 h-4 text-amber-400" />
              <span>Reduced Motion Active (Static)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Test Reduced Motion Fallback</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleTelemetry}
          className="w-full sm:w-auto hud-pill flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm text-zinc-300 hover:text-white hover:border-zinc-500 font-mono transition-all cursor-pointer min-h-11 min-w-11"
        >
          <span>Live Uniforms</span>
        </button>
      </div>

      {/* Active Palette Legend */}
      <div className="mt-6 flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
        <span>Active Palette:</span>
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: currentPalette.accentColor }}
        />
        <strong className="text-zinc-200 font-medium">{currentPalette.name}</strong>
        <span className="text-zinc-600">·</span>
        <span className="text-zinc-400 hidden sm:inline">{currentPalette.subtitle}</span>
      </div>
    </section>
  )
}
