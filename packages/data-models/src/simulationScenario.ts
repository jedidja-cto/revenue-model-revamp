export interface SimulationScenario {
  id: string;
  businessId: string;
  name: string;
  priceChangePercent: number;
  costChangePercent: number;
  demandChangePercent: number;
  expenseChangePercent: number;
  createdAt: Date;
}

