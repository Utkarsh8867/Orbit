import { useEffect, useRef } from 'react'

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const syncSize = () => {
      const w = canvas.clientWidth || 1280
      const h = canvas.clientHeight || 720
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }
    const ro = new ResizeObserver(syncSize)
    ro.observe(canvas)
    syncSize()

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vs = `attribute vec2 a_position; varying vec2 v_texCoord;
void main() { v_texCoord = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  vec2 uv = v_texCoord;
  vec3 color1 = vec3(0.388, 0.4, 0.945);
  vec3 color2 = vec3(0.988, 0.427, 0.149);
  vec3 bg = vec3(0.043, 0.075, 0.129);
  float t = u_time * 0.2;
  float b1 = smoothstep(0.7, 0.0, distance(uv, vec2(0.2 + 0.1*sin(t), 0.8 + 0.1*cos(t))));
  float b2 = smoothstep(0.7, 0.0, distance(uv, vec2(0.8 + 0.1*cos(t*0.8), 0.2 + 0.1*sin(t*1.2))));
  vec3 c = bg;
  c = mix(c, color1, b1 * 0.15);
  c = mix(c, color2, b2 * 0.15);
  gl_FragColor = vec4(c, 1.0);
}`

    const cs = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes  = gl.getUniformLocation(prog, 'u_resolution')

    let raf: number
    const render = (t: number) => {
      syncSize()
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform1f(uTime, t * 0.001)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-40"
      style={{ display: 'block' }}
    />
  )
}
