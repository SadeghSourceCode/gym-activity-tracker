# Gym Activity Tracker

Gym Activity Tracker is an Angular-based workout planning and tracking application designed to make logging gym sessions fast, understandable, and mobile-friendly.

The product is being developed as a commercial-ready fitness application. The current frontend supports workout planning, exercise discovery, workout execution/tracking, progress views, profile features, bilingual UI foundations, local persistence, and installable PWA behavior.

## Live PWA

The `staging` branch is deployed automatically to GitHub Pages.

**Open / install the app:**

https://sadeghsourcecode.github.io/gym-activity-tracker/

On supported browsers, open the link and choose **Install app** / **Add to Home Screen** from the browser menu. The application includes a web app manifest and service worker so previously loaded application resources can remain available when the network is unreliable.

> GitHub Pages is currently the staging distribution channel. Before commercial launch, use a production domain, production observability, analytics/privacy configuration, backend authentication, server-side data sync, backup/restore, and a separate staging environment.

## Product goals

- Make workout logging quick enough to use during a real gym session.
- Support warm-up, main, and cooldown exercise sections.
- Let users plan workouts and record sets, repetitions, weight, time, distance, rest, and completion state.
- Preserve workout plans and progress across application sessions.
- Provide clear progress/statistics views instead of only storing raw workout data.
- Work well on phones and be installable as a PWA.
- Keep the architecture ready for future account sync and commercial backend services.

## Current architecture

The application follows a feature-oriented Angular structure:

```text
src/app/
├── components/          # shared presentational UI
├── core/                # cross-cutting application services
├── data-access/         # shared models/data access
└── features/
    ├── exercise-library/
    ├── home/
    ├── profile/
    ├── search/
    └── workout/
```

Feature-specific models and services live inside the feature's `data-access` directory. Reusable components receive configuration/input data and communicate through explicit outputs.

## Workout persistence

Workout plans and rest-day information are currently persisted in browser storage. This keeps the frontend usable without a backend and works well for the current MVP/staging phase.

For commercial production, local-only persistence is not sufficient. The planned persistence architecture should add:

1. authenticated user accounts;
2. backend/API persistence;
3. server-side schema migrations;
4. cross-device synchronization;
5. offline mutation queue + conflict handling;
6. backup/recovery and data export/delete controls.

## PWA implementation

PWA support is implemented using native browser capabilities to avoid adding another runtime dependency to the current lockfile.

Included pieces:

- `public/manifest.webmanifest` — install metadata and app identity;
- `public/icons/app-icon.svg` — installable application icon;
- `public/sw.js` — same-origin application-shell/runtime caching;
- service-worker registration in `src/main.ts`;
- mobile/PWA metadata in `src/index.html`;
- HTTPS hosting through GitHub Pages.

The service worker uses a conservative strategy:

- navigation requests are network-first with an offline app-shell fallback;
- previously requested same-origin static resources can be reused from cache;
- non-GET requests and third-party requests are never intercepted.

This is intentionally a simple staging implementation. For a mature offline-first commercial product, move workout data to IndexedDB and add an explicit sync/outbox strategy.

## Tech stack

- Angular 22
- TypeScript 6
- RxJS 7
- Angular CDK
- Tailwind CSS 4
- Font Awesome
- Vitest
- pnpm 11
- GitHub Actions + GitHub Pages

## Requirements

Use the Node and pnpm versions aligned with CI:

```text
Node 22.x
pnpm 11.9.0
```

## Install

```bash
git clone https://github.com/SadeghSourceCode/gym-activity-tracker.git
cd gym-activity-tracker
pnpm install
```

## Development

```bash
pnpm start
```

Open:

```text
http://localhost:4200/
```

Service workers require a secure origin in normal browser environments. `localhost` is treated as a secure development exception, but the production PWA behavior should always be validated from a production build served over HTTPS.

## Build

Production build:

```bash
pnpm build
```

GitHub Pages build:

```bash
pnpm run build:github-pages
```

The Pages build uses the repository base path:

```text
/gym-activity-tracker/
```

## Tests

```bash
pnpm test
```

Before merging commercial-facing changes, the minimum quality gate should include:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Recommended next quality gates are linting, accessibility checks, Playwright/Cypress critical-flow tests, Lighthouse budgets, and dependency/security scanning.

## Deployment

`.github/workflows/deploy-pages.yml` deploys the `staging` branch to GitHub Pages.

The workflow:

1. installs dependencies with the frozen pnpm lockfile;
2. creates the Angular production build with the GitHub Pages base href;
3. publishes `dist/gym-activity-tracker/browser` as a Pages artifact;
4. deploys it through the GitHub Pages environment.

## Commercial readiness roadmap

The highest-priority work before charging users should be:

- account authentication and secure backend persistence;
- cross-device workout synchronization;
- IndexedDB-backed offline workout logging;
- conflict resolution for offline edits;
- onboarding and first-workout activation flow;
- explicit install/update UX for the PWA;
- product analytics with consent/privacy controls;
- error monitoring and performance monitoring;
- automated E2E tests for plan → train → save → statistics;
- accessibility audit (WCAG 2.2 AA target);
- privacy policy, terms, account/data deletion, and data export;
- separate staging and production deployments/domains;
- backups, rate limiting, abuse protection, and API security once a backend exists.

## Branch strategy

Current active integration branch:

```text
staging
```

Development changes should be validated on `staging` before promotion to `main` / the future production environment.

## Contributing

Read [`AGENTS.md`](./AGENTS.md) before implementing or refactoring features. It documents the repository's architecture, component boundaries, data-access rules, naming conventions, and agent workflow.

When adding a feature, keep domain logic out of presentation components whenever practical and place feature-specific services/models in the feature's `data-access` directory.

## License and commercial use

A public repository is not automatically an open-source license. Before commercial launch, add an explicit `LICENSE` file and confirm that every external exercise dataset, image, animation, font, icon, and third-party API has terms compatible with the intended commercial use.
