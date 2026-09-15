# Gym Activity Tracker

A mobile-first Angular application for planning workouts, logging sets, and tracking training progress.

## Product status

The project is an active pre-production product. The core workout flow is usable, but the repository should not yet be treated as commercially production-ready.

Current capabilities include:

- Browse and search an exercise library.
- Create workouts and organize exercises into workout sections.
- Start/resume workout sessions.
- Log reps and weight per set and mark sets complete.
- Track workout progress and use a rest timer.
- Install the application as a PWA on supported browsers.
- Cache the application shell for offline navigation.

## Technology

- Angular 22
- TypeScript 6
- RxJS
- Tailwind CSS 4
- Vitest
- pnpm
- GitHub Actions / GitHub Pages

## Requirements

- Node.js 22.x
- pnpm 11.9.0

## Local development

```bash
pnpm install
pnpm start
```

The development server is available at `http://localhost:4200/` by default.

## Quality checks

Run the unit tests:

```bash
pnpm test
```

Run a production build:

```bash
pnpm build
```

The `staging` branch runs both checks through `.github/workflows/quality.yml` on every push. Pull requests targeting `main` or `staging` run the same quality workflow.

> There is currently no configured end-to-end test runner. Do not use `ng e2e` as a release check until an E2E framework and critical user journeys are added.

## PWA

The application includes a web app manifest, 192x192 and 512x512 PNG icons, an SVG fallback icon, and a service worker for application-shell/offline caching.

GitHub Pages deployment is performed from `main` by `.github/workflows/deploy-pages.yml`. The deployment workflow runs unit tests before building and publishing the application and creates a `404.html` SPA fallback for direct route navigation.

Live application:

https://sadeghsourcecode.github.io/gym-activity-tracker/

## Persistence

Workout and rest-day records are currently persisted in browser `localStorage`. This is suitable for the current MVP but is **not** sufficient as the only source of truth for a commercial product: clearing browser data, changing devices, or losing local storage can remove user history.

Before commercial launch, introduce authenticated server-side persistence and cross-device synchronization. Offline-first local storage can remain as a cache/queue, with explicit conflict handling and recovery behavior.

## Commercial-readiness checklist

The highest-priority work before treating the product as production-ready is:

- Authentication and server-side workout persistence.
- Cross-device synchronization, backup, and recovery.
- Data export and account/data deletion controls.
- End-to-end coverage for the critical `Plan -> Start -> Log -> Finish` journey.
- Automated accessibility checks plus keyboard/screen-reader validation.
- Error reporting, performance monitoring, and privacy-aware product analytics.
- Reduce the exercise-library cold-start payload; the current catalog is large for mobile first load.
- Verify redistribution/commercial-use licenses for exercise data, images, and animations.
- Separate staging and production release environments as the deployment model grows.
- Protect release branches and require passing quality checks before merge.

## Repository conventions

Follow [`AGENTS.md`](./AGENTS.md) for project architecture and implementation conventions. Keep feature business logic in feature data-access/services and keep reusable/presentational components focused on inputs and outputs.

## Release flow

Use `staging` for integration and validation. Merge reviewed, green changes to `main` to trigger the GitHub Pages production deployment.
