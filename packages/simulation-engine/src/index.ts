export {
  calculateBreakEvenRevenue,
  calculateBreakEvenUnits,
} from './breakEven.js';
export {
  calculateCashShortfall,
  calculateCumulativeProfit,
  calculateNetCashflow,
  calculateRunway,
} from './cashflow.js';
export {
  DEFAULT_SIMULATION_ENGINE_CONFIG,
  resolveSimulationEngineConfig,
} from './config.js';
export { calculateDepreciation } from './depreciation.js';
export {
  calculateCostOfGoods,
  calculateGrossProfit,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateRevenue,
} from './financialCalculations.js';
export {
  applyCostInflation,
  applyDemandGrowth,
  applyPriceGrowth,
} from './growthModel.js';
export { calculateGrossMargin, calculateProfitMargin } from './metrics.js';
export { projectMonthlyFinancials } from './projection.js';
export { runSimulation } from './engine.js';
export {
  inflationSpike,
  marketCrash,
  optimisticGrowth,
  steadyGrowth,
} from './scenarioPresets.js';
export { applyScenarioTransform } from './scenarioTransform.js';
export { calculateTax } from './tax.js';
export { validateSimulationInput } from './validation.js';
export type { CapexSchedule, SimulationEngineConfig } from './config.js';
export type {
  Business,
  Expense,
  MonthlyProjection,
  Product,
  SimulationEngineInput,
  SimulationResult,
  SimulationScenario,
} from './types.js';

export const SIMULATION_ENGINE_VERSION = '0.7.0';
