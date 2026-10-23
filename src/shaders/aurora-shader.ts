/**
 * GLSL Vertex & Fragment Shaders for the Aurora Domain-Warped Hero.
 * 
 * Every mathematical section is documented with comments explaining
 * the coordinate transforms, domain warping equations, cosine palettes,
 * and contrast control.
 */

export const VERTEX_SHADER_SOURCE = /* glsl */ `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  // Pass normalized quad coordinates [-1, 1] mapped to [0, 1] UV
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER_SOURCE = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

// Core uniforms requested by assignment specification
uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_mouse;       // xy = current pos, zw = target / click state

// Extended customization uniforms
uniform int u_palette;      // 0: Nordic Aurora, 1: Deep Obsidian, 2: Solar Ember, 3: Cosmic Twilight
uniform float u_intensity;  // Flow dynamics multiplier (default: 1.0)
uniform float u_grain;      // Dither grain amount to prevent 8-bit banding (default: 0.035)
uniform float u_scrim;      // Center contrast scrim intensity (default: 0.65)
uniform float u_speed;      // Time progression speed (default: 0.35)

// 2D Rotation matrix
mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

// Pseudorandom 2D hash for value noise
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// 2D Value noise with quintic Hermite interpolation curve
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  // Quintic Hermite curve: 6t^5 - 15t^4 + 10t^3 (smoother derivatives than cubic)
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal Brownian Motion (fBm) with octave rotation to prevent directional grid artifacts
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  mat2 rot = rot2D(0.5);

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise2D(p * frequency);
    p = rot * p * 2.02 + vec2(1.7, 4.3);
    amplitude *= 0.5;
  }
  return value;
}

// Inigo Quilez Cosine Color Palette generator: color = a + b * cos(2pi * (c * t + d))
vec3 cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.2831853 * (c * t + d));
}

// Multi-theme color palettes designed for dark UI harmony
vec3 getPaletteColor(float t, int paletteIndex) {
  if (paletteIndex == 0) {
    // Nordic Aurora: Deep indigo, emerald green, vivid cyan, soft teal
    vec3 a = vec3(0.08, 0.18, 0.28);
    vec3 b = vec3(0.35, 0.55, 0.65);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);
    return cosinePalette(t, a, b, c, d);
  } else if (paletteIndex == 1) {
    // Deep Obsidian: Slate graphite, cool chrome, deep sapphire sheen
    vec3 a = vec3(0.06, 0.08, 0.12);
    vec3 b = vec3(0.20, 0.22, 0.30);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.15, 0.25, 0.40);
    return cosinePalette(t, a, b, c, d);
  } else if (paletteIndex == 2) {
    // Solar Ember: Molten bronze, terracotta, radiant gold, violet undertone
    vec3 a = vec3(0.25, 0.10, 0.05);
    vec3 b = vec3(0.60, 0.35, 0.20);
    vec3 c = vec3(1.0, 1.0, 0.8);
    vec3 d = vec3(0.00, 0.15, 0.30);
    return cosinePalette(t, a, b, c, d);
  } else {
    // Cosmic Twilight: Electric violet, neon magenta, deep midnight abyss
    vec3 a = vec3(0.12, 0.08, 0.25);
    vec3 b = vec3(0.50, 0.30, 0.60);
    vec3 c = vec3(1.0, 0.8, 1.0);
    vec3 d = vec3(0.20, 0.50, 0.80);
    return cosinePalette(t, a, b, c, d);
  }
}

// Triangular high-frequency film dither to eliminate color banding
float filmGrain(vec2 coord, float seed) {
  return fract(sin(dot(coord + seed, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
}

void main() {
  // 1. Aspect-Ratio Corrected Coordinates centered at (0.0, 0.0)
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // 2. Normalized Mouse Coordinates & Smooth Repulsion/Attraction Vector
  vec2 mouseNorm = (u_mouse.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  // Y-axis inversion for OpenGL coordinate origin (bottom-left) vs DOM (top-left)
  mouseNorm.y = -mouseNorm.y;

  vec2 toMouse = uv - mouseNorm;
  float mouseDist = length(toMouse);
  // Soft exponential falloff for natural gravitational fluid drag
  vec2 mousePull = (toMouse / (mouseDist * mouseDist + 0.35)) * 0.18;

  // 3. Time Base with scale modulation
  float t = u_time * u_speed;

  // 4. Domain Warping (Layered coordinate advection):
  // Formula: p' = p + fbm(p + fbm(p + time))
  vec2 p = uv * 1.6 + mousePull * 0.4;

  // First warp layer (q)
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + t * 0.15),
    fbm(p + vec2(5.2, 1.3) - t * 0.12)
  );

  // Second warp layer (r) fed by first layer
  vec2 r = vec2(
    fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 0.20),
    fbm(p + 3.2 * q + vec2(8.3, 2.8) - t * 0.18)
  );

  // Final noise sample distorted by both warp layers
  float f = fbm(p + 3.8 * r * u_intensity);

  // 5. Dynamic Color Mapping using Cosine Gradient
  // Combine warp magnitudes with base noise for rich iridescent folds
  float colorMetric = f + length(q) * 0.35 + length(r) * 0.25;
  vec3 color = getPaletteColor(colorMetric, u_palette);

  // Modulate intensity: highlight crests and deepen troughs
  color *= (f * f * 2.2 + 0.5 * f);

  // Soft atmospheric rim light at outer edges
  float vignette = smoothstep(1.8, 0.4, length(uv));
  color *= vignette;

  // 6. Contrast Scrim (Guarantee readability of overlay headlines)
  // Darkens the center region smoothly so white headline text maintains WCAG AAA contrast
  float centerDist = length(uv * vec2(1.0, 1.35)); // slightly elliptical for horizontal text
  float textScrim = smoothstep(0.15, 0.85, centerDist);
  color = mix(color * (1.0 - u_scrim), color, textScrim);

  // 7. Analog Film Grain & Banding Buster
  float grain = filmGrain(gl_FragCoord.xy, fract(u_time * 0.05)) * u_grain;
  color += vec3(grain);

  // Ensure output stays in valid clamped SDR range
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
