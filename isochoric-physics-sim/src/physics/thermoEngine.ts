import { GasProperties, GasType, ScenarioPreset, SimulationState, ThermoMetrics } from '../types/physics';

export const R_GAS_CONSTANT = 8.314462618; // J / (mol K)
export const ATM_TO_KPA = 101.325; // 1 atm in kPa

export const GAS_DATA: Record<GasType, GasProperties> = {
  monoatomic: {
    id: 'monoatomic',
    name: 'Gás Hélio (He)',
    chemicalFormula: 'He',
    degreesOfFreedom: 3,
    CvMolarRatio: '3/2 R',
    CvMolarValue: (3 / 2) * R_GAS_CONSTANT, // ~12.47 J/(mol K)
    CpMolarRatio: '5/2 R',
    gamma: 1.67,
    description: 'Gás nobre monoatômico. Apenas 3 graus de liberdade de transladação nos eixos X, Y e Z.',
    structureNote: '100% da energia absorvida aumenta a velocidade de transladação das partículas.'
  },
  diatomic: {
    id: 'diatomic',
    name: 'Ar Atmosférico (N₂ / O₂)',
    chemicalFormula: 'N₂ (80%) + O₂ (20%)',
    degreesOfFreedom: 5,
    CvMolarRatio: '5/2 R',
    CvMolarValue: (5 / 2) * R_GAS_CONSTANT, // ~20.79 J/(mol K)
    CpMolarRatio: '7/2 R',
    gamma: 1.40,
    description: 'Moléculas diatômicas rígidas. Possuem 3 graus de liberdade translacionais + 2 graus rotacionais.',
    structureNote: 'Apenas 60% da energia vai para transladação; 40% é armazenada na rotação das moléculas!'
  }
};

export const PRESETS: ScenarioPreset[] = [
  {
    id: 'pressure_cooker',
    title: 'Panela de Pressão',
    subtitle: 'Culinária Doméstica',
    icon: '🍲',
    initialTempK: 298.15, // 25°C
    targetTempK: 393.15, // ~120°C
    initialPressureAtm: 1.0,
    volumeL: 4.5,
    moles: 0.184,
    gasType: 'diatomic',
    description: 'O vapor e o ar ficam trancados dentro da panela rígida. Sem alteração de volume (V = constante), o aumento de temperatura faz a pressão subir até ~2.0 atm, elevando o ponto de ebulição da água.',
    didacticNote: 'A tampa rígida impede a expansão (W = 0). Todo o calor fornecido pela chama do fogão vai direto para elevar a energia interna e a pressão interna!',
    dangerThresholdAtm: 2.5
  },
  {
    id: 'sun_cylinder',
    title: 'Cilindro ao Sol',
    subtitle: 'Risco de Explosão Industrial',
    icon: '☀️',
    initialTempK: 293.15, // 20°C
    targetTempK: 353.15, // 80°C sob sol escaldante
    initialPressureAtm: 15.0, // Alta pressão inicial em cilindro hospitalar/industrial
    volumeL: 50.0,
    moles: 31.18,
    gasType: 'diatomic',
    description: 'Um cilindro de gás fechado exposto ao sol absorve calor por radiação. As paredes de aço não se expandem, causando uma perigosa elevação da pressão interna que pode romper o vaso de pressão.',
    didacticNote: 'Como V é constante, P ∝ T (Lei de Gay-Lussac). A pressão sobe proporcionalmente à temperatura absoluta, sem alívio por realização de trabalho mecânico.',
    dangerThresholdAtm: 18.5
  },
  {
    id: 'otto_cycle',
    title: 'Ignição no Ciclo Otto',
    subtitle: 'Motor Automotivo a Combustão',
    icon: '🚗',
    initialTempK: 650, // Ponto morto superior pós-compressão
    targetTempK: 2200, // Instantâneo pós-faísca da vela
    initialPressureAtm: 18.0,
    volumeL: 0.5,
    moles: 0.00168,
    gasType: 'diatomic',
    description: 'A faísca elétrica inflama a mistura no Ponto Morto Superior (PMS). Como o pistão está momentaneamente parado, a combustão ocorre quase instantaneamente a volume constante.',
    didacticNote: 'É a fase de aumento isocórico de pressão do ciclo de 4 tempos. A pressão atinge o pico antes de iniciar a etapa de expansão com realização de trabalho.',
    dangerThresholdAtm: 70.0
  },
  {
    id: 'custom',
    title: 'Laboratório Livre',
    subtitle: 'Controle Total dos Parâmetros',
    icon: '🧪',
    initialTempK: 300,
    targetTempK: 500,
    initialPressureAtm: 1.0,
    volumeL: 10.0,
    moles: 0.406,
    gasType: 'monoatomic',
    description: 'Ajuste livremente o gás (Hélio vs Ar), a temperatura e o calor injetado para testar suas próprias hipóteses.',
    didacticNote: 'Experimente trocar de Hélio para Ar sob a mesma quantidade de calor e observe como a temperatura do Ar sobe mais lentamente!',
    dangerThresholdAtm: 5.0
  }
];

export function calculateThermoMetrics(state: SimulationState): ThermoMetrics {
  const gasProps = GAS_DATA[state.gasType];
  const { temperatureK, volumeL, moles } = state;

  // Ideal Gas Law: P = (n * R * T) / V
  // V is in Liters, so converting V to m³ (1 L = 0.001 m³)
  const volumeM3 = volumeL * 0.001;
  const pressurePascal = (moles * R_GAS_CONSTANT * temperatureK) / volumeM3;
  const pressureKPa = pressurePascal / 1000;
  const pressureAtm = pressureKPa / ATM_TO_KPA;

  // Internal Energy U = n * Cv * T
  const internalEnergyJ = moles * gasProps.CvMolarValue * temperatureK;

  // Heat absorbed Q = ΔU in Isochoric process since W = 0
  // ΔU = n * Cv * ΔT
  const heatAbsorbedJ = state.heatInputJ;
  const deltaUJ = heatAbsorbedJ;
  const workDoneJ = 0; // Strictly 0 for Isochoric!

  // Energy distribution:
  // For Monoatomic: 3 degrees of freedom (all translational) -> 100%
  // For Diatomic: 3 translational + 2 rotational = 5 degrees -> 3/5 (60%) translational, 2/5 (40%) rotational
  let translationalEnergyJ = internalEnergyJ;
  let rotationalEnergyJ = 0;

  if (state.gasType === 'diatomic') {
    translationalEnergyJ = internalEnergyJ * (3 / 5);
    rotationalEnergyJ = internalEnergyJ * (2 / 5);
  }

  return {
    pressureAtm,
    pressureKPa,
    internalEnergyJ,
    deltaUJ,
    workDoneJ,
    heatAbsorbedJ,
    translationalEnergyJ,
    rotationalEnergyJ,
    tempCelsius: temperatureK - 273.15
  };
}

/**
 * Calculates how much heat (Q) is required to raise the gas temperature by ΔT
 * Q = n * Cv * ΔT
 */
export function calculateRequiredHeat(
  moles: number,
  gasType: GasType,
  deltaT: number
): number {
  const cv = GAS_DATA[gasType].CvMolarValue;
  return moles * cv * deltaT;
}

/**
 * Calculates resulting temperature given initial temperature and added heat Q
 * T_final = T_initial + Q / (n * Cv)
 */
export function calculateTempFromHeat(
  tInitialK: number,
  addedHeatJ: number,
  moles: number,
  gasType: GasType
): number {
  const cv = GAS_DATA[gasType].CvMolarValue;
  if (moles * cv === 0) return tInitialK;
  return tInitialK + addedHeatJ / (moles * cv);
}
