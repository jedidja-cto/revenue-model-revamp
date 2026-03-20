# Revenue Model Revamp

![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-FFCA28?logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)
![Firebase Auth](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)

## What This Is

Revenue Model Revamp is a browser-based business simulation tool.

It helps a founder, operator, or business owner answer a simple but painful question:

**"If I change my prices, costs, sales volume, or monthly expenses, what actually happens to my business?"**

Instead of guessing, the app lets a user enter:

- what they sell
- how much it costs to deliver
- how much they charge
- how many units they expect to sell
- what their monthly operating costs are
- what kind of demand, price, or cost changes they expect over time

Then it shows the numbers that matter:

- revenue
- gross profit
- net profit
- tax impact
- break-even point
- monthly projections
- cashflow trends
- runway

## Why It Matters

Many small businesses and early-stage founders do not fail because they lack effort.
They fail because they make important decisions with weak financial visibility.

Common examples:

- pricing is too low
- costs rise faster than expected
- demand grows more slowly than planned
- operating expenses are heavier than they look
- cashflow pressure shows up too late

This project exists to make those risks visible earlier, in a simple and practical way.

## Who It Is For

This MVP is useful for people who need quick business scenario planning without building a complex spreadsheet first.

Good fits include:

- startup founders
- small business owners
- operators running retail or service businesses
- teams with recurring revenue models
- businesses with meaningful monthly overhead
- infrastructure or fiber businesses that need to model subscriber growth, equipment cost, and runway

## What The MVP Does Today

The current app is a Spark-plan Firebase MVP that runs fully in the browser.

Users can:

- sign in with Google
- sign in with email and password
- sign in with a magic link
- sign in with phone verification
- build a business scenario in a step-by-step wizard
- run the shared simulation engine in the browser
- save results to Firestore
- review saved scenarios
- download a CSV of saved results

## Tech Stack

- Firebase Hosting
- Firebase Auth
- Firestore
- TypeScript
- pnpm workspace monorepo
- Shared simulation engine package
- Vanilla HTML, CSS, and JavaScript for the hosted UI
- Chart.js for results visualization

## Product Structure

```text
revenue-model-revamp/
|-- hosting/                     # Browser UI deployed to Firebase Hosting
|-- packages/
|   |-- simulation-engine/       # Shared business calculation engine
|   |-- data-models/             # Shared interfaces and data shapes
|   `-- cli/                     # Local batch runner and scenario tooling
|-- docs/                        # Product, architecture, and deployment docs
|-- scripts/                     # Build helpers
|-- firebase.json                # Hosting + Firestore config
|-- firestore.rules              # Firestore access rules
`-- package.json
```

## Local Development

1. Install Node.js 20 or later.
2. Install dependencies:
   - `pnpm install`
3. Run checks:
   - `pnpm lint`
   - `pnpm typecheck`
4. Build the workspace and browser bundle:
   - `pnpm build`

## Firebase Setup

1. Select the project:
   - `firebase use revenue-model-revamp`
2. Make sure these Firebase products are enabled:
   - Firestore Database
   - Authentication
3. Make sure these sign-in methods are enabled:
   - Google
   - Email/Password
   - Email Link
   - Phone
4. Deploy:
   - `firebase deploy --only hosting,firestore`

## Documentation

- [Architecture](./docs/architecture.md)
- [Product Spec](./docs/product-spec.md)
- [Firebase MVP](./docs/firebase-mvp.md)
- [Roadmap](./docs/roadmap.md)

## Notes

- The current product is a browser-first MVP, not a full finance platform yet.
- The simulation engine and CLI remain available for local and technical use.
- Older Firebase Functions experiments are intentionally kept out of the active Spark deployment path.

## Versioning

The simulation engine has been implemented through `v0.8.0`, and the current repository includes the hosted Spark MVP on top of that foundation.
