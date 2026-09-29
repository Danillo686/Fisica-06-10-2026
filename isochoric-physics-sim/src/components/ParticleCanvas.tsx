import React, { useEffect, useRef, useState } from 'react';
import { GasType, ThermoMetrics } from '../types/physics';
import { AlertTriangle, Lock, Wind, Zap, Info } from 'lucide-react';
import { soundFx } from '../utils/audioFx';

interface ParticleCanvasProps {
  temperatureK: number;
  pressureAtm: number;
  gasType: GasType;
  isHeating: boolean;
  metrics: ThermoMetrics;
  dangerThresholdAtm: number;
  onVentGas?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  radius: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  temperatureK,
  pressureAtm,
  gasType,
  isHeating,
  metrics,
  dangerThresholdAtm,
  onVentGas
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const steamRef = useRef<SteamParticle[]>([]);
  
  const [hoveredParticle, setHoveredParticle] = useState<{
    id: number;
    speedMetersSec: number;
    energyJ: number;
    x: number;
    y: number;
  } | null>(null);

  const [isVenting, setIsVenting] = useState(false);
  const isDanger = pressureAtm > dangerThresholdAtm;

  // Initialize or adjust particles based on gasType
  useEffect(() => {
    const numParticles = gasType === 'monoatomic' ? 36 : 28;
    const newParticles: Particle[] = [];

    const width = 360;
    const height = 280;

    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: i + 1,
        x: 40 + Math.random() * (width - 80),
        y: 40 + Math.random() * (height - 80),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.1,
        radius: gasType === 'monoatomic' ? 7 : 6,
        color: gasType === 'monoatomic' ? '#38bdf8' : '#a855f7'
      });
    }

    particlesRef.current = newParticles;
  }, [gasType]);

  // Handle Canvas Click -> Spawn Shockwave Pulse
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked near Safety Valve at Top Center (x: 180, y: 15..35)
    if (clickX >= 150 && clickX <= 210 && clickY >= 5 && clickY <= 38) {
      handleOpenValve();
      return;
    }

    // Spawn thermal shockwave in container
    shockwavesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 5,
      maxRadius: 60,
      alpha: 1.0
    });

    soundFx.playPopSound();

    // Impel particles away from click point
    particlesRef.current.forEach((p) => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.hypot(dx, dy);
      if (dist < 70 && dist > 0.1) {
        const force = (70 - dist) / 70;
        p.vx += (dx / dist) * force * 3;
        p.vy += (dy / dist) * force * 3;
      }
    });
  };

  // Handle Canvas Mouse Move -> Inspect Particle under cursor
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found: Particle | null = null;
    for (const p of particlesRef.current) {
      const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
      if (dist <= p.radius * 2) {
        found = p;
        break;
      }
    }

    if (found) {
      // Calculate realistic root-mean-square speed proportional to sqrt(T)
      // For Helium at 300K, v_rms ~ 1360 m/s
      const baseV = gasType === 'monoatomic' ? 1365 : 500;
      const speedRatio = Math.hypot(found.vx, found.vy);
      const simulatedSpeed = Math.round(baseV * Math.sqrt(temperatureK / 298.15) * (0.8 + speedRatio * 0.2));
      // Average kinetic energy = (3/2) * k_B * T
      const kB = 1.380649e-23;
      const approxEnergyJ = (3 / 2) * kB * temperatureK;

      setHoveredParticle({
        id: found.id,
        speedMetersSec: simulatedSpeed,
        energyJ: approxEnergyJ,
        x: found.x,
        y: found.y
      });
    } else {
      setHoveredParticle(null);
    }
  };

  // Open Safety Valve handler
  const handleOpenValve = () => {
    setIsVenting(true);
    soundFx.playVentSound();

    // Spawn steam escaping particles
    for (let i = 0; i < 15; i++) {
      steamRef.current.push({
        x: 180 + (Math.random() - 0.5) * 16,
        y: 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 3,
        alpha: 1.0,
        size: 4 + Math.random() * 6
      });
    }

    if (onVentGas) {
      onVentGas();
    }

    setTimeout(() => {
      setIsVenting(false);
    }, 600);
  };

  // Sound alert when entering high danger zone
  useEffect(() => {
    if (isDanger) {
      soundFx.playWarningSound();
    }
  }, [isDanger]);

  // Sound trigger when heating
  useEffect(() => {
    if (isHeating) {
      soundFx.playHeatSound();
    }
  }, [isHeating, temperatureK]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const baseSpeed = Math.sqrt(temperatureK / 298.15);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const margin = 24;

      // 1. Draw rigid container background & wall highlights
      ctx.save();

      // Glass background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
      bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
      ctx.fillStyle = bgGradient;
      ctx.roundRect(margin, margin + 10, w - margin * 2, h - margin * 2 - 10, 14);
      ctx.fill();

      // Thick Rigid Border
      ctx.lineWidth = 6;
      ctx.strokeStyle = isDanger ? '#ef4444' : '#3b82f6';
      ctx.stroke();

      // Draw rigid corner bolts
      const boltPos = [
        { x: margin + 12, y: margin + 22 },
        { x: w - margin - 12, y: margin + 22 },
        { x: margin + 12, y: h - margin - 12 },
        { x: w - margin - 12, y: h - margin - 12 }
      ];

      boltPos.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 2. Draw Interactive Safety Valve at Top (x: 180, y: 15)
      const valveX = w / 2;
      const valveY = margin + 10;

      // Valve pipe neck
      ctx.fillStyle = '#64748b';
      ctx.fillRect(valveX - 8, valveY - 14, 16, 14);

      // Valve cap/knob (red/brass cap)
      ctx.fillStyle = isVenting ? '#f59e0b' : isDanger ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.arc(valveX, valveY - 14, isVenting ? 11 : 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Valve lever handle line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(valveX - 12, valveY - 14);
      ctx.lineTo(valveX + 12, valveY - 14);
      ctx.stroke();

      // Valve label hint text
      ctx.fillStyle = isVenting ? '#f59e0b' : '#94a3b8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isVenting ? 'ABERTA!' : 'VÁLVULA DE SEGURANÇA', valveX, valveY - 22);

      // 3. Draw Heating Flame Effect at bottom
      if (isHeating) {
        ctx.save();
        const fireY = h - margin;
        const fireGradient = ctx.createLinearGradient(0, fireY - 30, 0, fireY + 10);
        fireGradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
        fireGradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
        fireGradient.addColorStop(1, 'rgba(234, 179, 8, 0)');

        ctx.fillStyle = fireGradient;
        ctx.beginPath();
        ctx.moveTo(margin, fireY);
        for (let x = margin; x <= w - margin; x += 15) {
          const flameH = Math.sin(Date.now() * 0.012 + x) * 12 + 18;
          ctx.lineTo(x, fireY - flameH);
        }
        ctx.lineTo(w - margin, fireY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 4. Update and Render Shockwaves (Interactive Click Waves)
      shockwavesRef.current.forEach((sw, idx) => {
        sw.radius += 2.5;
        sw.alpha -= 0.03;

        if (sw.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${sw.alpha})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        } else {
          shockwavesRef.current.splice(idx, 1);
        }
      });

      // 5. Update and Render Escaping Steam (Safety Vent)
      steamRef.current.forEach((st, idx) => {
        st.x += st.vx;
        st.y += st.vy;
        st.alpha -= 0.03;
        st.size += 0.3;

        if (st.alpha > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(226, 232, 240, ${st.alpha})`;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          steamRef.current.splice(idx, 1);
        }
      });

      // 6. Update and Draw Particles
      const particles = particlesRef.current;
      const minX = margin + 15;
      const maxX = w - margin - 15;
      const minY = margin + 25;
      const maxY = h - margin - 15;

      particles.forEach((p) => {
        // Move particle with speed scaled by sqrt(T)
        const currentSpeed = baseSpeed * 2.2;
        p.x += p.vx * currentSpeed;
        p.y += p.vy * currentSpeed;

        // Friction damping if speed burst occurred
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Ensure minimum motion
        if (Math.hypot(p.vx, p.vy) < 0.5) {
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle);
          p.vy = Math.sin(angle);
        }

        // Diatomic rotation
        if (gasType === 'diatomic') {
          p.angle += p.angularVelocity * currentSpeed * 1.5;
        }

        // Elastic collisions with rigid walls
        if (p.x < minX) {
          p.x = minX;
          p.vx = Math.abs(p.vx);
        } else if (p.x > maxX) {
          p.x = maxX;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y < minY) {
          p.y = minY;
          p.vy = Math.abs(p.vy);
        } else if (p.y > maxY) {
          p.y = maxY;
          p.vy = -Math.abs(p.vy);
        }

        // Render Particle
        ctx.save();
        ctx.translate(p.x, p.y);

        const isHovered = hoveredParticle?.id === p.id;

        if (isHovered) {
          // Target reticle highlight
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 2.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (gasType === 'monoatomic') {
          // Glowing Helium sphere
          const radGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, p.radius * 2);
          radGrad.addColorStop(0, '#7dd3fc');
          radGrad.addColorStop(0.5, '#0284c7');
          radGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 1.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Diatomic dumbbell (Air: N2/O2)
          ctx.rotate(p.angle);

          const bondLength = 14;
          // Connecting rod
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-bondLength / 2, 0);
          ctx.lineTo(bondLength / 2, 0);
          ctx.stroke();

          // Left Atom
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(-bondLength / 2, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Right Atom
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(bondLength / 2, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [temperatureK, pressureAtm, gasType, isHeating, dangerThresholdAtm, isVenting, hoveredParticle]);

  return (
    <div className="relative flex flex-col items-center bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
      {/* Header Badge */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              Cilindro Isocórico <span className="text-xs text-blue-400 font-mono">(V = const)</span>
            </h3>
            <p className="text-[11px] text-slate-400">Clique na área do gás para criar ondas térmicas!</p>
          </div>
        </div>

        {/* Safety Valve Quick Button */}
        <button
          onClick={handleOpenValve}
          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition shadow-sm"
          title="Abrir Válvula de Alívio de Pressão"
        >
          <Wind className="w-3.5 h-3.5" />
          Válvula Alívio
        </button>
      </div>

      {/* Canvas Box */}
      <div className="relative rounded-xl overflow-hidden shadow-inner border border-slate-700/60 cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={360}
          height={280}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredParticle(null)}
          className="block bg-slate-950"
        />

        {/* Pressure Display Overlay inside Canvas */}
        <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-right shadow-lg">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Pressão Interna</div>
          <div className={`text-xl font-bold font-mono ${isDanger ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
            {metrics.pressureAtm.toFixed(2)} <span className="text-xs font-normal text-slate-300">atm</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {metrics.pressureKPa.toFixed(1)} kPa
          </div>
        </div>

        {/* Temperature Overlay inside Canvas */}
        <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-left shadow-lg">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Temperatura (T)</div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {metrics.tempCelsius.toFixed(1)} <span className="text-xs font-normal text-slate-300">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {temperatureK.toFixed(1)} K
          </div>
        </div>

        {/* Particle Inspection Badge Hover Overlay */}
        {hoveredParticle && (
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-amber-500/50 rounded-xl p-2 text-xs text-amber-200 shadow-xl backdrop-blur-md flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <div>
              <div className="font-bold text-[11px]">Molécula #{hoveredParticle.id}</div>
              <div className="text-[10px] font-mono text-slate-300">
                v_rms ≈ {hoveredParticle.speedMetersSec} m/s | E_k ≈ {hoveredParticle.energyJ.toExponential(2)} J
              </div>
            </div>
          </div>
        )}

        {/* Interactive Click Tip Overlay */}
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-slate-900/70 px-2 py-1 rounded-md border border-slate-800 pointer-events-none flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-400" />
          Clique para onda de choque
        </div>
      </div>

      {/* Danger Warning Bar */}
      {isDanger && (
        <div className="w-full mt-3 p-2 rounded-xl bg-red-950/80 border border-red-500/60 text-xs text-red-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-semibold">ALERTA DE ALTA PRESSÃO (&gt; {dangerThresholdAtm.toFixed(1)} atm)!</span>
          </div>
          <button
            onClick={handleOpenValve}
            className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[10px]"
          >
            Aliviar Válvula
          </button>
        </div>
      )}

      {/* Physics Summary Cards */}
      <div className="w-full mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
          <div className="text-slate-400 text-[10px]">Trabalho (W)</div>
          <div className="font-mono font-bold text-emerald-400">0.00 J</div>
          <div className="text-[9px] text-slate-500">dV = 0</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
          <div className="text-slate-400 text-[10px]">Calor Absorvido (Q)</div>
          <div className="font-mono font-bold text-amber-400">+{metrics.heatAbsorbedJ.toFixed(0)} J</div>
          <div className="text-[9px] text-slate-500">Q = ΔU</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
          <div className="text-slate-400 text-[10px]">Energia Interna (ΔU)</div>
          <div className="font-mono font-bold text-cyan-400">+{metrics.deltaUJ.toFixed(0)} J</div>
          <div className="text-[9px] text-slate-500">100% de Q</div>
        </div>
      </div>
    </div>
  );
};
