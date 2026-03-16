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

export interface SimulationEngineInput {
  business: Business;
  products: Product[];
  expenses: Expense[];
  scenario: SimulationScenario;
}

export interface SimulationResult {
  revenue: number;
  costOfGoods: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
}

