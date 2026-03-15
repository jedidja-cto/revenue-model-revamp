# Simulation Model

## Intent

The simulation engine will eventually model how revenue and profitability respond to changes in unit economics and operating assumptions.

## Planned Financial Concepts

- Revenue: selling price multiplied by estimated sales volume
- Direct cost: unit cost multiplied by estimated sales volume
- Gross profit: revenue minus direct cost
- Operating expenses: recurring business costs such as rent, salaries, and software
- Net profit: gross profit minus operating expenses and future tax rules

## Projection Direction

The initial projection horizon is expected to cover 12 months, driven by shared configuration in `config/business-rules.yaml`.

## Future Capabilities

- Monthly revenue projections
- Cost and expense scenario comparison
- Profitability modeling across multiple products or services
- Configurable currency and tax assumptions
- Support for additional business rules as the domain matures

## Phase 1 Constraint

No financial calculation logic is implemented yet. This document exists to define the conceptual boundary for future phases.
