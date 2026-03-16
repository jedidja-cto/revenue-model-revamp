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
  grossMargin: number;
  profitMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  monthlyProjection: MonthlyProjection[];
  cumulativeProfit: number[];
  runway: number;
  taxPaid: number[];
  profitAfterTax: number[];
  depreciation: number[];
  netCashflow: number[];
}

export interface MonthlyProjection {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
}
