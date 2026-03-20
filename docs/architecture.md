# Architecture

## Overview

Revenue Model Revamp is structured as a monorepo so the simulation engine, shared data models, CLI tooling, and hosted app can evolve together without mixing concerns.

The current live experience is a browser-based MVP hosted on Firebase Hosting. The financial calculations do not run on a server. They run in the browser through the shared simulation engine bundle.

## Main Parts

### Hosted UI

The user-facing app lives under `hosting/`.

It handles:

- user authentication
- scenario input
- step-by-step validation
- running the simulation
- showing charts and results
- saving scenarios to Firestore
- reopening previous scenarios
- CSV export

### Simulation Engine

The main business logic lives in `packages/simulation-engine`.

It handles:

- revenue calculations
- cost calculations
- gross and net profit
- tax handling
- break-even analysis
- monthly projections
- growth and cashflow calculations

This logic is shared between the hosted app and the CLI.

### Data Models

Shared interfaces live in `packages/data-models`.

These define the main shapes used across the project:

- business
- product
- expense
- scenario

### CLI

The CLI lives in `packages/cli`.

It is useful for local scenario testing, batch runs, and CSV output without using the browser app.

## Firebase Usage

The Spark MVP uses:

- Firebase Hosting
- Firebase Auth
- Firestore

It does **not** depend on Cloud Functions for the core flow.

## Design Principles

- Keep financial logic outside the UI
- Keep hosted app code simple and browser-safe
- Reuse the same engine in both the UI and CLI
- Keep the MVP small enough to move quickly
- Make the app understandable for non-technical business users
