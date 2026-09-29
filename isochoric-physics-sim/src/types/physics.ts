export type GasType = 'monoatomic' | 'diatomic';

export interface GasProperties {
  id: GasType;
  name: string;
  chemicalFormula: string;
  degreesOfFreedom: number; // 3 for monoatomic, 5 for diatomic (room temp)
  CvMolarRatio: string; // "3/2 R" or "5/2 R"
  CvMolarValue: number; // in J/(mol K)
  CpMolarRatio: string; // "5/2 R" or "7/2 R"
  gamma: number; // 1.67 or 1.40
  description: string;
  structureNote: string;
}

export type ScenarioPresetId = 'pressure_cooker' | 'sun_cylinder' | 'otto_cycle' | 'custom';

export interface ScenarioPreset {
  id: ScenarioPresetId;
  title: string;
  subtitle: string;
  icon: string;
  initialTempK: number;
  targetTempK: number;
  initialPressureAtm: number;
  volumeL: number;
  moles: number;
  gasType: GasType;
  description: string;
  didacticNote: string;
  dangerThresholdAtm: number;
}

export interface SimulationState {
  temperatureK: number; // Temperature in Kelvin
  volumeL: number; // Volume in Liters (Constant)
  moles: number; // Amount of substance (mol)
  gasType: GasType;
  heatInputJ: number; // Heat Q added in Joules
  currentScenario: ScenarioPresetId;
  isHeating: boolean;
}

export interface ThermoMetrics {
  pressureAtm: number;
  pressureKPa: number;
  internalEnergyJ: number; // Total U = n * Cv * T
  deltaUJ: number; // ΔU = Q
  workDoneJ: number; // W = 0
  heatAbsorbedJ: number; // Q
  translationalEnergyJ: number;
  rotationalEnergyJ: number;
  tempCelsius: number;
}
