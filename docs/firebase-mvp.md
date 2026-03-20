# Firebase Spark MVP

## Overview

The current app is built to run on the Firebase Spark plan.

That means:

- no backend compute is required for the core user flow
- the simulation runs in the browser
- Firebase Hosting serves the UI
- Firebase Auth handles sign-in
- Firestore stores saved scenarios and results

## What The Hosted App Does

The hosted MVP allows a signed-in user to:

- authenticate with Google
- authenticate with email and password
- authenticate with a magic link
- authenticate with phone verification
- build a scenario in a guided 4-step wizard
- run a business simulation in the browser
- save the result to Firestore
- reopen saved scenarios
- export saved results as CSV

## Firestore Model

Collection: `scenarios`

Document shape:

```json
{
  "userId": "uid",
  "businessName": "Coffee Shop",
  "input": {},
  "result": {},
  "createdAt": "server timestamp"
}
```

The collection is created lazily. Nothing has to be created manually before the first save.

## Active Files

- `hosting/index.html`: hosted UI structure
- `hosting/styles.css`: visual design and responsive layout
- `hosting/app.js`: auth flows, scenario wizard, results, history, CSV export
- `hosting/firebase-config.js`: browser-safe Firebase config
- `hosting/simulation-engine.browser.js`: built browser bundle of the shared engine
- `firestore.rules`: rules for Firestore access
- `firebase.json`: Hosting + Firestore deployment config

## Setup

1. Install dependencies:
   - `pnpm install`
2. Build the project:
   - `pnpm build`
3. Make sure Firebase is set to the right project:
   - `firebase use revenue-model-revamp`
4. Enable these Firebase products:
   - Firestore Database
   - Authentication
5. Enable these sign-in methods:
   - Google
   - Email/Password
   - Email Link
   - Phone

## Verification

Run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## Deployment

Deploy Hosting and Firestore rules with:

- `firebase deploy --only hosting,firestore`

## Security Notes

- Firestore rules require authentication.
- Each saved scenario is scoped to the current user's UID.
- The active deployment path does not depend on older Functions or Storage experiments.
