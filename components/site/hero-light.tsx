"use client"

import * as React from "react"

/*
 * The hero's band of light, as cloth.
 * ---------------------------------------------------------------------------
 * One ribbon of satin lying diagonally across the top of the landing: a height
 * field of long folds, lit like a surface — diffuse for the body, a tight
 * specular for the sheen — so the light has form instead of being a blur.
 * The folds drift on noise, slowly enough that it reads as breathing, not as a
 * screensaver, and the light source leans a little toward the pointer, so the
 * sheen slides across the folds as if the cloth were tilted.
 *
 * It is plain WebGL 1 with one full-screen triangle, rendered at CSS-pixel
 * density at most (the light is soft; the grain overlay supplies the fine
 * texture), paused off-screen and in background tabs, and drawn once and left
 * still under reduced motion. Where WebGL is missing or its context is lost,
 * the canvas flags `data-fallback` and the CSS bands beside it take over.
 */

const VERTEX = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT = `
precision highp float;

uniform vec2 uResolution; // canvas size, device px
uniform vec2 uOrigin;     // where the ribbon is anchored, device px from top-left
uniform float uUnit;      // device px per shader unit
uniform float uTime;
uniform float uReveal;
uniform vec2 uPointer;    // -1..1, smoothed

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

vec2 gradient(vec2 cell) {
  float a = hash(cell) * 6.2831853;
  return vec2(cos(a), sin(a));
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(gradient(i), f);
  float b = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Ribbon space: x runs along the ribbon, y across it.
vec2 ribbonSpace(vec2 p, float t) {
  p += uPointer * vec2(0.012, 0.008);
  float a = -0.2;
  vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
  q.y -= 0.07 * q.x * q.x;
  q.y += 0.05 * sin(q.x * 1.3 + t * 0.07);
  return q;
}

// The cloth: long folds along the ribbon, gathered and spread by noise.
float folds(vec2 q, float t) {
  vec2 w = q + 0.18 * vec2(
    noise(q * 1.1 + vec2(0.0, t * 0.05)),
    noise(q * 1.1 + vec2(5.2, -t * 0.04))
  );
  float y = w.y * 7.5 + 1.6 * noise(vec2(w.x * 0.9 - t * 0.06, 3.1));
  float h = sin(y);
  h += 0.45 * sin(y * 2.1 + 2.0 * noise(w * 1.7 + t * 0.03));
  return h;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 p = (px - uOrigin) / uUnit;
  p.y = -p.y;
  float t = uTime;

  vec2 q = ribbonSpace(p, t);

  float e = 0.002;
  float h = folds(q, t);
  float hx = folds(q + vec2(e, 0.0), t) - h;
  float hy = folds(q + vec2(0.0, e), t) - h;
  vec3 n = normalize(vec3(-hx / e * 0.075, -hy / e * 0.075, 1.0));

  vec3 light = normalize(vec3(-0.25 + uPointer.x * 0.3, 0.75 - uPointer.y * 0.2, 0.62));
  vec3 halfway = normalize(light + vec3(0.0, 0.0, 1.0));
  float lit = pow(max(dot(n, light), 0.0), 1.6);
  float sheen = pow(max(dot(n, halfway), 0.0), 36.0);

  // The ribbon's cross-section, and where it starts and ends along its length.
  float width = 0.19 + 0.05 * noise(vec2(q.x * 0.8 + t * 0.04, 1.7));
  float body = exp(-pow(q.y / width, 2.0));
  float unfurl = (1.0 - uReveal) * 2.6;
  float span = smoothstep(-1.35 + unfurl, -0.25 + unfurl, q.x) * smoothstep(1.6, 0.7, q.x);
  body *= span;

  vec3 shadow = vec3(0.02, 0.05, 0.24);
  vec3 indigo = vec3(0.13, 0.24, 1.0);
  vec3 azure = vec3(0.08, 0.46, 1.0);
  vec3 ice = vec3(0.78, 0.89, 1.0);
  vec3 mid = mix(indigo, azure, smoothstep(-0.8, 0.8, q.x));
  vec3 cloth = mix(shadow, mid, lit) + ice * sheen * 0.75;
  float amount = body * (0.25 + 0.75 * lit + 0.5 * sheen);

  // The bar sits on dark, and nothing may reach the canvas edge at the
  // bottom: it hands off to the page.
  amount *= smoothstep(0.0, 0.2, px.y / uUnit);
  amount *= smoothstep(uResolution.y, uResolution.y * 0.55, px.y);
  amount *= smoothstep(0.0, 0.35, uReveal);

  vec3 base = vec3(0.035, 0.035, 0.043);
  vec3 color = base + cloth * clamp(amount, 0.0, 1.1);
  color += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(color, 1.0);
}
`

const REVEAL_MS = 2200
// Start the clock part-way in: this is the drape the page opens on.
const TIME_OFFSET = 0

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function HeroLight({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const fallBack = () => {
      canvas.dataset.fallback = "true"
    }

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    })
    if (!gl) return fallBack()

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    if (!vertex || !fragment || !program) return fallBack()
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fallBack()
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "aPosition")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const uResolution = uniform("uResolution")
    const uOrigin = uniform("uOrigin")
    const uUnit = uniform("uUnit")
    const uTime = uniform("uTime")
    const uReveal = uniform("uReveal")
    const uPointer = uniform("uPointer")

    const DEBUG_T = Number(new URLSearchParams(location.search).get("heroT") ?? NaN) // TEMP
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let started = 0
    let frame = 0
    let onScreen = true
    let lost = false

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      // The cloth is sized off the width, within limits, so phones see a
      // close-up of the same drape rather than a squeezed one.
      const unit = Math.min(Math.max(width * 0.7, 560), 1100)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform2f(uOrigin, canvas.width * 0.5, Math.min(height * 0.3, unit * 0.31) * scale)
      gl.uniform1f(uUnit, unit * scale)
    }

    const draw = (now: number) => {
      if (!started) started = now
      const elapsed = now - started
      const reveal = still ? 1 : Math.min(elapsed / REVEAL_MS, 1)
      const eased = 1 - Math.pow(1 - reveal, 3)
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      gl.uniform1f(uTime, Number.isNaN(DEBUG_T) ? TIME_OFFSET + (still ? 0 : elapsed / 1000) : DEBUG_T)
      gl.uniform1f(uReveal, eased)
      gl.uniform2f(uPointer, pointer.x, pointer.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      canvas.dataset.ready = "true"
    }

    const loop = (now: number) => {
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    const start = () => {
      if (lost || frame) return
      if (still) {
        draw(performance.now())
        return
      }
      frame = requestAnimationFrame(loop)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const sync = () => {
      if (onScreen && !document.hidden) start()
      else stop()
    }

    resize()
    const resizer = new ResizeObserver(() => {
      resize()
      if (still) draw(performance.now())
    })
    resizer.observe(canvas)

    const watcher = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
      sync()
    })
    watcher.observe(canvas)

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
    }

    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      stop()
      delete canvas.dataset.ready
      fallBack()
    }

    if (!still) window.addEventListener("pointermove", onPointer, { passive: true })
    document.addEventListener("visibilitychange", sync)
    canvas.addEventListener("webglcontextlost", onLost)
    sync()

    return () => {
      stop()
      resizer.disconnect()
      watcher.disconnect()
      window.removeEventListener("pointermove", onPointer)
      document.removeEventListener("visibilitychange", sync)
      canvas.removeEventListener("webglcontextlost", onLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      delete canvas.dataset.ready
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
