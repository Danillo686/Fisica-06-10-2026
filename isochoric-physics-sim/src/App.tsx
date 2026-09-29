import React, { useState, useEffect, useCallback } from 'react';
import { ScenarioPresetId, SimulationState } from './types/physics';
import { PRESETS, calculateThermoMetrics, calculateTempFromHeat, GAS_DATA } from './physics/thermoEngine';
import { ParticleCanvas } from './components/ParticleCanvas';
import { ThermodynamicCharts } from './components/ThermodynamicCharts';
import { ControlPanel } from './components/ControlPanel';
import { ScenarioPresets } from './components/ScenarioPresets';
import { DidacticExplainer } from './components/DidacticExplainer';
import { InteractiveChallenges } from './components/InteractiveChallenges';
import { Atom, Flame, Layers, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from './utils/audioFx';

export const App: React.FC = () => {
  // Initial scenario: Panela de Pressão
  const initialPreset = PRESETS[0];

  const [state, setState] = useState<SimulationState>({
    temperatureK: initialPreset.initialTempK,
    volumeL: initialPreset.volumeL,
    moles: initialPreset.moles,
    gasType: initialPreset.gasType,
    heatInputJ: 0,
    currentScenario: initialPreset.id,
    isHeating: false
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [heatingRate, setHeatingRate] = useState<number>(300);

  const activePreset = PRESETS.find((p) => p.id === state.currentScenario) || PRESETS[0];

  // Calculate thermodynamic metrics
  const metrics = calculateThermoMetrics(state);

  // Update simulation state handler
  const handleUpdateState = (updates: Partial<SimulationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Add/remove heat Q in Joules
  const handleAddHeat = useCallback((addedHeatJ: number) => {
    setState((prev) => {
      const newHeatTotal = prev.heatInputJ + addedHeatJ;
      const newTempK = Math.max(
        100,
        calculateTempFromHeat(
          prev.temperatureK,
          addedHeatJ,
          prev.moles,
          prev.gasType
        )
      );
      return {
        ...prev,
        heatInputJ: newHeatTotal,
        temperatureK: newTempK
      };
    });
  }, []);

  // Vent gas handler (Válvula de segurança)
  const handleVentGas = useCallback(() => {
    setState((prev) => {
      // Reduce moles slightly or lower temperature to relieve pressure
      const newMoles = Math.max(0.02, prev.moles * 0.92);
      const newTempK = Math.max(250, prev.temperatureK * 0.95);
      return {
        ...prev,
        moles: newMoles,
        temperatureK: newTempK
      };
    });
  }, []);

  // Select Scenario Preset
  const handleSelectScenario = (id: ScenarioPresetId) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;

    setState({
      temperatureK: preset.initialTempK,
      volumeL: preset.volumeL,
      moles: preset.moles,
      gasType: preset.gasType,
      heatInputJ: 0,
      currentScenario: id,
      isHeating: false
    });
  };

  // Reset to current preset initial state
  const handleReset = () => {
    setState({
      temperatureK: activePreset.initialTempK,
      volumeL: activePreset.volumeL,
      moles: activePreset.moles,
      gasType: activePreset.gasType,
      heatInputJ: 0,
      currentScenario: activePreset.id,
      isHeating: false
    });
  };

  // Continuous heating effect loop when isHeating is true
  useEffect(() => {
    if (!state.isHeating) return;

    const interval = setInterval(() => {
      handleAddHeat(heatingRate / 10);
    }, 100);

    return () => clearInterval(interval);
  }, [state.isHeating, heatingRate, handleAddHeat]);

  return (
    <div className="min-h-screen text-slate-100 p-3 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Header Banner */}
      <header className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg">
              <Atom className="w-7 h-7 animate-spin-slow" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Simulador Interativo de Processo Isocórico
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Confinamento Volumétrico Rígido (V = const, W = 0 J) & Calores Específicos Molares (Cv)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Badges & Mute Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 font-mono text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
            V = {state.volumeL.toFixed(1)} L (Constante)
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 font-mono text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            W = 0.00 J
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 font-mono text-purple-400">
            <Flame className="w-3.5 h-3.5" />
            {GAS_DATA[state.gasType].name}
          </div>
          <button
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition text-xs font-semibold ${
              isMuted
                ? 'bg-slate-800 text-slate-500 border-slate-700'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? 'Mudo' : 'Áudio Ativo'}
          </button>
        </div>
      </header>

      {/* 2. Main Interactive Physics Grid Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Particle Canvas & Control Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <ParticleCanvas
            temperatureK={state.temperatureK}
            pressureAtm={metrics.pressureAtm}
            gasType={state.gasType}
            isHeating={state.isHeating}
            metrics={metrics}
            dangerThresholdAtm={activePreset.dangerThresholdAtm}
            onVentGas={handleVentGas}
          />

          <ControlPanel
            state={state}
            onUpdateState={handleUpdateState}
            onAddHeat={handleAddHeat}
            onReset={handleReset}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            heatingRate={heatingRate}
            onSetHeatingRate={setHeatingRate}
          />
        </div>

        {/* Right Column: Thermodynamic Charts & Energy Breakdown (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <ThermodynamicCharts
            temperatureK={state.temperatureK}
            pressureAtm={metrics.pressureAtm}
            volumeL={state.volumeL}
            gasType={state.gasType}
            metrics={metrics}
            initialTempK={activePreset.initialTempK}
            initialPressureAtm={activePreset.initialPressureAtm}
          />

          {/* Gamified Interactive Challenges Widget */}
          <InteractiveChallenges
            state={state}
            metrics={metrics}
            onAddHeat={handleAddHeat}
            onUpdateState={handleUpdateState}
            onReset={handleReset}
          />
        </div>
      </main>

      {/* 3. Everyday Scenarios (Presets) */}
      <ScenarioPresets
        currentScenario={state.currentScenario}
        onSelectScenario={handleSelectScenario}
      />

      {/* 4. Didactic Explainer Section (Resolving Seminar Questions) */}
      <DidacticExplainer currentGas={state.gasType} />

      {/* 5. Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-800/60">
        Simulador Didático Interativo de Física Termodinâmica • React, TypeScript & Web Audio API • Processo Isocórico (V = const, W = 0)
      </footer>
    </div>
  );
};

export default App;
