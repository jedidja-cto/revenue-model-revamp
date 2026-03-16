export interface SimulationEngineConfig {
  projectionMonths: number;
}

export const DEFAULT_SIMULATION_ENGINE_CONFIG: SimulationEngineConfig = {
  projectionMonths: 12,
};

export function resolveSimulationEngineConfig(
  config?: Partial<SimulationEngineConfig>,
): SimulationEngineConfig {
  return {
    ...DEFAULT_SIMULATION_ENGINE_CONFIG,
    ...config,
  };
}
