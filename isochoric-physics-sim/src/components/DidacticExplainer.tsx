import React, { useState } from 'react';
import { GasType } from '../types/physics';
import { GAS_DATA } from '../physics/thermoEngine';
import { BookOpen, Scale, Zap, ShieldCheck } from 'lucide-react';

interface DidacticExplainerProps {
  currentGas: GasType;
}

export const DidacticExplainer: React.FC<DidacticExplainerProps> = ({ currentGas: _currentGas }) => {
  const [activeTab, setActiveTab] = useState<'work' | 'heat_capacity' | 'first_law'>('work');

  const helium = GAS_DATA['monoatomic'];
  const air = GAS_DATA['diatomic'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Desafios Didáticos da Aula / Seminário
          </h3>
          <p className="text-xs text-slate-400">
            Explicações conceituais e demonstrações matemáticas dos pilares do seminário
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('work')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'work'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Por que W = 0?
          </button>
          <button
            onClick={() => setActiveTab('heat_capacity')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'heat_capacity'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Ar vs. Hélio (Cv)
          </button>
          <button
            onClick={() => setActiveTab('first_law')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'first_law'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. 1ª Lei: Q = ΔU
          </button>
        </div>
      </div>

      {/* Tab 1: Work = 0 Explanation */}
      {activeTab === 'work' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50">
            <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Por que NÃO há trabalho mecânico (W = 0) mesmo com pressão gigantesca?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Na termodinâmica, o trabalho mecânico de fronteira é definido pela integral da pressão em relação ao deslocamento volumétrico:
            </p>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center font-mono text-xs text-cyan-300 mb-3">
              W = ∫ P · dV &nbsp;&nbsp;⟹&nbsp;&nbsp; Como V = constante, dV = 0 &nbsp;&nbsp;⟹&nbsp;&nbsp; W = 0 Joules
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Embora as partículas colidam com as paredes com imensa força (pressão expressiva), as paredes do recipiente rígido não se movem (Δx = 0). Na física: <strong className="text-amber-300">Sem deslocamento de fronteira, o trabalho mecânico é estritamente zero!</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> O que acontece com a força das moléculas?
              </div>
              <p className="text-slate-400 leading-relaxed">
                As forças normais exercidas no interior do cilindro aumentam. Porém, a força reação das paredes de aço anula totalmente qualquer expansão.
              </p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <span className="text-cyan-400">⚡</span> Consequência Direta
              </div>
              <p className="text-slate-400 leading-relaxed">
                100% da energia fornecida (Q) é obrigada a permanecer no sistema na forma de energia de agitação molecular (ΔU).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monoatomic vs Diatomic Specific Heat */}
      {activeTab === 'heat_capacity' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/50">
            <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Por que o Ar Atmosférico exige MAIS calor para aquecer do que o Hélio?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              A resposta está na <strong>estrutura molecular</strong> e no <strong>Teorema da Equipartição da Energia</strong> da mecânica estatística.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 font-mono text-xs">
              {/* Helium Box */}
              <div className="bg-slate-950/90 p-3 rounded-lg border border-sky-500/40">
                <div className="font-bold text-sky-400 mb-1">{helium.name}</div>
                <div className="text-slate-300 text-[11px] mb-1">3 Graus de Liberdade (Transladação X, Y, Z)</div>
                <div className="text-cyan-300 text-sm font-bold">Cv = 3/2 R ≈ 12.47 J/(mol K)</div>
                <div className="text-[10px] text-slate-400 mt-1">100% da energia aquece o gás imediatamente!</div>
              </div>

              {/* Air Box */}
              <div className="bg-slate-950/90 p-3 rounded-lg border border-purple-500/40">
                <div className="font-bold text-purple-400 mb-1">{air.name}</div>
                <div className="text-slate-300 text-[11px] mb-1">5 Graus de Liberdade (3 Trans + 2 Rotações)</div>
                <div className="text-purple-300 text-sm font-bold">Cv = 5/2 R ≈ 20.79 J/(mol K)</div>
                <div className="text-[10px] text-slate-400 mt-1">Precisa de 66.7% mais calor por grau Celsius!</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              No Ar (N₂ / O₂), ao injetar calor, parte da energia não se transforma em velocidade linear (transladação), mas sim em <strong>rotação do par de átomos em torno dos eixos perpendiculares</strong>. Como a temperatura depende apenas da energia cinética de transladação, o Ar precisa de mais calor total para alcançar o mesmo aumento de temperatura.
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-slate-400">Razão de Calores Específicos:</span>{' '}
              <strong className="text-amber-400 font-mono">Cv(Ar) / Cv(He) = (5/2) / (3/2) = 1.667</strong>
            </div>
            <span className="text-emerald-400 font-medium">O Ar precisa de 66.7% mais calor!</span>
          </div>
        </div>
      )}

      {/* Tab 3: First Law of Thermodynamics */}
      {activeTab === 'first_law' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              A 1ª Lei da Termodinâmica no Processo Isocórico
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              A 1ª Lei estabelece a conservação da energia para qualquer sistema fechado:
            </p>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center font-mono text-xs text-amber-300 mb-3">
              ΔU = Q - W &nbsp;&nbsp;⟹&nbsp;&nbsp; Como W = 0 &nbsp;&nbsp;⟹&nbsp;&nbsp; ΔU = Q
            </div>

            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li><strong>Ao aquecer (Q &gt; 0):</strong> 100% do calor fornecido vira aumento da energia interna (ΔU &gt; 0), fazendo a temperatura T e a pressão P dispararem.</li>
              <li><strong>Ao resfriar (Q &lt; 0):</strong> O sistema perde energia interna (ΔU &lt; 0), reduzindo a pressão sem realizar nem sofrer trabalho mecânico.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
