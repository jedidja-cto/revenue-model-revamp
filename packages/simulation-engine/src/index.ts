export {
  calculateBreakEvenRevenue,
  calculateBreakEvenUnits,
} from './breakEven.js';
export {
  calculateCostOfGoods,
  calculateGrossProfit,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateRevenue,
} from './financialCalculations.js';
export { calculateGrossMargin, calculateProfitMargin } from './metrics.js';
export { projectMonthlyFinancials } from './projection.js';
export { runSimulation } from './engine.js';
export { applyScenarioTransform } from './scenarioTransform.js';
export type {
  Business,
  Expense,
  MonthlyProjection,
  Product,
  SimulationEngineConfig,
  SimulationEngineInput,
  SimulationResult,
  SimulationScenario,
} from './types.js';

export const SIMULATION_ENGINE_VERSION = '0.3.0';
