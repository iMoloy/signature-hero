import { useEffect, useRef, useState, useCallback } from 'react'
import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE } from '../shaders/aurora-shader.ts'
import type { PaletteId, TelemetryStats } from '../types/shader.ts'

interface ShaderCanvasProps {
  palette: PaletteId
  intensity?: number
  speed?: number
  grain?: number
  scrim?: number
  reducedMotion?: boolean
  onTelemetry?: (stats: TelemetryStats) => void
  className?: string
}

export function ShaderCanvas({
  palette,
  intensity = 1.0,
  speed = 0.35,
  grain = 0.035,
  scrim = 0.65,
  reducedMotion = false,
  onTelemetry,
  className = '',
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [webglSupported, setWebglSupported] = useState<boolean>(true)

  // Use refs for dynamic uniforms to avoid reconstructing the WebGL context on every prop change
  const propsRef = useRef({ palette, intensity, speed, grain, scrim, reducedMotion })
  useEffect(() => {
    propsRef.current = { palette, intensity, speed, grain, scrim, reducedMotion }
  }, [palette, intensity, speed, grain, scrim, reducedMotion])

  const onTelemetryRef = useRef(onTelemetry)
  useEffect(() => {
    onTelemetryRef.current = onTelemetry
  }, [onTelemetry])

  // Mouse interpolation state (smooth lerping)
  const mouseRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isDown: false,
  })

  // Handle pointer interactions
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    mouseRef.current.targetX = (e.clientX - rect.left) * dpr
    mouseRef.current.targetY = (e.clientY - rect.top) * dpr
  }, [])

  const handlePointerDown = useCallback(() => {
    mouseRef.current.isDown = true
  }, [])

  const handlePointerUp = useCallback(() => {
    mouseRef.current.isDown = false
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Request WebGL2 context with high-performance power preference
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    })

    if (!gl) {
      console.warn('WebGL2 not supported on this device. Activating CSS fallback.')
      setWebglSupported(false)
      return
    }

    // Helper: compile shader
    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertShader = compileShader(VERTEX_SHADER_SOURCE, gl.VERTEX_SHADER)
    const fragShader = compileShader(FRAGMENT_SHADER_SOURCE, gl.FRAGMENT_SHADER)

    if (!vertShader || !fragShader) {
      setWebglSupported(false)
      return
    }

    const program = gl.createProgram()
    if (!program) {
      setWebglSupported(false)
      return
    }

    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      setWebglSupported(false)
      return
    }

    gl.useProgram(program)

    // Fullscreen screen-space quad (-1 to +1)
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    // Query uniform locations
    const uTimeLoc = gl.getUniformLocation(program, 'u_time')
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse')
    const uPaletteLoc = gl.getUniformLocation(program, 'u_palette')
    const uIntensityLoc = gl.getUniformLocation(program, 'u_intensity')
    const uGrainLoc = gl.getUniformLocation(program, 'u_grain')
    const uScrimLoc = gl.getUniformLocation(program, 'u_scrim')
    const uSpeedLoc = gl.getUniformLocation(program, 'u_speed')

    // Initial mouse center
    const initialDpr = Math.min(window.devicePixelRatio || 1, 2)
    const initialWidth = canvas.clientWidth * initialDpr
    const initialHeight = canvas.clientHeight * initialDpr
    mouseRef.current.currentX = initialWidth * 0.5
    mouseRef.current.currentY = initialHeight * 0.4
    mouseRef.current.targetX = mouseRef.current.currentX
    mouseRef.current.targetY = mouseRef.current.currentY

    // Telemetry tracking variables
    let animationFrameId: number | null = null
    let startTime = performance.now()
    let lastFrameTime = startTime
    let frameCount = 0
    let lastFpsUpdate = startTime
    let currentFps = 60
    let isTabVisible = !document.hidden

    // Resize handling with devicePixelRatio cap
    const resizeCanvasToDisplaySize = (): boolean => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const displayWidth = Math.round(canvas.clientWidth * dpr)
      const displayHeight = Math.round(canvas.clientHeight * dpr)

      const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight
      if (needResize) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      }
      return needResize
    }

    // Single frame draw routine
    const renderFrame = (elapsedTimeSec: number) => {
      resizeCanvasToDisplaySize()

      const currentProps = propsRef.current

      // Lerp mouse coordinates smoothly
      const mouse = mouseRef.current
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.08
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.08

      // Upload uniforms
      gl.uniform1f(uTimeLoc, elapsedTimeSec)
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height)
      gl.uniform4f(
        uMouseLoc,
        mouse.currentX,
        mouse.currentY,
        mouse.targetX,
        mouse.isDown ? 1.0 : 0.0
      )
      gl.uniform1i(uPaletteLoc, currentProps.palette)
      gl.uniform1f(uIntensityLoc, currentProps.intensity)
      gl.uniform1f(uGrainLoc, currentProps.grain)
      gl.uniform1f(uScrimLoc, currentProps.scrim)
      gl.uniform1f(uSpeedLoc, currentProps.speed)

      // Draw the full-screen quad
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    // Animation loop with pause on tab hide and prefers-reduced-motion bypass
    const loop = (now: number) => {
      // FPS measurement
      frameCount++
      if (now - lastFpsUpdate >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate))
        frameCount = 0
        lastFpsUpdate = now
      }

      const elapsedSec = (now - startTime) * 0.001
      renderFrame(elapsedSec)

      // Send telemetry updates
      if (onTelemetryRef.current) {
        onTelemetryRef.current({
          fps: currentFps,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
          width: canvas.width,
          height: canvas.height,
          time: elapsedSec,
          mouseX: Math.round(mouseRef.current.currentX),
          mouseY: Math.round(mouseRef.current.currentY),
          isPaused: !isTabVisible,
          isReducedMotion: propsRef.current.reducedMotion,
        })
      }

      // If user desires reduced motion, we stop the loop after drawing one high-res beauty frame!
      if (propsRef.current.reducedMotion) {
        animationFrameId = null
        return
      }

      // Schedule next frame if tab is active
      if (isTabVisible) {
        animationFrameId = requestAnimationFrame(loop)
      }
    }

    // Check system prefers-reduced-motion media query
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        // Draw static frame at aesthetic moment (t = 2.45s)
        renderFrame(2.45)
      } else if (isTabVisible && animationFrameId === null) {
        startTime = performance.now()
        animationFrameId = requestAnimationFrame(loop)
      }
    }
    motionMediaQuery.addEventListener('change', handleMotionPreferenceChange)

    // Visibility change listener: pause when tab is hidden, resume when active
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden
      if (isTabVisible) {
        if (animationFrameId === null && !propsRef.current.reducedMotion && !motionMediaQuery.matches) {
          lastFrameTime = performance.now()
          animationFrameId = requestAnimationFrame(loop)
        }
      } else {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start initial frame or loop
    if (propsRef.current.reducedMotion || motionMediaQuery.matches) {
      renderFrame(2.45)
      if (onTelemetryRef.current) {
        onTelemetryRef.current({
          fps: 0,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
          width: canvas.width,
          height: canvas.height,
          time: 2.45,
          mouseX: Math.round(mouseRef.current.currentX),
          mouseY: Math.round(mouseRef.current.currentY),
          isPaused: true,
          isReducedMotion: true,
        })
      }
    } else {
      animationFrameId = requestAnimationFrame(loop)
    }

    // Cleanup resources on unmount
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionMediaQuery.removeEventListener('change', handleMotionPreferenceChange)

      gl.deleteBuffer(positionBuffer)
      gl.deleteShader(vertShader)
      gl.deleteShader(fragShader)
      gl.deleteProgram(program)
    }
  }, [reducedMotion]) // Re-bind if reducedMotion toggles

  if (!webglSupported) {
    return (
      <div
        className={`w-full h-full min-h-screen ${className}`}
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #083344 0%, #022c22 45%, #09090b 100%)',
        }}
        aria-label="Fallback static aurora background"
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`block w-full h-full select-none touch-none ${className}`}
      aria-hidden="true"
    />
  )
}
