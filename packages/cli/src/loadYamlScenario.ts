import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import {
  validateSimulationInput,
  type SimulationEngineInput,
} from '@revenue-model-revamp/simulation-engine';
import type { SimulationEngineConfig } from '@revenue-model-revamp/simulation-engine';
import YAML from 'yaml';

interface RawBusiness {
  name: string;
  industry?: string;
  currency?: string;
}

interface RawProduct {
  name: string;
  category?: string;
  costPrice: number;
  sellingPrice: number;
  estimatedMonthlyUnits: number;
  supplier?: string;
}

interface RawExpense {
  name: string;
  category?: string;
  amountMonthly: number;
  fixed?: boolean;
}

interface RawScenario {
  name: string;
  priceChangePercent: number;
  costChangePercent: number;
  demandChangePercent: number;
  expenseChangePercent: number;
}

interface RawCapexSchedule {
  capex: number;
  months: number;
}

interface RawConfig {
  projectionMonths?: number;
  taxRate?: number;
  capexSchedule?: RawCapexSchedule;
}

interface RawYamlScenario {
  business: RawBusiness;
  products: RawProduct[];
  expenses: RawExpense[];
  scenario: RawScenario;
  config?: RawConfig;
}

export interface LoadedYamlScenario {
  input: SimulationEngineInput;
  config?: Partial<SimulationEngineConfig>;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function assertScenarioShape(raw: RawYamlScenario): void {
  if (!raw.business?.name) {
    throw new Error('Scenario YAML is missing business.name.');
  }

  if (!Array.isArray(raw.products) || raw.products.length === 0) {
    throw new Error('Scenario YAML must include at least one product.');
  }

  if (!Array.isArray(raw.expenses)) {
    throw new Error('Scenario YAML must include an expenses array.');
  }

  if (!raw.scenario?.name) {
    throw new Error('Scenario YAML is missing scenario.name.');
  }
}

export function loadYamlScenario(filePath: string): LoadedYamlScenario {
  const resolvedPath = resolve(filePath);
  const fileContents = readFileSync(resolvedPath, 'utf8');
  const rawScenario = YAML.parse(fileContents) as RawYamlScenario;
  const createdAt = new Date();

  assertScenarioShape(rawScenario);

  const businessId = slugify(rawScenario.business.name);
  const scenarioId = slugify(rawScenario.scenario.name || basename(resolvedPath));

  const input: SimulationEngineInput = {
    business: {
      id: businessId,
      name: rawScenario.business.name,
      industry: rawScenario.business.industry ?? 'General',
      currency: rawScenario.business.currency ?? 'NAD',
      createdAt,
    },
    products: rawScenario.products.map((product, index) => ({
      id: `${businessId}-product-${index + 1}`,
      businessId,
      name: product.name,
      category: product.category ?? 'general',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      estimatedMonthlyUnits: product.estimatedMonthlyUnits,
      supplier: product.supplier,
      createdAt,
    })),
    expenses: rawScenario.expenses.map((expense, index) => ({
      id: `${businessId}-expense-${index + 1}`,
      businessId,
      name: expense.name,
      category: expense.category ?? 'general',
      amountMonthly: expense.amountMonthly,
      fixed: expense.fixed ?? true,
      createdAt,
    })),
    scenario: {
      id: scenarioId,
      businessId,
      name: rawScenario.scenario.name,
      priceChangePercent: rawScenario.scenario.priceChangePercent,
      costChangePercent: rawScenario.scenario.costChangePercent,
      demandChangePercent: rawScenario.scenario.demandChangePercent,
      expenseChangePercent: rawScenario.scenario.expenseChangePercent,
      createdAt,
    },
  };

  validateSimulationInput(input);

  return {
    input,
    config: rawScenario.config,
  };
}
