# Revenue Model Revamp

## Overview

Revenue Model Revamp is a simulation tool for small and medium businesses that need a clearer view of how pricing, sales volume, costs, and operating expenses affect profitability.

## Problem

Many SMEs make pricing and growth decisions without a simple way to test how changing costs, sales assumptions, or overhead will affect monthly and annual performance. This often leads to reactive decision-making and limited financial visibility.

## Solution

This project will provide a structured simulation platform where business owners can model revenue, cost, and profit scenarios before making operational decisions. The Phase 1 repository focuses on clean scaffolding so future phases can add data models, business rules, and application features safely.

## Repository Structure

```text
revenue-model-revamp/
|-- apps/
|   |-- api/
|   `-- web/
|-- config/
|   `-- business-rules.yaml
|-- docs/
|   |-- architecture.md
|   |-- product-spec.md
|   |-- roadmap.md
|   `-- simulation-model.md
|-- packages/
|   |-- data-models/
|   |-- simulation-engine/
|   `-- ui-components/
|-- scripts/
|   `-- dev-tools/
|-- .github/
|   `-- workflows/
|-- CHANGELOG.md
|-- README.md
`-- package.json
```

## Development Setup

1. Install Node.js 20 or later.
2. Install `pnpm` if it is not already available.
3. Run `pnpm install` from the repository root.
4. Use `pnpm lint` to validate code quality.
5. Use `pnpm typecheck` to verify the TypeScript package scaffold.
6. Use `pnpm build` to build the placeholder simulation engine package.

## Roadmap

Planned phases are documented in [docs/roadmap.md](./docs/roadmap.md).

## Versioning

This repository uses semantic versioning. Phase 1 is released as `v0.1.0` and represents repository scaffolding only.
