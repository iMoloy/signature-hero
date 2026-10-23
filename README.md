# AETHEL — Signature Hero: A Fullscreen Shader (FE-AA3)

[![Track](https://img.shields.io/badge/Track-Frontend%20AI%20Engineering-blue.svg)](.)
[![Assignment](https://img.shields.io/badge/Assignment-FE--AA3-cyan.svg)](.)
[![Week](https://img.shields.io/badge/Week-8-indigo.svg)](.)
[![WebGL](https://img.shields.io/badge/WebGL-2.0%20GLSL%20300es-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
[![Bundle%20Size](https://img.shields.io/badge/Bundle-11.6%20KB%20gzip-success.svg)](.)
[![License](https://img.shields.io/badge/License-MIT-gray.svg)](LICENSE)

> **Signature Hero: A Fullscreen Shader**  
> Week 8 · Frontend AI Engineering Track · FlyRank Assignment `FE-AA3`

A fullscreen interactive domain-warped fragment shader hero designed to provide an uncloneable visual signature for engineering portfolios and AI platforms. Built in pure WebGL2 (zero 3D engine overhead) with recursive coordinate advection, Inigo Quilez cosine color gradients, and real-time gravitational cursor interactivity.

---

## 🧭 Live Demo & Deployment

- **Live Preview:** `https://signature-hero-shader.vercel.app` *(or run locally via `pnpm preview`)*
- **GitHub Repository:** `https://github.com/iMoloy/signature-hero`

---

## ⚡ Key Highlights & Spec Compliance

| Requirement | Implementation Architecture |
| :--- | :--- |
| **Custom / Remixed GLSL Fragment Shader** | Pure WebGL2 fullscreen quad running recursive domain-warping: $\mathbf{p}' = \mathbf{p} + \text{fBm}(\mathbf{p} + \text{fBm}(\mathbf{p} + \text{time}))$. |
| **Core Uniforms Active** | Uses all 3 core uniforms: `u_time` (elapsed seconds), `u_resolution` (viewport dimensions), and `u_mouse` (damped gravitational fluid wake). |
| **Readability & Contrast Engineering** | In-shader elliptical luminance scrim (`u_scrim`) progressively attenuates brightness in the center text zone, guaranteeing WCAG AAA contrast (&gt;7:1) across all palettes. |
| **Responsible Shipping & DPR Cap** | `devicePixelRatio` strictly clamped at `Math.min(window.devicePixelRatio, 2.0)` to eliminate high-DPI GPU thermal strain. |
| **Tab Sleep & Background Pause** | Listens to `visibilitychange` events; instantly pauses `requestAnimationFrame` when the tab is blurred or hidden. |
| **prefers-reduced-motion Fallback** | Detects OS motion settings; halts the animation loop completely (0% GPU/CPU burn) and renders a single static high-resolution frame (or CSS gradient fallback). |
| **Zero 3D Runtime Bloat** | Pure WebGL2 canvas: total application payload is only **11.6 KB gzipped** (vs ~300 KB for Three.js). |

---

## 🎨 Interactive Shader Studio

The application includes an in-app telemetry HUD and control panel:
- **4 Cosine Color Palettes:**
  1. *Nordic Aurora* (Emerald, Vivid Cyan & Deep Indigo)
  2. *Deep Obsidian* (Slate Graphite, Cool Chrome & Sapphire)
  3. *Solar Ember* (Molten Bronze, Terracotta & Radiant Gold)
  4. *Cosmic Twilight* (Electric Violet, Neon Magenta & Midnight)
- **Live Uniform Telemetry:** Real-time stream of `u_time`, `u_mouse (x, y)`, `u_resolution`, active FPS, and DPR.
- **Shader Architecture Inspector:** In-app modal detailing each mathematical block for mentors, with one-click copy of the `.glsl` source.
- **Reduced Motion Simulation:** Instant toggle allowing mentors to test static fallback without modifying operating system preferences.

---

## 💻 Local Development

```bash
# 1. Install dependencies with pnpm
pnpm install

# 2. Start local Vite development server
pnpm dev

# 3. Typecheck and verify production build
pnpm build

# 4. Preview production build locally
pnpm preview
```

---

## 📦 Capstone / Portfolio Drop-in Export

To use this shader as the hero for your Next.js Capstone or portfolio:

```tsx
// In your Next.js page or component (e.g. app/page.tsx)
import { AuroraHero } from '@/components/aurora-hero'

export default function LandingPage() {
  return (
    <main>
      <AuroraHero initialPalette={0} />
    </main>
  )
}
```
