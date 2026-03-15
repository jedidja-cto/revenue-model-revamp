export interface SimulationEngineConfig {
  currency: string;
  projectionMonths: number;
  taxRate: number;
}

export interface SimulationScenario {
  name: string;
}

export const SIMULATION_ENGINE_VERSION = '0.1.0';

export function createSimulationEnginePlaceholder(): string {
  return 'Simulation engine scaffolding is ready for Phase 2.';
}
