import { useState, useEffect } from 'react'
import { X, Copy, Check, Code2, BookOpen, Layers, MousePointer, ShieldCheck } from 'lucide-react'
import { FRAGMENT_SHADER_SOURCE } from '../shaders/aurora-shader.ts'

interface ShaderModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShaderModal({ isOpen, onClose }: ShaderModalProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'glsl'>('walkthrough')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FRAGMENT_SHADER_SOURCE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shader-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shader-modal-title" className="text-base font-bold text-zinc-100 flex items-center gap-2">
                AETHEL GLSL Shader Architecture
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  WebGL2 / GLSL 300 es
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Full-screen fragment pipeline · Mentor walkthrough & source code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'glsl' && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-mono transition-colors cursor-pointer min-h-11 min-w-11"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied GLSL' : 'Copy Source'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 px-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('walkthrough')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'walkthrough'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Section-by-Section Walkthrough (for Mentors)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('glsl')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'glsl'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Complete Fragment Shader Source (.glsl)
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300 leading-relaxed font-sans">
          {activeTab === 'walkthrough' ? (
            <div className="space-y-6">
              {/* Block 1 */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  1. Aspect-Ratio Corrected UV Normalization
                </div>
                <pre className="p-2.5 bg-black/60 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);`}
                </pre>
                <p className="text-xs text-zinc-400">
                  Maps the viewport center to <code className="text-zinc-200">(0.0, 0.0)</code> and normalizes coordinates by the minimum dimension. This guarantees that fluid curls and circular ripples remain perfectly isotropic (undistorted) regardless of viewport aspect ratio or ultrawide screens.
                </p>
              </div>

              {/* Block 2 */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  <MousePointer className="w-4 h-4" />
                  2. Mouse Attraction & Gravitational Vector Field (u_mouse)
                </div>
                <pre className="p-2.5 bg-black/60 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`vec2 toMouse = uv - mouseNorm;
float mouseDist = length(toMouse);
vec2 mousePull = (toMouse / (mouseDist * mouseDist + 0.35)) * 0.18;
vec2 p = uv * 1.6 + mousePull * 0.4;`}
                </pre>
                <p className="text-xs text-zinc-400">
                  Calculates a localized vector field pulling fluid ribbons towards cursor coordinates. The denominator <code className="text-zinc-200">(d² + 0.35)</code> introduces a soft softening radius preventing mathematical singularity at zero distance. The JavaScript host dampens movement via exponential lerp so fluid wake remains buttery smooth.
                </p>
              </div>

              {/* Block 3 */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  <Code2 className="w-4 h-4" />
                  3. Domain Warping: Layered Coordinate Advection
                </div>
                <pre className="p-2.5 bg-black/60 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`// First warp layer (q)
vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t * 0.15), fbm(p + vec2(5.2, 1.3) - t * 0.12));
// Second warp layer (r) fed by first layer
vec2 r = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 0.20), fbm(p + 3.2 * q + vec2(8.3, 2.8) - t * 0.18));
// Final noise sample distorted by both warp fields
float f = fbm(p + 3.8 * r * u_intensity);`}
                </pre>
                <p className="text-xs text-zinc-400">
                  Instead of evaluating fractal noise at standard grid coordinates, we evaluate noise at coordinates shifted by prior noise evaluations: <code className="text-zinc-200">p' = p + fbm(p + fbm(p))</code>. This recursively deforms space, synthesizing natural fluid turbulent shear without requiring memory-heavy Navier-Stokes grids.
                </p>
              </div>

              {/* Block 4 */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  4. Inigo Quilez Cosine Color Palettes
                </div>
                <pre className="p-2.5 bg-black/60 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`vec3 cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.2831853 * (c * t + d));
}`}
                </pre>
                <p className="text-xs text-zinc-400">
                  Calculates continuous, non-linear RGB spectra with periodic cosine waves. Parameter <code className="text-zinc-200">a</code> controls brightness offset, <code className="text-zinc-200">b</code> controls contrast amplitude, <code className="text-zinc-200">c</code> controls frequency, and <code className="text-zinc-200">d</code> controls phase shifts per RGB channel.
                </p>
              </div>

              {/* Block 5 */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  5. Text Contrast Scrim & Film Grain Dither
                </div>
                <pre className="p-2.5 bg-black/60 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`// Contrast scrim: smooth center elliptical exposure reduction
float centerDist = length(uv * vec2(1.0, 1.35));
float textScrim = smoothstep(0.15, 0.85, centerDist);
color = mix(color * (1.0 - u_scrim), color, textScrim);

// High-frequency triangular dither: eliminates 8-bit quantization banding
float grain = filmGrain(gl_FragCoord.xy, fract(u_time * 0.05)) * u_grain;
color += vec3(grain);`}
                </pre>
                <p className="text-xs text-zinc-400">
                  Treats contrast as an architectural constraint: the center region has a progressive luminance reduction scrim ensuring foreground typography maintains WCAG AAA compliance (&gt;7:1 ratio). High-frequency film dither is added to cancel 8-bit banding across wide color screens.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 bg-black/80 rounded-xl font-mono text-xs text-zinc-300 overflow-x-auto border border-zinc-800 leading-normal">
                {FRAGMENT_SHADER_SOURCE}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>FlyRank FE-AA3 · Signature Hero</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer min-h-11 flex items-center"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
