import React from 'react';
import { GasType, ThermoMetrics } from '../types/physics';
import { GAS_DATA } from '../physics/thermoEngine';
import { Activity, Flame, RotateCw, Move } from 'lucide-react';

interface ThermodynamicChartsProps {
  temperatureK: number;
  pressureAtm: number;
  volumeL: number;
  gasType: GasType;
  metrics: ThermoMetrics;
  initialTempK: number;
  initialPressureAtm: number;
}

export const ThermodynamicCharts: React.FC<ThermodynamicChartsProps> = ({
  temperatureK,
  pressureAtm,
  volumeL,
  gasType,
  metrics,
  initialTempK,
  initialPressureAtm
}) => {
  const gasProps = GAS_DATA[gasType];

  // SVG Chart sizes
  const chartW = 260;
  const chartH = 170;
  const pad = 35;

  // --- 1. P-V Diagram Coordinates ---
  // Constant Volume vertical line
  const vMin = 0;
  const vMax = volumeL * 2;
  const pMin = 0;
  const pMax = Math.max(pressureAtm * 1.4, initialPressureAtm * 1.4, 2.0);

  const xVol = pad + ((volumeL - vMin) / (vMax - vMin)) * (chartW - pad * 2);
  const yPresInit = chartH - pad - ((initialPressureAtm - pMin) / (pMax - pMin)) * (chartH - pad * 2);
  const yPresCurr = chartH - pad - ((pressureAtm - pMin) / (pMax - pMin)) * (chartH - pad * 2);

  // --- 2. P-T Diagram Coordinates ---
  // Gay-Lussac line P ∝ T
  const tMin = 200;
  const tMax = Math.max(temperatureK * 1.3, initialTempK * 1.3, 500);

  const xTempInit = pad + ((initialTempK - tMin) / (tMax - tMin)) * (chartW - pad * 2);
  const xTempCurr = pad + ((temperatureK - tMin) / (tMax - tMin)) * (chartW - pad * 2);

  return (
    <div className="flex flex-col gap-4">
      {/* Grid of 2 Charts: P-V and P-T */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* P-V Diagram */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Diagrama P - V (Volume Constante)
            </h4>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
              W = ∫ P dV = 0 J
            </span>
          </div>

          <div className="relative flex justify-center bg-slate-950/80 rounded-xl p-2 border border-slate-800">
            <svg width={chartW} height={chartH} className="overflow-visible">
              {/* Grid lines */}
              <line x1={pad} y1={chartH - pad} x2={chartW - pad / 2} y2={chartH - pad} stroke="#334155" strokeWidth="1" />
              <line x1={pad} y1={pad / 2} x2={pad} y2={chartH - pad} stroke="#334155" strokeWidth="1" />

              {/* Axis Labels */}
              <text x={chartW - pad / 2} y={chartH - pad + 15} fill="#94a3b8" fontSize="9" textAnchor="end">V (L)</text>
              <text x={pad - 5} y={pad / 2 - 5} fill="#94a3b8" fontSize="9" textAnchor="middle">P (atm)</text>

              {/* Isochoric Vertical Path */}
              <line
                x1={xVol}
                y1={yPresInit}
                x2={xVol}
                y2={yPresCurr}
                stroke="#06b6d4"
                strokeWidth="3"
                strokeDasharray="4 2"
              />

              {/* Arrow on vertical path indicating heating */}
              <line
                x1={xVol}
                y1={yPresInit}
                x2={xVol}
                y2={yPresCurr}
                stroke="#38bdf8"
                strokeWidth="3.5"
              />

              {/* Initial Point */}
              <circle cx={xVol} cy={yPresInit} r="4" fill="#64748b" />
              <text x={xVol + 8} y={yPresInit + 3} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                P₁ ({initialPressureAtm.toFixed(1)})
              </text>

              {/* Current Point */}
              <circle cx={xVol} cy={yPresCurr} r="5" fill="#38bdf8" className="animate-ping opacity-75" />
              <circle cx={xVol} cy={yPresCurr} r="5" fill="#38bdf8" />
              <text x={xVol + 8} y={yPresCurr + 3} fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                P₂ ({pressureAtm.toFixed(1)})
              </text>

              {/* Zero Area Label */}
              <text x={chartW / 2 + 10} y={chartH / 2} fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle" opacity="0.8">
                Área sob a curva = 0 (Sem Trabalho)
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-tight">
            Como a linha é estritamente vertical, a variação de volume ΔV = 0. Sem deslocamento de fronteira, <strong>W = 0</strong>.
          </p>
        </div>

        {/* P-T Diagram */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              Diagrama P - T (Lei de Gay-Lussac)
            </h4>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
              P ∝ T
            </span>
          </div>

          <div className="relative flex justify-center bg-slate-950/80 rounded-xl p-2 border border-slate-800">
            <svg width={chartW} height={chartH} className="overflow-visible">
              {/* Axes */}
              <line x1={pad} y1={chartH - pad} x2={chartW - pad / 2} y2={chartH - pad} stroke="#334155" strokeWidth="1" />
              <line x1={pad} y1={pad / 2} x2={pad} y2={chartH - pad} stroke="#334155" strokeWidth="1" />

              {/* Axis Labels */}
              <text x={chartW - pad / 2} y={chartH - pad + 15} fill="#94a3b8" fontSize="9" textAnchor="end">T (K)</text>
              <text x={pad - 5} y={pad / 2 - 5} fill="#94a3b8" fontSize="9" textAnchor="middle">P (atm)</text>

              {/* Linear Relationship P = (nR/V) * T */}
              <line
                x1={pad}
                y1={chartH - pad}
                x2={xTempCurr}
                y2={yPresCurr}
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Initial Point */}
              <circle cx={xTempInit} cy={yPresInit} r="4" fill="#64748b" />

              {/* Current Point */}
              <circle cx={xTempCurr} cy={yPresCurr} r="5" fill="#f59e0b" />
              <text x={xTempCurr - 10} y={yPresCurr - 8} fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ({temperatureK.toFixed(0)} K, {pressureAtm.toFixed(1)} atm)
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-tight">
            A pressão cresce linearmente com a temperatura absoluta. A inclinação da reta é constante (n · R) / V.
          </p>
        </div>
      </div>

      {/* Energy Distribution Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Distribuição Microscópica de Energia Interna (ΔU)
            </h4>
            <p className="text-xs text-slate-400">
              Gás Atual: <strong className="text-slate-200">{gasProps.name}</strong> (Cv = {gasProps.CvMolarRatio})
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Energia Interna Total</div>
            <div className="text-sm font-bold font-mono text-cyan-400">
              {metrics.internalEnergyJ.toFixed(0)} J
            </div>
          </div>
        </div>

        {/* Progress bar split */}
        <div className="space-y-3">
          {/* Translational Energy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <Move className="w-3.5 h-3.5" />
                Energia de Transladação (Eixos X, Y, Z) - Aumenta a Pressão!
              </span>
              <span className="font-mono text-sky-300">
                {metrics.translationalEnergyJ.toFixed(0)} J (
                {gasType === 'monoatomic' ? '100%' : '60%'})
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${gasType === 'monoatomic' ? 100 : 60}%` }}
              />
            </div>
          </div>

          {/* Rotational Energy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-purple-400 font-medium">
                <RotateCw className="w-3.5 h-3.5" />
                Energia de Rotação (Apenas Moléculas Diatômicas)
              </span>
              <span className="font-mono text-purple-300">
                {metrics.rotationalEnergyJ.toFixed(0)} J (
                {gasType === 'monoatomic' ? '0%' : '40%'})
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${gasType === 'monoatomic' ? 0 : 40}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Didactic Tip */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
          <span className="text-amber-400 font-bold text-base leading-none">💡</span>
          <span>
            {gasType === 'monoatomic' ? (
              <>
                No <strong>Hélio (Cv = 3/2 R)</strong>, 100% do calor fornecido acelera o movimento direto das partículas, elevando a pressão mais rapidamente por Joule absorvido.
              </>
            ) : (
              <>
                No <strong>Ar (Cv = 5/2 R)</strong>, 40% da energia é "gasta" apenas fazendo os halteres girarem no espaço. Por isso, <strong>o ar exige mais calor</strong> para alcançar o mesmo aumento de temperatura e pressão!
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
