import { Activity, Cpu, Eye, Gauge, Monitor, Sparkles } from 'lucide-react'
import type { TelemetryStats } from '../types/shader.ts'

interface TelemetryHudProps {
  stats: TelemetryStats | null
  isOpen: boolean
  onToggle: () => void
}

export function TelemetryHud({ stats, isOpen, onToggle }: TelemetryHudProps) {
  if (!stats) return null

  return (
    <aside aria-label="Shader Uniforms and Telemetry" className="fixed bottom-4 left-4 z-30 font-mono text-xs">
      {/* Toggle button */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="telemetry-panel"
        className="hud-pill flex items-center gap-2 px-3 py-2 rounded-full text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer min-h-11 min-w-11"
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              stats.isReducedMotion ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              stats.isReducedMotion ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        </span>
        <span className="font-semibold tracking-wider uppercase text-[11px]">
          {stats.isReducedMotion ? 'Static Frame' : `${stats.fps} FPS`}
        </span>
        <span className="text-zinc-500 text-[10px]">({isOpen ? 'Hide Telemetry' : 'Show Uniforms'})</span>
      </button>

      {/* Expanded telemetry HUD card */}
      {isOpen && (
        <div
          id="telemetry-panel"
          className="hud-panel mt-2 p-3.5 rounded-xl w-72 sm:w-80 space-y-2.5 text-zinc-300 text-[11px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-100 uppercase tracking-wider text-[10px]">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Live Uniform Telemetry
            </span>
            <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800">
              WebGL2 Core
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" /> u_time
              </span>
              <span className="text-zinc-100 font-medium">
                {stats.time.toFixed(3)}s
              </span>
            </div>

            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Monitor className="w-3 h-3 text-emerald-400" /> u_resolution
              </span>
              <span className="text-zinc-100 font-medium">
                {stats.width} × {stats.height}
              </span>
            </div>

            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800/80 col-span-2">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> u_mouse (x, y)
              </span>
              <span className="text-zinc-100 font-medium">
                ({stats.mouseX}, {stats.mouseY}) px
              </span>
            </div>

            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-400" /> DPR Clamping
              </span>
              <span className="text-zinc-100 font-medium">
                {stats.dpr}x (max 2.0)
              </span>
            </div>

            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" /> Tab Visibility
              </span>
              <span className={`font-medium ${stats.isPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stats.isPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-2">
            {stats.isReducedMotion
              ? '⚡ Reduced Motion: Loop cancelled, rendering static snapshot (0% GPU burn).'
              : '✓ Tab visibility listener & DPR clamp active. 60 FPS continuous fluid integration.'}
          </p>
        </div>
      )}
    </aside>
  )
}
