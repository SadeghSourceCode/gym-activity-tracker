# Graph Report - gym-activity-tracker  (2026-08-21)

## Corpus Check
- 109 files · ~1,923,235 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 652 nodes · 1329 edges · 26 communities (19 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f17f089`
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
1. `AddWorkoutComponent` - 43 edges
2. `Exercise` - 39 edges
3. `Workout` - 36 edges
4. `WorkoutExerciseSummary` - 33 edges
5. `WorkoutPage` - 30 edges
6. `ExerciseLibraryService` - 25 edges
7. `AddWorkoutService` - 25 edges
8. `AppButton` - 20 edges
9. `WorkoutDetailComponent` - 20 edges
10. `WorkoutDetailPage` - 20 edges

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

## Communities (26 total, 7 thin omitted)

### Community 0 - "Exercise"
Cohesion: 0.07
Nodes (28): Exercise, ExerciseDifficulty, ExerciseLicense, ExerciseMediaAsset, ExerciseMediaKind, ExerciseMediaRole, ExerciseProvenance, ExerciseSearchQuery (+20 more)

### Community 1 - "selected-day-panel.component.ts"
Cohesion: 0.06
Nodes (30): AppBar, Component, AppButton, Component, AppBarConfig, EmptyDayStateComponent, Component, RestDayStateComponent (+22 more)

### Community 3 - "workout-page.ts"
Cohesion: 0.07
Nodes (40): I18nService, TranslationKey, translations, Injectable, DailyProgressComponent, Component, Component, WeeklyCaloriesComponent (+32 more)

### Community 4 - "gym-activity-tracker"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 5 - "ProfilePreferencesService"
Cohesion: 0.13
Nodes (8): AppLanguage, AppTheme, UserProfile, defaultProfile, ProfilePreferencesService, Injectable, ProfilePageComponent, Component

### Community 6 - "add-workout.component.ts"
Cohesion: 0.10
Nodes (22): AddWorkoutHeaderComponent, Component, Component, WorkoutPlanningStepComponent, AddWorkoutHeaderConfig, AddWorkoutStep, WorkoutPlanningChangedOutput, WorkoutPlanningExerciseConfig (+14 more)

### Community 7 - "WorkoutPage"
Cohesion: 0.11
Nodes (3): Component, WorkoutPage, WorkoutRoutes

### Community 8 - "HomePageComponent"
Cohesion: 0.24
Nodes (3): SearchPageComponent, Component, ViewChild

### Community 9 - "WorkoutDetailPage"
Cohesion: 0.31
Nodes (8): AppHeader, Component, AppButtonConfig, AppButtonMode, AppButtonSize, AppButtonType, AppButtonVariant, AppHeaderConfig

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
Cohesion: 0.10
Nodes (17): NearbyGymsComponent, Component, Component, UpcomingWorkoutsComponent, Component, WeeklyActivityComponent, NearbyGymConfig, NearbyGymsConfig (+9 more)

### Community 16 - "Workout"
Cohesion: 0.07
Nodes (27): AddWorkoutSaveConfig, WorkoutDetailConfig, WorkoutDetailTextConfig, WorkoutCompletedOutput, WorkoutExerciseOutput, WorkoutExerciseReplacedOutput, WorkoutSetUpdatedOutput, WorkoutCompletionStatus (+19 more)

### Community 17 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, build:github-pages, ng, start, test, watch

### Community 18 - "package.json"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

### Community 24 - "AGENTS.md"
Cohesion: 0.05
Nodes (41): Behavior Preservation, Component Config, Component Config Rule, Component Contract Location, Component Extraction Rules, Component Outputs, Config Optionality, `Create feature: <path>` (+33 more)

### Community 25 - "GymActivityTracker"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, GymActivityTracker, Running end-to-end tests, Running unit tests

## Knowledge Gaps
- **135 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AddWorkoutComponent` connect `AddWorkoutComponent` to `Workout`, `workout-page.ts`, `add-workout.component.ts`, `WorkoutPage`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Exercise` connect `Exercise` to `selected-day-panel.component.ts`, `AddWorkoutComponent`, `workout-page.ts`, `add-workout.component.ts`, `WorkoutPage`, `HomePageComponent`, `Workout`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `AppButton` connect `selected-day-panel.component.ts` to `Exercise`, `workout-page.ts`, `add-workout.component.ts`, `WorkoutDetailPage`, `App`, `app-button.ts`, `Workout`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Exercise` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `selected-day-panel.component.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059395801331285206 - nodes in this community are weakly interconnected._
- **Should `AddWorkoutComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.08412698412698413 - nodes in this community are weakly interconnected._