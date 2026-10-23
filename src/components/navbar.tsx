import { Terminal, Code2, ExternalLink } from 'lucide-react'

interface NavbarProps {
  onOpenShaderModal: () => void
}

export function Navbar({ onOpenShaderModal }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/40 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-inner">
          Æ
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white text-sm sm:text-base font-sans">
              AETHEL
            </span>
            <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 px-1.5 py-0.2 rounded bg-zinc-900/80">
              v1.0
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">
            WebGL2 Fragment Shader Experience · FE-AA3
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenShaderModal}
          className="hud-pill flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer min-h-11"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Shader Architecture</span>
          <span className="sm:hidden">GLSL</span>
        </button>

        <a
          href="https://github.com/iMoloy/signature-hero"
          target="_blank"
          rel="noopener noreferrer"
          className="hud-pill flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors min-h-11"
        >
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">GitHub</span>
          <ExternalLink className="w-3 h-3 text-zinc-500" />
        </a>
      </div>
    </header>
  )
}
