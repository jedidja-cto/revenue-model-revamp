import type { SimulationScenario } from './types.js';

function createScenarioPreset(
  businessId: string,
  id: string,
  name: string,
  priceChangePercent: number,
  costChangePercent: number,
  demandChangePercent: number,
  expenseChangePercent: number,
): SimulationScenario {
  return {
    id,
    businessId,
    name,
    priceChangePercent,
    costChangePercent,
    demandChangePercent,
    expenseChangePercent,
    createdAt: new Date(),
  };
}

export function steadyGrowth(businessId: string): SimulationScenario {
  return createScenarioPreset(
    businessId,
    'steady-growth',
    'Steady Growth',
    2,
    1,
    3,
    1,
  );
}

export function optimisticGrowth(businessId: string): SimulationScenario {
  return createScenarioPreset(
    businessId,
    'optimistic-growth',
    'Optimistic Growth',
    4,
    1,
    8,
    2,
  );
}

export function inflationSpike(businessId: string): SimulationScenario {
  return createScenarioPreset(
    businessId,
    'inflation-spike',
    'Inflation Spike',
    1,
    10,
    -3,
    8,
  );
}

export function marketCrash(businessId: string): SimulationScenario {
  return createScenarioPreset(
    businessId,
    'market-crash',
    'Market Crash',
    -10,
    -5,
    -25,
    -10,
  );
}
