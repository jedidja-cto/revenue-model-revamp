# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Firebase Spark-plan hosted MVP with browser-based simulation flow
- Firebase Auth integration for Google, email/password, magic link, and phone sign-in
- Firestore-backed scenario history and CSV export
- Full browser UI for scenario building and results review

### Changed

- Rewrote the hosted UI into a 4-step scenario wizard
- Redesigned the results experience with clearer metrics, charting, and saved scenario reloads
- Improved README and product documentation to reflect the actual MVP and target use cases
- Refined the authentication screen and replaced the guest link with a design credit
- Limited the `Run simulation` CTA to the `Review & Run` step only
- Added a `Run another scenario` action from the results view so users can jump back to the business step
- Renamed exported CSV files to include the active business name, scenario name, and a unique timestamp suffix
- Added a signed-in header home action that clears the builder and returns users to a fresh business step
- Improved CSV export naming so downloads fall back to the current saved-scenario context instead of a generic filename
- Added optional configurable feedback links in the hosted UI for WhatsApp or form-based tester feedback
- Added first-run onboarding for signed-in users with profile questions stored in Firestore
- Switched the signed-in header status to greet users by their stored onboarding name
- Added a private-beta approval gate so only invited email addresses can access the signed-in app

### Fixed

- Fixed wizard footer visibility so the simulation CTA no longer appears before the final review step
- Fixed Firebase phone authentication flow so the SMS confirmation result is preserved between code send and verification
- Fixed the local/browser build flow for the hosted simulation-engine bundle

## [0.1.0] - 2026-03-15

### Added

- Monorepo scaffolding
- Documentation foundation
- Simulation engine package placeholder
- Configuration system
- Development tooling setup
