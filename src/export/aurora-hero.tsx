import { useState, useCallback } from 'react'
import { ShaderCanvas } from '../components/shader-canvas.tsx'
import { HeroContent } from '../components/hero-content.tsx'
import { PALETTES, type PaletteId, type ShaderConfig, type TelemetryStats } from '../types/shader.ts'
import { ShaderModal } from '../components/shader-modal.tsx'

export interface AuroraHeroProps {
  initialPalette?: PaletteId
  headline?: string
  subtitle?: string
  authorName?: string
  className?: string
}

/**
 * AuroraHero - Production-ready fullscreen or contained shader hero component.
 * Compatible with Next.js App Router (mark with 'use client' in Next.js) and standard React.
 */
export function AuroraHero({
  initialPalette = 0,
  className = '',
}: AuroraHeroProps) {
  const [config, setConfig] = useState<ShaderConfig>({
    palette: initialPalette,
    intensity: 1.0,
    speed: 0.35,
    grain: 0.035,
    scrim: 0.65,
    reducedMotion: false,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToggleReducedMotion = useCallback(() => {
    setConfig((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))
  }, [])

  return (
    <div className={`relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Shader */}
      <div className="absolute inset-0 -z-10 w-full h-full pointer-events-auto">
        <ShaderCanvas
          palette={config.palette}
          intensity={config.intensity}
          speed={config.speed}
          grain={config.grain}
          scrim={config.scrim}
          reducedMotion={config.reducedMotion}
        />
      </div>

      {/* Hero Content */}
      <HeroContent
        currentPalette={PALETTES[config.palette]}
        isReducedMotion={config.reducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        onOpenShaderModal={() => setIsModalOpen(true)}
        onToggleTelemetry={() => {}}
      />

      {/* Modal */}
      <ShaderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
