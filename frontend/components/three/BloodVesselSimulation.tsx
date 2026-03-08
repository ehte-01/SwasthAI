'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
  isHypertension?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

// ─── Cell data ───────────────────────────────────────────────────────────────
interface Cell {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  radius: number;
  type: 'rbc' | 'wbc' | 'plt';
  rotX: number; rotY: number; rotZ: number;
  spinX: number; spinY: number;
  opacity: number;
}

// ─── Simple 3D projection ────────────────────────────────────────────────────
const project = (x: number, y: number, z: number, fov: number, cx: number, cy: number) => {
  const scale = fov / (fov + z);
  return { sx: cx + x * scale, sy: cy + y * scale, scale };
};

export default function BloodVesselSimulation({
  isHypertension = false,
  height = 520,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    paused: false,
    angle: 0,
    cells: [] as Cell[],
    time: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    angleY: 0.25,
    zoom: 1.0,   // zoom level
  });

  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hyp = isHypertension;

  // ─── Initialize cells ────────────────────────────────────────────────────────
  const initCells = useCallback((h: boolean): Cell[] => {
    const cells: Cell[] = [];
    const VR = h ? 55 : 90; // vessel radius in canvas units
    const rbcN = h ? 80 : 50;
    const wbcN = h ? 10 : 7;
    const pltN = h ? 25 : 15;
    const VL = 300; // vessel half-length

    const makeCell = (type: 'rbc' | 'wbc' | 'plt'): Cell => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * VR * 0.88;
      const spd = type === 'rbc' ? (h ? 90 : 40) : type === 'wbc' ? (h ? 55 : 22) : (h ? 110 : 50);
      return {
        x: (Math.random() - 0.5) * VL * 2,
        y: Math.cos(a) * r,
        z: Math.sin(a) * r,
        vx: spd + Math.random() * (h ? 50 : 15),
        vy: (Math.random() - 0.5) * (h ? 12 : 2),
        vz: (Math.random() - 0.5) * (h ? 12 : 2),
        radius: type === 'rbc' ? 8 : type === 'wbc' ? 13 : 4,
        type,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        spinX: (Math.random() - 0.5) * (h ? 3 : 1.5),
        spinY: (Math.random() - 0.5) * (h ? 3 : 1.5),
        opacity: 0.75 + Math.random() * 0.25,
      };
    };

    for (let i = 0; i < rbcN; i++) cells.push(makeCell('rbc'));
    for (let i = 0; i < wbcN; i++) cells.push(makeCell('wbc'));
    for (let i = 0; i < pltN; i++) cells.push(makeCell('plt'));
    return cells;
  }, []);

  // ─── Main render loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;
    s.cells = initCells(hyp);

    let lastTime = performance.now();

    const setSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    setSize();

    const ro = new ResizeObserver(() => { /* canvas syncs in draw loop */ });
    ro.observe(container);

    // ── Mouse / touch drag to rotate ──────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => { s.isDragging = true; s.lastMouseX = e.clientX; s.lastMouseY = e.clientY; };
    const onMouseMove = (e: MouseEvent) => {
      if (!s.isDragging) return;
      s.angle += (e.clientX - s.lastMouseX) * 0.005;
      s.angleY += (e.clientY - s.lastMouseY) * 0.003;
      s.angleY = Math.max(-0.6, Math.min(0.6, s.angleY));
      s.lastMouseX = e.clientX; s.lastMouseY = e.clientY;
    };
    const onMouseUp = () => { s.isDragging = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.zoom = Math.max(0.4, Math.min(2.5, s.zoom - e.deltaY * 0.001));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // ── Draw frame ────────────────────────────────────────────────────────────
    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Always sync canvas size to its actual rendered size (handles fullscreen)
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      }

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const FOV = 400 * s.zoom;
      const VR = (hyp ? 55 : 90) * s.zoom;
      const VL = 300;

      // Auto-rotate when not dragging
      if (!s.isDragging) s.angle += 0.004;

      // ── Background ──
      ctx.fillStyle = '#04080f';
      ctx.fillRect(0, 0, W, H);

      // ── Background stars ──
      ctx.fillStyle = 'rgba(34,51,85,0.6)';
      for (let i = 0; i < 80; i++) {
        const bx = ((i * 137.5 * 3.7) % W);
        const by = ((i * 97.3 * 2.1) % H);
        ctx.beginPath();
        ctx.arc(bx, by, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!s.paused) {
        s.time += dt;
        // Update cells
        s.cells.forEach((c) => {
          c.x += c.vx * dt;
          if (hyp) {
            c.y += (Math.random() - 0.5) * 30 * dt;
            c.z += (Math.random() - 0.5) * 30 * dt;
          } else {
            c.y += Math.sin(s.time * 1.4 + c.x * 0.003) * 0.8;
            c.z += Math.cos(s.time * 1.4 + c.x * 0.003) * 0.8;
          }
          // wrap
          if (c.x > VL) {
            c.x = -VL;
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * VR * 0.86;
            c.y = Math.cos(a) * r; c.z = Math.sin(a) * r;
          }
          // clamp
          const cr = Math.sqrt(c.y ** 2 + c.z ** 2);
          if (cr > VR * 0.92) { const f = (VR * 0.92) / cr; c.y *= f; c.z *= f; if (hyp) { c.vy *= -0.4; c.vz *= -0.4; } }
          c.rotX += c.spinX * dt;
          c.rotY += c.spinY * dt;
        });
      }

      // ── 3D camera transform ──
      const cosA = Math.cos(s.angle);
      const sinA = Math.sin(s.angle);
      const cosY = Math.cos(s.angleY);
      const sinY = Math.sin(s.angleY);

      const transform3D = (wx: number, wy: number, wz: number) => {
        // orbit around Y axis
        const rx = wx * cosA - wz * sinA;
        const rz = wx * sinA + wz * cosA;
        // tilt on X axis
        const ry2 = wy * cosY - rz * sinY;
        const rz2 = wy * sinY + rz * cosY;
        return { x: rx, y: ry2, z: rz2 };
      };

      // ── Draw vessel tube (ellipse rings) ──
      const rings = 14;
      const pulseT = s.time;
      const pulseFreq = hyp ? 1.7 : 1.0;
      const pulseAmp = hyp ? 0.06 : 0.02;
      const pulse = 1 + Math.sin(pulseT * pulseFreq * Math.PI * 2) * pulseAmp;

      // Outer glow rings
      for (let ri = 0; ri <= rings; ri++) {
        const wx = -VL + (ri / rings) * VL * 2;
        const p = transform3D(wx, 0, 0);
        const proj = project(p.x, p.y, p.z + 250, FOV, cx, cy);

        const rScaled = VR * pulse * proj.scale;
        const color = hyp
          ? `rgba(220,20,40,${0.08 + 0.04 * Math.sin(s.time * 2 + ri)})`
          : `rgba(20,100,220,${0.07 + 0.03 * Math.sin(s.time * 1.5 + ri)})`;

        ctx.beginPath();
        ctx.ellipse(proj.sx, proj.sy, rScaled * 0.3, rScaled, 0, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner glowing ring
        const innerR = VR * 0.88 * pulse * proj.scale;
        const innerColor = hyp
          ? `rgba(255,30,60,${0.16 + 0.08 * Math.sin(s.time * 2 + ri * 0.5)})`
          : `rgba(40,140,255,${0.14 + 0.06 * Math.sin(s.time * 1.5 + ri * 0.5)})`;
        ctx.beginPath();
        ctx.ellipse(proj.sx, proj.sy, innerR * 0.28, innerR, 0, 0, Math.PI * 2);
        ctx.strokeStyle = innerColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Draw cells (sorted by depth) ──
      const projected = s.cells.map((c) => {
        const p = transform3D(c.x, c.y, c.z);
        const proj = project(p.x, p.y, p.z + 250, FOV, cx, cy);
        return { c, proj, depth: p.z };
      });
      projected.sort((a, b) => a.depth - b.depth);

      projected.forEach(({ c, proj }) => {
        if (proj.scale <= 0) return;
        const r = c.radius * proj.scale;
        if (r < 0.5) return;

        ctx.save();
        ctx.translate(proj.sx, proj.sy);

        if (c.type === 'rbc') {
          // RBC — red disc
          ctx.scale(1, 0.42);
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
          grad.addColorStop(0, `rgba(220,60,60,${c.opacity})`);
          grad.addColorStop(0.6, `rgba(180,30,30,${c.opacity})`);
          grad.addColorStop(1, `rgba(100,10,10,${c.opacity * 0.6})`);
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          // Rim highlight
          ctx.strokeStyle = `rgba(255,100,100,${c.opacity * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else if (c.type === 'wbc') {
          // WBC — bluish white sphere
          const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
          grad.addColorStop(0, `rgba(220,235,255,${c.opacity})`);
          grad.addColorStop(0.5, `rgba(160,190,240,${c.opacity * 0.9})`);
          grad.addColorStop(1, `rgba(80,110,180,${c.opacity * 0.5})`);
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = `rgba(180,210,255,${c.opacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Platelet — golden small
          const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
          grad.addColorStop(0, `rgba(255,210,80,${c.opacity})`);
          grad.addColorStop(1, `rgba(180,120,20,${c.opacity * 0.6})`);
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Specular highlight on all cells
        const hl = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 0, 0, 0, r * 0.6);
        hl.addColorStop(0, `rgba(255,255,255,${c.opacity * 0.35})`);
        hl.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.2, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = hl;
        ctx.fill();

        ctx.restore();
      });

      // ── Plasma glow particles ──
      const plasmaCount = hyp ? 180 : 100;
      for (let i = 0; i < plasmaCount; i++) {
        const seed = i * 137.508;
        const px = (((seed * 3.7) % (VL * 2)) - VL + s.time * (hyp ? 95 : 45)) % (VL * 2) - VL;
        const pa = (seed * 2.4) % (Math.PI * 2);
        const pr = (seed % (VR * 0.9 * 10)) / 10;
        const py = Math.cos(pa) * pr;
        const pz = Math.sin(pa) * pr;
        const pp = transform3D(px, py, pz);
        const proj = project(pp.x, pp.y, pp.z + 250, FOV, cx, cy);
        if (proj.scale <= 0) continue;
        const ps = Math.max(0.5, 1.8 * proj.scale);
        const alpha = 0.3 + 0.2 * Math.sin(s.time * 3 + i);
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, ps, 0, Math.PI * 2);
        ctx.fillStyle = hyp ? `rgba(255,80,100,${alpha})` : `rgba(80,150,255,${alpha})`;
        ctx.fill();
      }

      // ── Vessel end glow ──
      [-VL, VL].forEach((wx) => {
        const ep = transform3D(wx, 0, 0);
        const proj = project(ep.x, ep.y, ep.z + 250, FOV, cx, cy);
        const rg = ctx.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, VR * pulse * proj.scale * 1.2);
        rg.addColorStop(0, hyp ? 'rgba(255,30,60,0.12)' : 'rgba(30,100,255,0.1)');
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.ellipse(proj.sx, proj.sy, VR * 0.35 * proj.scale, VR * proj.scale * 1.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();
      });

      // ── Vignette ──
      const vg = ctx.createRadialGradient(cx, cy, H * 0.32, cx, cy, H * 0.85);
      vg.addColorStop(0, 'rgba(4,8,15,0)');
      vg.addColorStop(1, 'rgba(4,8,15,0.72)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    rafRef.current = requestAnimationFrame(draw);

    // Fullscreen
    const onFS = () => { setIsFullscreen(!!document.fullscreenElement); };
    document.addEventListener('fullscreenchange', onFS);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      document.removeEventListener('fullscreenchange', onFS);
    };
  }, [isHypertension]);

  const togglePause = () => {
    stateRef.current.paused = !stateRef.current.paused;
    setPaused(stateRef.current.paused);
  };

  const toggleFS = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch (e) { /* ignore */ }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden select-none ${className}`}
      style={{ height, background: '#04080f' }}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        {/* Status badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: hyp ? 'rgba(180,10,30,0.25)' : 'rgba(10,80,200,0.25)',
            border: `1px solid ${hyp ? 'rgba(255,50,70,0.6)' : 'rgba(50,130,255,0.6)'}`,
            color: hyp ? '#ff4466' : '#44aaff',
            backdropFilter: 'blur(12px)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: hyp ? '#ff3355' : '#3399ff',
              boxShadow: hyp ? '0 0 7px #ff3355' : '0 0 7px #3399ff',
              animation: 'pulse 1.5s infinite',
            }}
          />
          {hyp ? 'HYPERTENSIVE' : 'NORMAL FLOW'}
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          {[
            { l: 'CELLS', v: stateRef.current.cells.length || (hyp ? 115 : 72) },
            { l: 'MODE', v: hyp ? 'HIGH BP' : 'NORMAL' },
          ].map((s) => (
            <div
              key={s.l}
              className="px-3 py-1 rounded-lg text-center"
              style={{
                background: 'rgba(4,8,15,0.82)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(10px)',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', letterSpacing: '0.12em' }}>{s.l}</div>
              <div className="font-bold text-sm" style={{ color: hyp ? '#ff6680' : '#55aaff' }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
        {/* Legend */}
        <div
          className="flex gap-4 px-4 py-2 rounded-xl text-xs pointer-events-none"
          style={{
            background: 'rgba(4,8,15,0.82)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.05em',
          }}
        >
          {[
            { c: '#dc3c3c', l: 'Red Blood Cell' },
            { c: '#99bbee', l: 'White Blood Cell' },
            { c: '#ddaa44', l: 'Platelet' },
          ].map((x) => (
            <div key={x.l} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: x.c, boxShadow: `0 0 5px ${x.c}66` }} />
              {x.l}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-2 rounded-xl text-xs pointer-events-none hidden sm:block"
            style={{
              background: 'rgba(4,8,15,0.82)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.38)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            DRAG · Rotate
          </div>

          {/* Play/Pause */}
          <button
            onClick={togglePause}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(4,8,15,0.82)',
              border: `1px solid ${hyp ? 'rgba(255,70,90,0.45)' : 'rgba(70,150,255,0.45)'}`,
              backdropFilter: 'blur(12px)',
              color: hyp ? '#ff6680' : '#66aaff',
            }}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5l11 7-11 7V5z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFS}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(4,8,15,0.82)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.6)',
            }}
            title="Fullscreen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}