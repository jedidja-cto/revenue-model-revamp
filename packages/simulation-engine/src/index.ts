import type {
  Business,
  Expense,
  Product,
  SimulationScenario,
} from '@revrem/data-models';

export type {
  Business,
  Expense,
  Product,
  SimulationScenario,
} from '@revrem/data-models';

export interface SimulationEngineConfig {
  currency: string;
  projectionMonths: number;
  taxRate: number;
}

export interface SimulationScenarioSummary {
  name: string;
}

export interface SimulationEngineInput {
  business: Business;
  products: Product[];
  expenses: Expense[];
  scenario: SimulationScenario;
}

export const SIMULATION_ENGINE_VERSION = '0.1.0';

export function createSimulationEnginePlaceholder(): string {
  return 'Simulation engine scaffolding is ready for Phase 2.';
}
