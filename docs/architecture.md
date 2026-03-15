# Architecture

## Overview

The repository is organized as a monorepo so frontend applications, backend services, shared packages, and project-level configuration can evolve together while remaining clearly separated.

## Repository Layout

- `apps/web`: placeholder for the future frontend application
- `apps/api`: placeholder for the future backend service
- `packages/simulation-engine`: TypeScript package for future revenue and profit calculations
- `packages/data-models`: placeholder for shared data types and schemas
- `packages/ui-components`: placeholder for shared interface components
- `config`: shared configuration such as business rules and defaults
- `docs`: foundational project and planning documentation
- `scripts/dev-tools`: scripts reserved for local development helpers and automation

## Planned System Components

### Web Application

The future web application will provide user interfaces for capturing assumptions, running simulations, and presenting financial outcomes.

### API Service

The future API service will support persistence, orchestration, and integration points for the simulation workflows.

### Shared Packages

Shared packages will isolate domain logic, data contracts, and interface elements so each application can reuse consistent building blocks.

## Development Standards

- `pnpm` manages workspaces and dependency installation
- TypeScript is the baseline language for shared packages
- ESLint enforces code quality expectations
- Prettier maintains formatting consistency
- GitHub Actions validates the scaffold through linting, type-checking, and build steps

## Design Principles

- Keep business logic inside reusable packages instead of application shells
- Centralize configurable business rules under `config/`
- Document structure and intent early to support phased delivery
- Prefer lightweight tooling until additional complexity is justified
