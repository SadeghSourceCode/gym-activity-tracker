# AGENTS.md

This file defines the architectural, component, and coding conventions that Codex must follow when working in this repository.

These rules are the default source of truth for feature creation, feature refactoring, and architectural decisions unless the user explicitly requests otherwise.

---

# Project Structure

The project must preserve the following general structure:

```text
src/
└── app/
    ├── components/
    │
    ├── core/
    │
    ├── data-access/
    │   ├── models/
    │   ├── utils/
    │   └── services/
    │
    └── features/
        └── <feature-name>/
            ├── components/
            ├── data-access/
            └── features/
                └── ...
```

## Directory Responsibilities

### `src/app/components/`

Contains shared presentational components that are genuinely reusable across multiple application features.

Do not place feature-specific components here.

---

### `src/app/core/`

Contains application-wide infrastructure and singleton concerns.

Do not place feature-specific business logic here.

---

### `src/app/data-access/`

Contains application-level shared data-access concerns.

Examples:

- shared models
- shared utilities
- shared services

Only place something here when it is genuinely shared across application features.

---

### `src/app/features/<feature-name>/`

Contains everything owned by a specific business feature.

Prefer keeping code inside the feature that owns it.

---

### `src/app/features/<feature-name>/components/`

Contains dummy/presentational components owned by that feature.

These components should primarily:

- render data
- receive configuration
- handle local presentation behavior
- emit user interactions

They should not own feature orchestration or business logic.

---

### `src/app/features/<feature-name>/data-access/`

Contains feature-specific:

- services
- models
- API access
- state/data utilities
- data transformations
- related data-access concerns

---

### `src/app/features/<feature-name>/features/`

Contains nested feature/container/page-level functionality belonging to the parent feature.

---

# Locality Rule

Keep code as close as possible to the feature that owns it.

Prefer:

```text
src/app/features/workout/components/workout-card/
```

over:

```text
src/app/components/workout-card/
```

when `workout-card` is only used by the workout feature.

Do not promote something to a global/shared directory because it might theoretically be reused in the future.

Move it to a shared location only when:

- it is actually reused across multiple features, or
- it clearly represents an application-wide concern.

## Interface Icons

Font Awesome Free is the canonical interface icon set and is loaded locally from the npm
package in `src/styles.css`. Use its `fa-solid` or `fa-regular` font classes together with the
shared `app-icon` class. Icons that are purely decorative must have `aria-hidden="true"`;
icon-only controls must keep a localized accessible label through `AppButton` configuration.

Do not introduce handwritten SVGs, Unicode symbols, emoji, or a second icon library for
ordinary interface actions. SVG remains appropriate for data visualizations such as charts
and progress rings where the geometry represents application data rather than an icon.

---

# Exercise Library Domain

The canonical exercise catalog is owned by:

```text
src/app/features/exercise-library/
```

Use `Exercise` from `exercise-library/data-access/models/exercise.models.ts` and
access catalog data through `ExerciseLibraryService`. Do not introduce provider-
specific exercise types into workout, search, or UI code.

`Exercise` is a reusable catalog entity. It must remain independent from workout
placement. In particular, `warmup`, `main`, and `cooldown` are values of
`WorkoutExerciseSection` and belong to `WorkoutExerciseSummary`; never add a
`section` property to `Exercise` or filter the exercise catalog by section.

Every imported exercise must retain stable provenance through `source`,
`sourceId`, `license`, and `provenance`. Media must use the typed `media` asset
contract so image, animation, and future video variants can carry role, format,
dimensions, poster, alt text, and attribution metadata. New sources must be
adapted into the canonical domain rather than changing consumers to match the
source schema.

Keep identifiers globally stable by namespacing imported IDs with their source.
Legacy workout records may still contain the original un-namespaced `sourceId`,
so catalog lookup must preserve that read compatibility while persisted records
migrate naturally.

## Workout Plan Domain

`WorkoutPlan` is the persisted planning aggregate (`Workout` is its compatibility
alias). New records use `schemaVersion: 2`. A `WorkoutExerciseSummary` represents
an exercise placement: `id` identifies that placement, while `exerciseId`
references the canonical Exercise Library entity. Keep `order` and `section`
explicit and required; array position is not the domain contract.

Sets use tracking-aware optional values (`reps`, `weightKg`, `durationSeconds`,
`distanceMeters`, and `assistanceWeightKg`). UI may expose only reps and weight
for now, but new code must not restore the legacy `repeat`/`weight` fields.

Recurring plans use the explicit `WorkoutRecurrence` contract. Plan V1 weekly
recurrence is four occurrences, including the original scheduled workout.
`isWeeklyPlan` exists only for reading legacy localStorage records and must not be
written by new flows.

## Plan Builder V2

The Add Workout flow starts in the `main` section with an unfiltered exercise
search. Search is the primary discovery interaction; muscle choices are optional
quick filters. Warm-up and cool-down are optional placements selected after or
alongside the main workout.

Search results only add or remove an exercise. Set configuration and ordering
belong to the separate selected-exercises area. Reordering must update every
placement's explicit `order`. The review step does not ask for the date again;
the date comes from the calendar/route context. Empty titles are auto-generated
from the unique main-workout muscle groups, with a full-body fallback when more
than two groups are present.

## Workout Session / Train Domain

Training execution state belongs to the persisted `WorkoutPlan.session` contract. A planned
workout has no session; starting it creates an `active` session with ISO timestamps. Active
sessions must survive reloads, and every set mutation refreshes `lastUpdatedAt`. Finishing a
session records its terminal status, completion time, and duration while keeping the legacy
`completionStatus` synchronized for calendar compatibility.

Only an active session may mutate logged set values. Set completion is explicit and carries a
`completedAt` timestamp. Keep session transitions in the pure utilities under
`workout/utils/workout-session.util.ts`; presentational components emit intent and must not
own persistence or session business rules.

Local persistence failures must be visible to the user. Do not navigate away after a failed
terminal save because that can hide unsaved workout results.

---

# Dummy / Presentational Components

When implementing or refactoring features, prefer extracting meaningful UI responsibilities into dummy/presentational components.

A dummy component should:

- focus on presentation
- receive the data it needs through inputs
- expose user interactions through explicit outputs
- avoid fetching application data directly
- avoid direct service dependencies unless strongly justified
- avoid feature orchestration
- avoid business logic
- avoid owning application state
- remain easy to understand and test independently

The parent/container/feature layer should be responsible for:

- obtaining data
- calling services
- state management
- business rules
- orchestration
- navigation when appropriate
- transforming domain/application data into component configs
- handling outputs emitted by dummy components

---

# Component Extraction Rules

Do not extract components merely to reduce the number of lines in a template.

A component must represent a meaningful UI responsibility or concept.

Good candidates include:

- cards
- list items
- headers
- summaries
- filters
- action sections
- status sections
- empty states
- repeated UI blocks
- complex template sections
- independently understandable UI areas
- UI sections with their own interaction behavior

Before extracting a component, ask:

1. Does this section have a clear UI responsibility?
2. Can its required data be represented cleanly by a config?
3. Does it have clear inputs and outputs?
4. Can it remain mostly unaware of application/business concerns?
5. Does extracting it make the parent easier to understand?

If the answer is generally yes, prefer extraction.

Do not create meaningless micro-components for trivial markup.

Prefer a small number of meaningful components over many tiny components.

---

# Component Config

Dummy/presentational components should receive their presentation data through a single explicit `config` input instead of many unrelated inputs.

Prefer:

```ts
readonly config = input.required<MyComponentConfig>();
```

or the equivalent Angular API already used by the project.

The config must have an explicit TypeScript interface.

Example:

```ts
export interface WorkoutCardConfig {
  title?: string;
  exerciseCount?: number;
  status?: WorkoutStatus;
  disabled?: boolean;
}
```

## Config Optionality

Config properties should be optional whenever the component can reasonably:

- operate without the value, or
- provide a safe default.

Example:

```ts
export interface WorkoutCardConfig {
  title?: string;
  loading?: boolean;
  disabled?: boolean;
}
```

Do not make every property optional blindly.

If the component cannot function correctly or meaningfully without a value, that property must remain required.

Example:

```ts
export interface WorkoutCardConfig {
  workoutId: string;

  title?: string;
  disabled?: boolean;
}
```

Use sensible defaults inside the component when appropriate.

Avoid `any` for config properties.

---

# Component Outputs

Every component output must be:

- explicit
- semantically named
- strongly typed
- easy for the consuming component to understand

For simple values, use the concrete type directly.

Example:

```ts
readonly selectedId = output<string>();
```

For structured outputs, create a dedicated interface.

Example:

```ts
export interface ExerciseSelectedOutput {
  exerciseId: string;
  index: number;
}
```

Then:

```ts
readonly exerciseSelected = output<ExerciseSelectedOutput>();
```

Avoid ambiguous output types such as:

```ts
output<any>();
output<object>();
output<unknown>();
```

when the output structure is known.

Output names should describe the action that occurred.

Prefer:

```ts
exerciseSelected;
workoutDeleted;
dateChanged;
filterChanged;
```

over generic names such as:

```ts
change;
action;
event;
data;
result;
```

---

# Service Layer Rules

Feature business logic should be separated from UI components and placed in the feature's `data-access` layer when appropriate.

A feature may contain up to two service layers depending on its responsibilities:

```text
<feature>.api.service.ts
<feature>.service.ts
```

Both services must be located inside the feature's own `data-access` directory.

Example:

```text
src/app/features/workout/
├── components/
├── data-access/
│   ├── workout.api.service.ts
│   ├── workout.service.ts
│   └── models/
└── features/
```

## `<feature>.api.service.ts`

Use this service only when the feature communicates with an external API.

Its responsibility should be limited primarily to API communication.

Examples:

- HTTP requests
- API endpoint interaction
- API request/response handling
- mapping low-level API transport concerns when necessary

Example:

```ts
@Injectable()
export class WorkoutApiService {
  private readonly http = inject(HttpClient);

  getWorkouts() {
    return this.http.get<WorkoutResponse[]>('/api/workouts');
  }
}
```

Do not place UI behavior or component-specific logic inside the API service.

---

## `<feature>.service.ts`

Use this service for feature-level logic and orchestration that should not live inside components.

Typical responsibilities include:

- business logic
- feature orchestration
- data transformation
- state-related operations
- preparing or processing component data
- combining multiple data sources
- manipulating feature models
- coordinating API service calls
- reusable feature logic
- non-trivial decision logic

Example:

```ts
@Injectable()
export class WorkoutService {
  private readonly workoutApiService = inject(WorkoutApiService);

  getActiveWorkouts() {
    return this.workoutApiService
      .getWorkouts()
      .pipe(map((workouts) => workouts.filter((workout) => workout.active)));
  }
}
```

The API service handles communication.

The feature service handles feature behavior and logic.

---

# Service Extraction During Refactoring

These service extraction rules are especially important when using:

```text
Refactor feature: <path>
```

When refactoring an existing feature, inspect the component classes carefully for logic that should not remain inside UI components.

Move appropriate logic into:

```text
<feature>.service.ts
```

This applies especially to logic such as:

- data transformation
- filtering
- mapping
- sorting
- business decisions
- calculations
- orchestration
- reusable feature operations
- complex state manipulation
- API workflow coordination
- logic that does not directly belong to rendering or UI interaction

For example, avoid leaving code like this inside a component:

```ts
readonly visibleWorkouts = computed(() => {
  return this.workouts()
    .filter(workout => workout.active)
    .sort((a, b) => a.order - b.order)
    .map(workout => ({
      ...workout,
      title: workout.title.trim(),
    }));
});
```

When this represents feature logic rather than presentation behavior, prefer moving it into the feature service:

```ts
@Injectable()
export class WorkoutService {
  prepareVisibleWorkouts(workouts: Workout[]): Workout[] {
    return workouts
      .filter((workout) => workout.active)
      .sort((a, b) => a.order - b.order)
      .map((workout) => ({
        ...workout,
        title: workout.title.trim(),
      }));
  }
}
```

The component should then primarily coordinate the UI:

```ts
readonly visibleWorkouts = computed(() =>
  this.workoutService.prepareVisibleWorkouts(this.workouts())
);
```

---

# What Can Stay Inside Components

Do not move every function into a service blindly.

Component functions may remain inside the component when they are directly related to presentation or local UI behavior.

Examples:

- opening or closing a local UI section
- toggling a UI-only state
- handling a DOM-related interaction
- formatting purely presentational state
- emitting a component output
- handling local component interaction
- simple event forwarding

Example:

```ts
onWorkoutClick(workoutId: string): void {
  this.workoutSelected.emit({ workoutId });
}
```

This belongs to the component.

However:

```ts
calculateWorkoutProgress(...)
determineWorkoutStatus(...)
prepareWorkoutRequest(...)
filterAvailableExercises(...)
mapWorkoutResponse(...)
```

should generally be considered candidates for the feature service.

---

# Refactor Service Decision

During `Refactor feature`, inspect every non-trivial component method and determine whether it belongs to:

1. presentation/component responsibility
2. feature service responsibility
3. API service responsibility

Use the following rule:

```text
UI behavior
→ component

Feature/business logic
→ <feature>.service.ts

HTTP/API communication
→ <feature>.api.service.ts
```

Do not create `<feature>.api.service.ts` if the feature has no API communication.

Do not create services solely to satisfy a directory structure.

---

# Service Rules During Feature Creation

The strict service-extraction rule applies primarily to refactoring existing features.

When using:

```text
Create feature: <path>
```

do not over-engineer the initial implementation by automatically extracting every small piece of logic into a service.

A new feature may start with logic inside its container when that logic is:

- small
- straightforward
- feature-local
- not reusable
- unlikely to make the component difficult to understand

However, API communication should still remain outside UI components when practical.

As the feature grows or is later refactored, move meaningful feature logic into `<feature>.service.ts`.

Prefer architectural simplicity during initial feature creation and stronger separation during dedicated refactoring.

---

# Component Contract Location

Component contracts must not be stored beside the component implementation.

Interfaces, types, and other contracts associated with a feature component must be placed inside the feature's `data-access` layer.

Do not use:

```text
features/workout/components/workout-card/
├── workout-card.component.ts
├── workout-card.component.html
├── workout-card.component.scss
├── workout-card-config.interface.ts
└── workout-card-output.interface.ts
```

Instead prefer:

```text
features/workout/
├── components/
│   └── workout-card/
│       ├── workout-card.component.ts
│       ├── workout-card.component.html
│       └── workout-card.component.scss
│
└── data-access/
    └── models/
        ├── workout-card-config.interface.ts
        └── workout-card-output.interface.ts
```

Component-related interfaces belong to:

```text
<feature>/data-access/models/
```

This includes:

- component config interfaces
- component output interfaces
- feature models
- feature data contracts

Example:

```text
src/app/features/workout/
├── components/
│   └── workout-card/
│
└── data-access/
    └── models/
        ├── workout-card-config.interface.ts
        ├── workout-card-selected-output.interface.ts
        ├── workout.interface.ts
        └── workout-status.type.ts
```

Do not place TypeScript contract files directly beside component files.

---

# Component Config Rule

Presentational components should still receive their input through an explicit config contract.

Example:

```ts
import { WorkoutCardConfig } from '../../data-access/models/workout-card-config.interface';

export class WorkoutCardComponent {
  readonly config = input.required<WorkoutCardConfig>();
}
```

The config interface itself must live inside the feature's `data-access/models` directory.

Example:

```ts
export interface WorkoutCardConfig {
  workoutId: string;
  title?: string;
  exerciseCount?: number;
  disabled?: boolean;
}
```

The same rule applies to structured outputs:

```ts
export interface WorkoutCardSelectedOutput {
  workoutId: string;
}
```

---

# Updated Refactor Feature Behavior

When the command

```text
Refactor feature: <path>
```

is used, perform all existing refactoring rules plus the following steps:

1. Read `AGENTS.md`.
2. Inspect the entire feature.
3. Identify meaningful presentational component boundaries.
4. Extract appropriate dummy/presentational components.
5. Inspect component methods and logic.
6. Classify logic into:

   - UI logic
   - feature/business logic
   - API communication

7. Keep UI logic inside components.
8. Move feature/business logic into `<feature>.service.ts`.
9. Move API communication into `<feature>.api.service.ts` when the feature uses an API.
10. Create these services inside the feature's `data-access` directory.
11. Do not create an API service when no API communication exists.
12. Move component config/output interfaces into the feature's `data-access/models` directory.
13. Do not keep component contract files beside components.
14. Update all imports after moving contracts.
15. Preserve existing behavior.
16. Avoid unnecessary service extraction and over-componentization.
17. Remove obsolete logic and imports from components.
18. Run the relevant lint, type-check, tests, and build commands.
19. Summarize component extraction, service extraction, and moved contracts after completion.

---

# Refactor Responsibility Matrix

Use this responsibility model during feature refactoring:

| Responsibility             | Location                    |
| -------------------------- | --------------------------- |
| Rendering                  | Component                   |
| Local UI interaction       | Component                   |
| Emit user actions          | Component                   |
| Component configuration    | `data-access/models`        |
| Component output contracts | `data-access/models`        |
| Feature models             | `data-access/models`        |
| Business logic             | `<feature>.service.ts`      |
| Data transformation        | `<feature>.service.ts`      |
| Feature orchestration      | `<feature>.service.ts`      |
| API workflow coordination  | `<feature>.service.ts`      |
| HTTP/API requests          | `<feature>.api.service.ts`  |
| Shared application logic   | Appropriate app-level layer |

The desired dependency direction is conceptually:

```text
Container / Feature
        │
        ├── Feature Service
        │       │
        │       └── API Service
        │
        └── Presentational Components
                │
                ├── Config
                └── Outputs
```

Presentational components should not directly depend on the API service.

Prefer that API workflows pass through the feature service when feature-level behavior or transformation is involved.

---

# File Naming Conventions

Use explicit file suffixes consistently.

Interfaces:

```text
*.interface.ts
```

Examples:

```text
workout-card-config.interface.ts
workout-card-output.interface.ts
exercise.interface.ts
```

Types:

```text
*.type.ts
```

Examples:

```text
workout-status.type.ts
exercise-category.type.ts
```

Constants:

```text
*.const.ts
```

Examples:

```text
workout-status.const.ts
exercise.const.ts
```

Avoid generic filenames such as:

```text
interfaces.ts
types.ts
constants.ts
models.ts
```

when the file represents a specific concept.

The filename should clearly communicate the domain or component concept it contains.

---

# Feature Implementation

Whenever implementing a new feature:

1. Determine which business feature owns it.
2. Inspect existing project patterns before introducing new architecture.
3. Identify meaningful UI responsibilities.
4. Extract appropriate dummy/presentational components.
5. Place feature-specific components inside the feature's `components/` directory.
6. Define explicit config contracts.
7. Define explicit output contracts.
8. Keep orchestration and business logic in the feature/container layer.
9. Follow project naming conventions.
10. Avoid unnecessary abstractions.
11. Preserve the architecture defined in this file.

---

# Feature Refactoring

When refactoring an existing feature:

1. Inspect the entire target feature before changing code.
2. Understand its current responsibilities and data flow.
3. Identify meaningful UI sections that can become presentational components.
4. Extract those sections when doing so improves architecture.
5. Preserve existing behavior.
6. Keep business logic and orchestration in the parent/container.
7. Use strongly typed configs and outputs.
8. Respect component locality.
9. Remove obsolete code and imports created by the refactoring.
10. Avoid over-componentization.

Refactoring should improve:

- separation of concerns
- readability
- maintainability
- testability

It should not introduce abstraction merely for abstraction's sake.

---

# Behavior Preservation

Architectural refactoring must not intentionally change existing application behavior.

Preserve:

- user flows
- API interactions
- state behavior
- validations
- routing behavior
- loading behavior
- error handling
- analytics/tracking
- permissions
- existing UI behavior

If an unrelated bug or architectural problem is discovered, do not silently change it.

Report it separately unless fixing it is necessary for the requested task.

---

# Validation After Changes

After implementing or refactoring a feature:

1. Review all changed files.
2. Verify compliance with this `AGENTS.md`.
3. Verify component boundaries.
4. Ensure business logic has not leaked into presentational components.
5. Verify configs are strongly typed.
6. Verify outputs are strongly typed.
7. Verify files follow naming conventions.
8. Verify components are in the correct directories.
9. Remove unused imports and obsolete code.
10. Run relevant formatting, linting, type-checking, tests, and build commands available for the affected project.

Do not fix unrelated failures unless they were introduced by the current changes.

Report unrelated failures separately.

---

# Shorthand Commands

The following commands are repository-level shorthand instructions.

When one of these commands is used, do not require the user to repeat the architectural rules from this file.

Read and follow this entire `AGENTS.md` automatically.

---

## `Refactor feature: <path>`

Example:

```text
Refactor feature: src/app/features/workout/features/workout-planner
```

Interpret this command as:

1. Read this `AGENTS.md`.
2. Inspect the entire feature at `<path>`.
3. Understand its existing architecture, responsibilities, template, state, interactions, and data flow.
4. Identify meaningful UI sections that should become dummy/presentational components.
5. Extract those components when doing so improves separation of concerns, readability, maintainability, or testability.
6. Follow all config, output, locality, naming, and component rules defined in this file.
7. Keep business logic, state management, services, orchestration, API access, and data transformations outside dummy components.
8. Preserve existing behavior.
9. Avoid over-componentization.
10. Remove obsolete code created by the refactoring.
11. Run relevant validation commands.
12. Summarize the architectural changes after completion.

Do not require additional instructions unless an architectural decision is genuinely ambiguous or potentially destructive.

---

## `Create feature: <path>`

Example:

```text
Create feature: src/app/features/workout-history
```

Interpret this command as:

1. Read this `AGENTS.md`.
2. Inspect surrounding features and existing project conventions.
3. Create the requested feature according to this architecture.
4. Identify appropriate container and presentational responsibilities.
5. Create meaningful dummy/presentational components.
6. Use strongly typed config interfaces.
7. Use strongly typed outputs.
8. Follow locality rules.
9. Follow file naming conventions.
10. Keep business logic and orchestration outside presentational components.
11. Avoid unnecessary abstractions.
12. Run relevant validation commands.

If requirements for the actual business behavior are missing, ask for those requirements before inventing product behavior.

---

## `Review feature: <path>`

Example:

```text
Review feature: src/app/features/calendar
```

This command is read-only unless the user explicitly requests implementation.

Interpret it as:

1. Read this `AGENTS.md`.
2. Inspect the entire feature.
3. Compare the implementation against the architectural rules defined here.
4. Identify component-boundary problems.
5. Identify business logic inside presentational components.
6. Identify components that should potentially be extracted.
7. Identify unnecessary components or over-componentization.
8. Review config and output contracts.
9. Review file naming.
10. Review directory placement.
11. Review locality and shared-component decisions.
12. Identify unnecessary coupling.
13. Report findings ordered by architectural impact.

Do not modify code.

Provide concrete file references and recommended changes.

---

## `Refactor component: <path>`

Example:

```text
Refactor component: src/app/features/workout/components/workout-card
```

Interpret this command as:

1. Read this `AGENTS.md`.
2. Inspect the target component and its consumers.
3. Refactor it according to the presentational component rules.
4. Introduce or improve its config contract when appropriate.
5. Make outputs explicit and strongly typed.
6. Move business logic or orchestration to the appropriate owner when necessary.
7. Preserve existing behavior.
8. Follow naming and locality conventions.
9. Update affected consumers.
10. Run relevant validation commands.

---

# General Codex Behavior

Before making architectural changes:

- inspect existing code first
- prefer existing project conventions when they do not conflict with this file
- do not guess existing APIs
- do not invent unnecessary abstractions
- avoid unrelated refactoring
- keep changes scoped to the requested feature
- preserve behavior unless explicitly asked to change it

When there are multiple valid architectural solutions, prefer the simplest solution that satisfies this file and the existing project architecture.
