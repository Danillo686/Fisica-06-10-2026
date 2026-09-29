import React, { useState } from 'react';
import { SimulationState, ThermoMetrics } from '../types/physics';
import { Target, Award, CheckCircle2, ArrowRight, RefreshCcw, HelpCircle, ShieldAlert } from 'lucide-react';
import { soundFx } from '../utils/audioFx';

interface InteractiveChallengesProps {
  state: SimulationState;
  metrics: ThermoMetrics;
  onAddHeat: (heatJ: number) => void;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onReset: () => void;
}

interface Challenge {
  id: number;
  title: string;
  category: string;
  description: string;
  hint: string;
  checkCompletion: (state: SimulationState, metrics: ThermoMetrics) => boolean;
  successMessage: string;
}

export const InteractiveChallenges: React.FC<InteractiveChallengesProps> = ({
  state,
  metrics,
  onUpdateState,
  onReset
}) => {
  const [activeChallengeId, setActiveChallengeId] = useState<number>(1);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: '🎯 Desafio 1: Pressão Alvo Perfeita',
      category: 'Controle Térmico',
      description: 'Aqueça o sistema até atingir uma pressão interna entre 2.20 atm e 2.60 atm.',
      hint: 'Utilize os botões de injeção de calor (+500 J) ou o slider de temperatura para elevar a pressão suavemente sem ultrapassar!',
      checkCompletion: (_, m) => m.pressureAtm >= 2.20 && m.pressureAtm <= 2.60,
      successMessage: 'Excelente! Você atingiu a faixa ideal de pressão isocórica!'
    },
    {
      id: 2,
      title: '🧪 Desafio 2: Prova dos Calores Específicos Molares (Cv)',
      category: 'Física Microscópica',
      description: 'Troque o tipo de gás para Hélio (Monoatômico) e observe o aumento direto de temperatura.',
      hint: 'Selecione "Hélio" no Painel de Controle e veja como Cv = 3/2 R eleva a temperatura mais rapidamente por Joule!',
      checkCompletion: (s) => s.gasType === 'monoatomic',
      successMessage: 'Perfeito! No Hélio monoatômico, toda a energia vai direto para o movimento de transladação!'
    },
    {
      id: 3,
      title: '🚨 Desafio 3: Alívio de Pressão de Emergência',
      category: 'Segurança em Vasos de Pressão',
      description: 'Eleve a pressão acima de 3.0 atm e depois resfrie o gás (ou use a Válvula) para trazê-la abaixo de 1.8 atm.',
      hint: 'Aqueça primeiro, depois utilize os botões de resfriamento (-2.000 J) ou abra a Válvula de Segurança!',
      checkCompletion: (_, m) => m.pressureAtm <= 1.80 && state.heatInputJ > 3000,
      successMessage: 'Manobra concluída com sucesso! Você protegeu o recipiente contra explosão!'
    }
  ];

  const currentChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];
  const isCurrentCompleted = completedChallenges.includes(currentChallenge.id);

  const handleVerifyCurrentChallenge = () => {
    const isCompleted = currentChallenge.checkCompletion(state, metrics);
    if (isCompleted && !isCurrentCompleted) {
      setCompletedChallenges((prev) => [...prev, currentChallenge.id]);
      soundFx.playSuccessSound();
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Target className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-100">Desafios Interativos de Física</h3>
            <p className="text-xs text-slate-400">
              Coloque seu aprendizado em prática com tarefas dinâmicas do seminário
            </p>
          </div>
        </div>

        {/* Progress Counter Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-purple-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Concluídos: {completedChallenges.length} / {challenges.length}
          </div>
        </div>
      </div>

      {/* Challenge Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {challenges.map((c) => {
          const isDone = completedChallenges.includes(c.id);
          const isActive = c.id === activeChallengeId;

          return (
            <button
              key={c.id}
              onClick={() => {
                setActiveChallengeId(c.id);
                setShowHint(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
                isActive
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/80 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="truncate">{c.title.split(':')[0]}</span>
              {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Current Challenge Active Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
            {currentChallenge.category}
          </span>
          {isCurrentCompleted && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Desafio Cumprido!
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-slate-100">{currentChallenge.title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{currentChallenge.description}</p>

        {/* Realtime target tracking status */}
        <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Pressão Atual:</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {metrics.pressureAtm.toFixed(2)} atm
          </span>
        </div>

        {/* Action / Verify Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleVerifyCurrentChallenge}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              isCurrentCompleted
                ? 'bg-emerald-600 text-white border-emerald-500 cursor-default'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400 shadow-lg'
            }`}
          >
            {isCurrentCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Desafio Verificado e Concluído!
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Verificar Conclusão do Desafio
              </>
            )}
          </button>

          <button
            onClick={() => setShowHint(!showHint)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs flex items-center gap-1"
            title="Dica Didática"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Dica</span>
          </button>
        </div>

        {/* Hint Dropdown */}
        {showHint && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{currentChallenge.hint}</span>
          </div>
        )}

        {/* Success Message Banner */}
        {isCurrentCompleted && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{currentChallenge.successMessage}</span>
          </div>
        )}
      </div>

      {/* Reset Simulation Quick Link */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            onReset();
            onUpdateState({ heatInputJ: 0 });
          }}
          className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
        >
          <RefreshCcw className="w-3 h-3" />
          Reiniciar Estado Inicial do Experimento
        </button>
      </div>
    </div>
  );
};
