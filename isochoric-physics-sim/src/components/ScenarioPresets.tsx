import React from 'react';
import { ScenarioPresetId } from '../types/physics';
import { PRESETS } from '../physics/thermoEngine';
import { Sparkles, Utensils, Sun, Car, TestTube } from 'lucide-react';

interface ScenarioPresetsProps {
  currentScenario: ScenarioPresetId;
  onSelectScenario: (id: ScenarioPresetId) => void;
}

export const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({
  currentScenario,
  onSelectScenario
}) => {
  const getIcon = (iconStr: string) => {
    switch (iconStr) {
      case '🍲':
        return <Utensils className="w-4 h-4 text-orange-400" />;
      case '☀️':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case '🚗':
        return <Car className="w-4 h-4 text-red-400" />;
      default:
        return <TestTube className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Conexão com o Cotidiano & Aplicações
          </h3>
          <p className="text-xs text-slate-400">
            Selecione um cenário didático para carregar os parâmetros ideais
          </p>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESETS.map((preset) => {
          const isSelected = currentScenario === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectScenario(preset.id)}
              className={`text-left p-3 rounded-xl transition-all duration-200 border relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                  : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">{preset.icon}</span>
                  <div className="p-1 rounded-md bg-slate-800 border border-slate-700">
                    {getIcon(preset.icon)}
                  </div>
                </div>

                <div className="font-semibold text-xs text-slate-100 mb-0.5">
                  {preset.title}
                </div>
                <div className="text-[10px] text-slate-400 mb-2 font-medium">
                  {preset.subtitle}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {/* Bottom tag */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-mono">T: {(preset.initialTempK - 273.15).toFixed(0)}°C → {(preset.targetTempK - 273.15).toFixed(0)}°C</span>
                <span className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                  {isSelected ? 'Ativo ✓' : 'Carregar'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
