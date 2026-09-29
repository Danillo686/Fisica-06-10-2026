import React from 'react';
import { SimulationState } from '../types/physics';
import { GAS_DATA } from '../physics/thermoEngine';
import { Flame, Thermometer, Wind, RefreshCw, Play, Square, Zap, Snowflake, Sliders, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../utils/audioFx';

interface ControlPanelProps {
  state: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onAddHeat: (heatJ: number) => void;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  heatingRate: number;
  onSetHeatingRate: (rate: number) => void;
  minTempK?: number;
  maxTempK?: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onUpdateState,
  onAddHeat,
  onReset,
  isMuted,
  onToggleMute,
  heatingRate,
  onSetHeatingRate,
  minTempK = 200,
  maxTempK = 1000
}) => {
  const currentGas = GAS_DATA[state.gasType];

  const handleAddHeatWithSound = (amountJ: number) => {
    if (amountJ > 0) {
      soundFx.playHeatSound();
    } else {
      soundFx.playCoolSound();
    }
    onAddHeat(amountJ);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-4">
      {/* Header with Reset & Mute Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Painel de Controle do Experimento
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isMuted
                ? 'bg-slate-800 text-slate-500 border-slate-700'
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Desativar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700"
            title="Resetar parâmetros para o valor inicial"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Resetar
          </button>
        </div>
      </div>

      {/* 1. Gas Selection Toggle */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            Tipo de Gás Confinado
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Cv = {currentGas.CvMolarRatio}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => onUpdateState({ gasType: 'monoatomic' })}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
              state.gasType === 'monoatomic'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎈 Hélio (Monoatômico)</span>
            <span className="text-[9px] font-normal opacity-80">Cv = 3/2 R</span>
          </button>

          <button
            onClick={() => onUpdateState({ gasType: 'diatomic' })}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
              state.gasType === 'diatomic'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💨 Ar Atmosférico (Diatômico)</span>
            <span className="text-[9px] font-normal opacity-80">Cv = 5/2 R</span>
          </button>
        </div>
      </div>

      {/* 2. Temperature Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            Ajustar Temperatura (T)
          </span>
          <span className="font-mono text-amber-400 font-bold">
            {state.temperatureK.toFixed(0)} K ({(state.temperatureK - 273.15).toFixed(0)} °C)
          </span>
        </div>
        <input
          type="range"
          min={minTempK}
          max={maxTempK}
          step={5}
          value={state.temperatureK}
          onChange={(e) => onUpdateState({ temperatureK: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{minTempK} K ({(minTempK - 273.15).toFixed(0)}°C)</span>
          <span>{maxTempK} K ({(maxTempK - 273.15).toFixed(0)}°C)</span>
        </div>
      </div>

      {/* 3. Heat Injection & Cooling Buttons */}
      <div className="space-y-2 pt-1">
        <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            Transferência de Calor (+Q / -Q)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Q Total = {state.heatInputJ.toFixed(0)} J
          </span>
        </label>

        {/* Heat Addition Row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAddHeatWithSound(500)}
            className="py-2 bg-slate-800 hover:bg-red-950/60 hover:border-red-500/50 border border-slate-700 text-red-300 rounded-xl text-xs font-mono font-medium transition"
          >
            +500 J
          </button>
          <button
            onClick={() => handleAddHeatWithSound(2000)}
            className="py-2 bg-slate-800 hover:bg-red-950/60 hover:border-red-500/50 border border-slate-700 text-red-300 rounded-xl text-xs font-mono font-medium transition"
          >
            +2.000 J
          </button>
          <button
            onClick={() => handleAddHeatWithSound(5000)}
            className="py-2 bg-slate-800 hover:bg-red-950/60 hover:border-red-500/50 border border-slate-700 text-red-300 rounded-xl text-xs font-mono font-bold transition"
          >
            +5.000 J
          </button>
        </div>

        {/* Cooling Removal Row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAddHeatWithSound(-500)}
            className="py-2 bg-slate-800 hover:bg-cyan-950/60 hover:border-cyan-500/50 border border-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-1"
          >
            <Snowflake className="w-3 h-3 text-cyan-400" />
            -500 J
          </button>
          <button
            onClick={() => handleAddHeatWithSound(-2000)}
            className="py-2 bg-slate-800 hover:bg-cyan-950/60 hover:border-cyan-500/50 border border-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-1"
          >
            <Snowflake className="w-3 h-3 text-cyan-400" />
            -2.000 J
          </button>
          <button
            onClick={() => handleAddHeatWithSound(-5000)}
            className="py-2 bg-slate-800 hover:bg-cyan-950/60 hover:border-cyan-500/50 border border-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1"
          >
            <Snowflake className="w-3 h-3 text-cyan-400" />
            -5.000 J
          </button>
        </div>
      </div>

      {/* 4. Heating Rate Selector & Continuous Flame Switcher */}
      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            Potência do Queimador (J/s)
          </span>
          <div className="flex gap-1">
            {[
              { label: 'Branda', rate: 100 },
              { label: 'Média', rate: 300 },
              { label: 'Turbo', rate: 800 }
            ].map((item) => (
              <button
                key={item.rate}
                onClick={() => onSetHeatingRate(item.rate)}
                className={`px-2 py-0.5 text-[10px] rounded-md transition ${
                  heatingRate === item.rate
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            const nextHeating = !state.isHeating;
            if (nextHeating) soundFx.playHeatSound();
            onUpdateState({ isHeating: nextHeating });
          }}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            state.isHeating
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-lg shadow-red-600/30 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          {state.isHeating ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              Desligar Chama do Queimador
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Ligar Aquecimento Contínuo por Chama (Q &gt; 0)
            </>
          )}
        </button>
      </div>

      {/* 5. Custom Scenario Volume & Moles Controls (If Scenario == Custom) */}
      {state.currentScenario === 'custom' && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            Parâmetros do Recipiente (Modo Laboratório)
          </div>

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Volume Fixo (V)</span>
              <span className="font-mono text-cyan-400 font-bold">{state.volumeL.toFixed(1)} L</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={0.5}
              value={state.volumeL}
              onChange={(e) => onUpdateState({ volumeL: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Moles Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Quantidade de Gás (n)</span>
              <span className="font-mono text-purple-400 font-bold">{state.moles.toFixed(3)} mol</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={5.0}
              step={0.05}
              value={state.moles}
              onChange={(e) => onUpdateState({ moles: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
