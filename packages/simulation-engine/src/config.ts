export interface CapexSchedule {
  capex: number;
  months: number;
}

export interface SimulationEngineConfig {
  projectionMonths: number;
  taxRate: number;
  capexSchedule?: CapexSchedule;
}

export const DEFAULT_SIMULATION_ENGINE_CONFIG: SimulationEngineConfig = {
  projectionMonths: 12,
  taxRate: 0.2,
};

export function resolveSimulationEngineConfig(
  config?: Partial<SimulationEngineConfig>,
): SimulationEngineConfig {
  return {
    ...DEFAULT_SIMULATION_ENGINE_CONFIG,
    ...config,
  };
}
