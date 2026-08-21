# Graph Report - gym-activity-tracker  (2026-08-21)

## Corpus Check
- 105 files · ~1,921,922 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 634 nodes · 1279 edges · 26 communities (17 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7de962bd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Exercise
- selected-day-panel.component.ts
- AddWorkoutComponent
- workout-page.ts
- gym-activity-tracker
- ProfilePreferencesService
- add-workout.component.ts
- WorkoutPage
- HomePageComponent
- WorkoutDetailPage
- devDependencies
- dependencies
- WorkoutCalendarComponent
- App
- WorkoutDetailComponent
- app-button.ts
- Workout
- scripts
- package.json
- jsdom
- prettier
- home.routes.ts
- profile.routes.ts
- search.routes.ts
- AGENTS.md
- GymActivityTracker

## God Nodes (most connected - your core abstractions)
1. `AddWorkoutComponent` - 42 edges
2. `Exercise` - 39 edges
3. `Workout` - 34 edges
4. `WorkoutExerciseSummary` - 30 edges
5. `WorkoutPage` - 30 edges
6. `ExerciseLibraryService` - 25 edges
7. `AddWorkoutService` - 24 edges
8. `AppButton` - 20 edges
9. `WorkoutDetailComponent` - 20 edges
10. `WorkoutCalendarComponent` - 19 edges

## Surprising Connections (you probably didn't know these)
- `WorkoutExerciseSummary` --references--> `ExerciseTrackingType`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-storage.models.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `ExerciseCacheRecord` --references--> `Exercise`  [EXTRACTED]
  src/app/features/exercise-library/data-access/services/exercise-library.service.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `WorkoutDetailConfig` --references--> `Exercise`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-detail-config.interface.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `WorkoutExerciseReplacedOutput` --references--> `Exercise`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-detail-output.interface.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `WorkoutDetailComponent` --references--> `WorkoutExerciseSection`  [EXTRACTED]
  src/app/features/workout/components/workout-detail/workout-detail.component.ts → src/app/features/workout/data-access/models/workout-storage.models.ts

## Import Cycles
- None detected.

## Communities (26 total, 9 thin omitted)

### Community 0 - "Exercise"
Cohesion: 0.06
Nodes (31): Exercise, ExerciseDifficulty, ExerciseLicense, ExerciseMediaAsset, ExerciseMediaKind, ExerciseMediaRole, ExerciseProvenance, ExerciseSearchQuery (+23 more)

### Community 1 - "selected-day-panel.component.ts"
Cohesion: 0.07
Nodes (27): AppButton, Component, EmptyDayStateComponent, Component, RestDayStateComponent, Component, SelectedDayPanelComponent, Component (+19 more)

### Community 3 - "workout-page.ts"
Cohesion: 0.06
Nodes (46): I18nService, TranslationKey, translations, Injectable, NearbyGymsComponent, Component, Component, WeeklyActivityComponent (+38 more)

### Community 4 - "gym-activity-tracker"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 5 - "ProfilePreferencesService"
Cohesion: 0.13
Nodes (8): AppLanguage, AppTheme, UserProfile, defaultProfile, ProfilePreferencesService, Injectable, ProfilePageComponent, Component

### Community 6 - "add-workout.component.ts"
Cohesion: 0.12
Nodes (21): AddWorkoutHeaderComponent, Component, Component, WorkoutPlanningStepComponent, AddWorkoutHeaderConfig, AddWorkoutStep, WorkoutPlanningChangedOutput, WorkoutPlanningExerciseConfig (+13 more)

### Community 7 - "WorkoutPage"
Cohesion: 0.10
Nodes (3): Component, WorkoutPage, WorkoutRoutes

### Community 10 - "devDependencies"
Cohesion: 0.12
Nodes (17): @angular/build, @angular/compiler-cli, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli, postcss, tailwindcss (+9 more)

### Community 11 - "dependencies"
Cohesion: 0.12
Nodes (17): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, dependencies, @angular/common (+9 more)

### Community 12 - "WorkoutCalendarComponent"
Cohesion: 0.17
Nodes (3): Component, ViewChild, WorkoutCalendarComponent

### Community 13 - "App"
Cohesion: 0.18
Nodes (5): App, BottomNavItem, appConfig, routes, Component

### Community 15 - "app-button.ts"
Cohesion: 0.11
Nodes (16): AppBar, Component, AppHeader, Component, AppBarConfig, AppButtonConfig, AppButtonMode, AppButtonSize (+8 more)

### Community 16 - "Workout"
Cohesion: 0.09
Nodes (21): HomeService, Injectable, AddWorkoutSaveConfig, WorkoutDetailConfig, WorkoutDetailTextConfig, WorkoutCompletedOutput, WorkoutExerciseOutput, WorkoutExerciseReplacedOutput (+13 more)

### Community 17 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, build:github-pages, ng, start, test, watch

### Community 18 - "package.json"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

### Community 24 - "AGENTS.md"
Cohesion: 0.05
Nodes (39): Behavior Preservation, Component Config, Component Config Rule, Component Contract Location, Component Extraction Rules, Component Outputs, Config Optionality, `Create feature: <path>` (+31 more)

### Community 25 - "GymActivityTracker"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, GymActivityTracker, Running end-to-end tests, Running unit tests

## Knowledge Gaps
- **131 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AddWorkoutComponent` connect `AddWorkoutComponent` to `Workout`, `workout-page.ts`, `add-workout.component.ts`, `WorkoutPage`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Exercise` connect `Exercise` to `AddWorkoutComponent`, `workout-page.ts`, `add-workout.component.ts`, `WorkoutPage`, `WorkoutDetailPage`, `Workout`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `AppButton` connect `selected-day-panel.component.ts` to `Exercise`, `workout-page.ts`, `add-workout.component.ts`, `App`, `app-button.ts`, `Workout`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Exercise` be split into smaller, more focused modules?**
  _Cohesion score 0.056265984654731455 - nodes in this community are weakly interconnected._
- **Should `selected-day-panel.component.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07039187227866474 - nodes in this community are weakly interconnected._
- **Should `AddWorkoutComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.08412698412698413 - nodes in this community are weakly interconnected._