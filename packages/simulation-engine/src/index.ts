export {
  calculateCostOfGoods,
  calculateGrossProfit,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateRevenue,
} from './financialCalculations.js';
export { runSimulation } from './engine.js';
export { applyScenarioTransform } from './scenarioTransform.js';
export type {
  Business,
  Expense,
  Product,
  SimulationEngineConfig,
  SimulationEngineInput,
  SimulationResult,
  SimulationScenario,
} from './types.js';

export const SIMULATION_ENGINE_VERSION = '0.3.0';
