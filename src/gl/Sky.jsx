import { useEffect, useRef } from 'react'
import { sky } from './sky-state'
import { reduceMotion } from '../lib/gsap'

/*
  Céu em WebGL puro, fixo atrás da página.
  - dia: creme quente, sol com borda tremendo de calor, nuvens de poeira dourada
  - pôr do sol: passa por laranja/rosado quando uNight ~ 0.5
  - noite: carvão, lua, estrelas piscando, brasa da fogueira e fagulhas subindo
  - horizonte muda com a vibe: morros (chácara), tendas A-frame + mata (cabanas), ondas (Ody)
*/

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uNight;
uniform float uScroll;
uniform vec2 uPointer;
uniform vec3 uAccent;
uniform vec3 uAccent2;
uniform vec3 uShape;
uniform float uFire;
uniform float uMoon;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0; float a = 0.5; for(int i=0;i<4;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }
// versão barata (3 oitavas) pro horizonte
float fbm3(vec2 p){ float v = 0.5*noise(p); p *= 2.03; v += 0.25*noise(p); p *= 2.03; v += 0.125*noise(p); return v; }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  float portrait = step(asp, 1.0);
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y);
  float n = clamp(uNight, 0.0, 1.0);
  float dusk = smoothstep(0.0, 0.5, n) * (1.0 - smoothstep(0.5, 1.0, n));

  // ---------- céu ----------
  float g = uv.y;
  vec3 day   = mix(vec3(1.0, 0.905, 0.76), vec3(1.0, 0.99, 0.965), pow(g, 0.65));
  vec3 du    = mix(vec3(0.99, 0.52, 0.26), vec3(0.36, 0.2, 0.33), pow(g, 0.8));
  vec3 night = mix(vec3(0.17, 0.09, 0.055), vec3(0.052, 0.045, 0.04), pow(g, 0.45));
  vec3 col = mix(day, night, smoothstep(0.15, 0.95, n));
  col = mix(col, du, dusk * 0.9);

  // poeira dourada / nuvens lentas
  float cl = fbm(vec2(p.x*1.1 + uTime*0.012, g*2.4 - uTime*0.008));
  vec3 cloudTint = mix(mix(uAccent2, vec3(1.0), 0.6), vec3(1.0, 0.6, 0.45), dusk);
  col = mix(col, cloudTint, (1.0 - n*0.85) * 0.22 * smoothstep(0.48, 0.92, cl) * smoothstep(0.25, 0.9, g));

  // ---------- sol ----------
  vec2 sunPos = vec2(mix(asp*0.26, asp*0.2, portrait) + uPointer.x*0.025,
                     mix(mix(0.72, 0.8, portrait), 0.68, uScroll) + uPointer.y*0.015);
  sunPos.y = mix(sunPos.y, -0.3, smoothstep(0.0, 0.8, n));
  float r = mix(0.13, 0.12, portrait);
  float d = length(p - sunPos);
  float wob = (noise(p*7.0 + vec2(0.0, uTime*0.5)) - 0.5) * 0.004;
  float disc = smoothstep(r + 0.003 + wob, r - 0.003 + wob, d);
  vec3 sunCol = mix(vec3(1.0, 0.72, 0.16), vec3(1.0, 0.38, 0.1), clamp(dusk*1.4 + n*0.5, 0.0, 1.0));
  float glow = exp(-d*4.5)*0.5 + exp(-d*13.0)*0.35;
  col += sunCol * glow * (1.0 - n*0.85) * 0.5;
  // listras de calor dentro do sol (tipo pôster de verão)
  float stripes = step(0.5, fract((p.y - sunPos.y)*28.0 - uTime*0.15));
  float lower = smoothstep(0.0, -r*0.9, p.y - sunPos.y);
  // depois da home o sol fica mais discreto pra não brigar com o texto
  float sunA = mix(1.0, 0.42, smoothstep(0.02, 0.1, uScroll));
  col = mix(col, sunCol, disc * (1.0 - lower*stripes*0.85) * sunA);

  // ---------- lua ----------
  // lua pequena no canto superior direito (longe do texto, que é alinhado à esquerda)
  float mr = mix(0.055, 0.04, portrait);
  vec2 moonPos = vec2(mix(asp*0.44, asp*0.3, portrait), mix(-0.3, mix(0.86, 0.83, portrait), smoothstep(0.45, 1.0, n)));
  float md = length(p - moonPos);
  float moon = smoothstep(mr, mr - 0.004, md) * smoothstep(mr*0.85, mr*0.97, length(p - moonPos - vec2(mr*0.42, mr*0.22)));
  col += vec3(1.0, 0.8, 0.55) * exp(-md*10.0) * 0.08 * n * uMoon;
  col = mix(col, vec3(1.0, 0.93, 0.78), moon * n * 0.85 * uMoon);

  // ---------- estrelas (só calcula de noite) ----------
  if (n > 0.5) {
  vec2 sg = p * 70.0;
  vec2 si = floor(sg);
  vec2 sf = fract(sg) - 0.5;
  float h = hash(si);
  vec2 jit = vec2(hash(si + 1.3), hash(si + 7.1)) - 0.5;
  float star = step(0.982, h) * smoothstep(0.16, 0.0, length(sf + jit*0.6));
  star *= 0.45 + 0.55*sin(uTime*1.7 + h*60.0);
  col += vec3(1.0, 0.92, 0.78) * star * smoothstep(0.55, 1.0, n) * smoothstep(0.22, 0.55, g);
  }

  // ---------- horizonte (muda com a vibe) ----------
  float x = p.x;
  float hills = 0.0;
  float trees = 0.0;
  float waves = 0.0;
  if (uShape.x > 0.001) hills = 0.12 + 0.06*fbm3(vec2(x*1.15, 1.7)) + 0.025*sin(x*2.3 + 1.0);
  if (uShape.y > 0.001) {
    trees = 0.095 + 0.05*fbm3(vec2(x*7.0, 3.1));
    float tri = abs(fract(x*2.6) - 0.5) * 2.0;
    float isTent = step(0.45, hash(vec2(floor(x*2.6), 9.0)));
    trees = max(trees, 0.075 + (1.0 - tri)*0.085*isTent);
  }
  if (uShape.z > 0.001) waves = 0.095 + 0.013*sin(x*8.0 + uTime*1.3) + 0.007*sin(x*21.0 - uTime*2.2) + 0.004*sin(x*47.0 + uTime*3.0);
  float wsum = max(uShape.x + uShape.y + uShape.z, 0.001);
  float hz = (hills*uShape.x + trees*uShape.y + waves*uShape.z) / wsum;
  hz *= mix(1.0, 0.82, portrait);
  float hz2 = hz + 0.05 + 0.035*fbm3(vec2(x*0.7 + 5.0, 2.0));

  vec3 silBackDay = mix(col, uAccent, 0.13);
  vec3 silFrontDay = mix(day, uAccent, 0.32);
  vec3 silNight = vec3(0.035, 0.03, 0.027);
  float l2 = smoothstep(hz2 + 0.0025, hz2 - 0.0025, g);
  float l1 = smoothstep(hz + 0.0025, hz - 0.0025, g);
  col = mix(col, mix(silBackDay, mix(silNight, col, 0.45), n), l2 * 0.9);
  col = mix(col, mix(silFrontDay, silNight, smoothstep(0.1, 0.8, n)), l1);
  // brilho da água no Ody
  if (uShape.z > 0.001 && l1 > 0.0) col += step(0.93, noise(vec2(x*40.0, g*90.0 - uTime*0.8))) * l1 * uShape.z * (1.0 - n) * 0.25;

  // ---------- fogueira + fagulhas (só de noite) ----------
  if (n > 0.4 && uFire > 0.01) {
  float flick = 0.8 + 0.2*noise(vec2(uTime*4.0, 1.0));
  float fd = length((p - vec2(0.0, 0.02)) * vec2(1.0, 1.7));
  col += vec3(1.0, 0.4, 0.08) * exp(-fd*3.4) * 0.6 * smoothstep(0.4, 1.0, n) * uFire * flick;
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float sp = 0.06 + 0.06*hash(vec2(fi, 1.0));
    float t = fract(uTime*sp + hash(vec2(fi, 2.0)));
    vec2 q = vec2((hash(vec2(fi, 3.0)) - 0.5)*0.45 + sin(t*7.0 + fi)*0.035, 0.05 + t*0.75);
    float s = smoothstep(0.007, 0.0, length(p - q)) * (1.0 - t);
    col += vec3(1.0, 0.62, 0.22) * s * smoothstep(0.5, 1.0, n) * uFire * 2.0;
  }
  }

  // vinheta da noite
  col *= 1.0 - 0.28*n*smoothstep(0.3, 0.95, length(uv - vec2(0.5, 0.45)));
  col += (hash(gl_FragCoord.xy + floor(uTime*12.0)) - 0.5) * mix(0.045, 0.03, n);
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s))
    return null
  }
  return s
}

export default function Sky() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false })
    if (!gl) {
      canvas.style.display = 'none'
      return
    }
    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const U = {}
    ;['uRes', 'uTime', 'uNight', 'uScroll', 'uPointer', 'uAccent', 'uAccent2', 'uShape', 'uFire', 'uMoon'].forEach(
      (k) => (U[k] = gl.getUniformLocation(prog, k)),
    )

    // céu é suave: dá pra renderizar em resolução menor e escalar sem perder nada
    const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches
    const scale = mobile ? 0.42 * Math.min(devicePixelRatio || 1, 2) : 0.6 * Math.min(devicePixelRatio || 1, 1.5)
    let lastW = 0
    let lastH = 0
    const resize = () => {
      // no celular a barra do navegador muda a altura o tempo todo: só refaz o canvas
      // quando a largura muda ou a altura cresce de verdade
      const w = innerWidth
      const h = Math.max(innerHeight, document.documentElement.clientHeight)
      if (w === lastW && h <= lastH) return
      lastW = w
      lastH = Math.max(h, lastH)
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(lastH * scale)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    addEventListener('resize', resize)

    // ponteiro suave (parallax do sol)
    const target = { x: 0, y: 0 }
    const onMove = (e) => {
      target.x = (e.clientX / innerWidth) * 2 - 1
      target.y = -((e.clientY / innerHeight) * 2 - 1)
    }
    addEventListener('pointermove', onMove, { passive: true })

    const still = reduceMotion()
    let raf
    let running = true
    const t0 = performance.now()
    // celular: 30 quadros/s bastam pro céu e liberam a GPU pra rolagem
    const minDt = mobile ? 1000 / 31 : 0
    let last = 0
    const frame = (now) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (now - last < minDt) return
      last = now
      sky.px += (target.x - sky.px) * 0.04
      sky.py += (target.y - sky.py) * 0.04
      gl.uniform2f(U.uRes, canvas.width, canvas.height)
      gl.uniform1f(U.uTime, still ? 12 : (now - t0) / 1000)
      gl.uniform1f(U.uNight, sky.night)
      gl.uniform1f(U.uScroll, sky.scroll)
      gl.uniform2f(U.uPointer, sky.px, sky.py)
      gl.uniform3f(U.uAccent, sky.accent.r, sky.accent.g, sky.accent.b)
      gl.uniform3f(U.uAccent2, sky.accent2.r, sky.accent2.g, sky.accent2.b)
      gl.uniform3f(U.uShape, sky.shape.a, sky.shape.b, sky.shape.c)
      gl.uniform1f(U.uFire, sky.fire)
      gl.uniform1f(U.uMoon, sky.moon)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(frame)

    const onVis = () => {
      running = !document.hidden
      if (running) raf = requestAnimationFrame(frame)
      else cancelAnimationFrame(raf)
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="sky" aria-hidden="true" />
}
