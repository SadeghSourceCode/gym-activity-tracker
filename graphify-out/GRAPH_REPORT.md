# Graph Report - gym-activity-tracker  (2026-08-21)

## Corpus Check
- 111 files · ~1,924,480 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 673 nodes · 1383 edges · 28 communities (21 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4c2bb9b5`
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
- typescript
- nearby-gyms.component.ts

## God Nodes (most connected - your core abstractions)
1. `AddWorkoutComponent` - 43 edges
2. `Exercise` - 41 edges
3. `Workout` - 38 edges
4. `WorkoutExerciseSummary` - 33 edges
5. `WorkoutPage` - 31 edges
6. `WorkoutDetailPage` - 26 edges
7. `ExerciseLibraryService` - 25 edges
8. `AddWorkoutService` - 25 edges
9. `WorkoutExerciseSection` - 21 edges
10. `AppButton` - 20 edges

## Surprising Connections (you probably didn't know these)
- `WorkoutExerciseSummary` --references--> `ExerciseTrackingType`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-storage.models.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `ExerciseCacheRecord` --references--> `Exercise`  [EXTRACTED]
  src/app/features/exercise-library/data-access/services/exercise-library.service.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `WorkoutDetailConfig` --references--> `Exercise`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-detail-config.interface.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `WorkoutExerciseAddedOutput` --references--> `Exercise`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-detail-output.interface.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `WorkoutExerciseReplacedOutput` --references--> `Exercise`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-detail-output.interface.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts

## Import Cycles
- None detected.

## Communities (28 total, 7 thin omitted)

### Community 0 - "Exercise"
Cohesion: 0.06
Nodes (31): Exercise, ExerciseDifficulty, ExerciseLicense, ExerciseMediaAsset, ExerciseMediaKind, ExerciseMediaRole, ExerciseProvenance, ExerciseSearchQuery (+23 more)

### Community 1 - "selected-day-panel.component.ts"
Cohesion: 0.06
Nodes (28): AppBar, Component, AppButton, Component, AppHeader, Component, AppBarConfig, AppButtonConfig (+20 more)

### Community 3 - "workout-page.ts"
Cohesion: 0.08
Nodes (28): HomeService, Injectable, CalendarDay, WorkoutCalendarConfig, WorkoutDashboardDaySummary, WorkoutDashboardSummary, Workout, WorkoutRecurrence (+20 more)

### Community 4 - "gym-activity-tracker"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 5 - "ProfilePreferencesService"
Cohesion: 0.10
Nodes (12): I18nService, TranslationKey, translations, Injectable, AppLanguage, AppTheme, UserProfile, defaultProfile (+4 more)

### Community 6 - "add-workout.component.ts"
Cohesion: 0.10
Nodes (22): AddWorkoutHeaderComponent, Component, Component, WorkoutPlanningStepComponent, AddWorkoutHeaderConfig, AddWorkoutStep, WorkoutPlanningChangedOutput, WorkoutPlanningExerciseConfig (+14 more)

### Community 7 - "WorkoutPage"
Cohesion: 0.11
Nodes (3): Component, WorkoutPage, WorkoutRoutes

### Community 8 - "HomePageComponent"
Cohesion: 0.14
Nodes (6): AddWorkoutSaveConfig, WorkoutExerciseSummary, WorkoutSet, AddWorkoutService, LegacyWorkoutSet, Injectable

### Community 9 - "WorkoutDetailPage"
Cohesion: 0.14
Nodes (12): Component, UpcomingWorkoutsComponent, Component, WeeklyActivityComponent, UpcomingWorkoutConfig, UpcomingWorkoutExerciseConfig, UpcomingWorkoutItemConfig, UpcomingWorkoutSelectedOutput (+4 more)

### Community 10 - "devDependencies"
Cohesion: 0.12
Nodes (17): @angular/build, @angular/compiler-cli, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli, jsdom (+9 more)

### Community 11 - "dependencies"
Cohesion: 0.12
Nodes (17): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/router, @fortawesome/fontawesome-free, dependencies, @angular/common (+9 more)

### Community 12 - "WorkoutCalendarComponent"
Cohesion: 0.18
Nodes (3): Component, ViewChild, WorkoutCalendarComponent

### Community 13 - "App"
Cohesion: 0.18
Nodes (5): App, BottomNavItem, appConfig, routes, Component

### Community 14 - "WorkoutDetailComponent"
Cohesion: 0.14
Nodes (9): Component, WorkoutDetailComponent, WorkoutDetailConfig, WorkoutDetailTextConfig, WorkoutExerciseAddedOutput, WorkoutExerciseOutput, WorkoutExerciseReplacedOutput, WorkoutSetUpdatedOutput (+1 more)

### Community 15 - "app-button.ts"
Cohesion: 0.09
Nodes (27): DailyProgressComponent, Component, Component, WeeklyCaloriesComponent, Component, WorkoutOverviewComponent, DailyProgressConfig, DailyProgressMetricConfig (+19 more)

### Community 16 - "Workout"
Cohesion: 0.11
Nodes (12): HostListener, WorkoutSessionStatus, Component, WorkoutDetailPage, placement(), finishWorkoutSession(), getWorkoutProgressPercent(), getWorkoutSessionProgress() (+4 more)

### Community 17 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, build:github-pages, ng, start, test, watch

### Community 18 - "package.json"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

### Community 24 - "AGENTS.md"
Cohesion: 0.04
Nodes (43): Behavior Preservation, Component Config, Component Config Rule, Component Contract Location, Component Extraction Rules, Component Outputs, Config Optionality, `Create feature: <path>` (+35 more)

### Community 25 - "GymActivityTracker"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, GymActivityTracker, Running end-to-end tests, Running unit tests

### Community 27 - "nearby-gyms.component.ts"
Cohesion: 0.40
Nodes (4): NearbyGymsComponent, Component, NearbyGymConfig, NearbyGymsConfig

## Knowledge Gaps
- **138 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AddWorkoutComponent` connect `AddWorkoutComponent` to `workout-page.ts`, `add-workout.component.ts`, `WorkoutPage`, `HomePageComponent`, `WorkoutDetailComponent`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `Exercise` connect `Exercise` to `AddWorkoutComponent`, `add-workout.component.ts`, `WorkoutPage`, `HomePageComponent`, `WorkoutDetailComponent`, `app-button.ts`, `Workout`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `AppButton` connect `selected-day-panel.component.ts` to `Exercise`, `workout-page.ts`, `add-workout.component.ts`, `WorkoutDetailPage`, `App`, `WorkoutDetailComponent`, `Workout`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Exercise` be split into smaller, more focused modules?**
  _Cohesion score 0.056265984654731455 - nodes in this community are weakly interconnected._
- **Should `selected-day-panel.component.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061016949152542375 - nodes in this community are weakly interconnected._
- **Should `AddWorkoutComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.08712121212121213 - nodes in this community are weakly interconnected._