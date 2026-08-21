# Graph Report - .  (2026-08-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 579 nodes · 1218 edges · 24 communities (17 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84090924`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23

## God Nodes (most connected - your core abstractions)
1. `AddWorkoutComponent` - 42 edges
2. `Exercise` - 39 edges
3. `Workout` - 34 edges
4. `WorkoutPage` - 30 edges
5. `WorkoutExerciseSummary` - 28 edges
6. `ExerciseLibraryService` - 25 edges
7. `AddWorkoutService` - 22 edges
8. `AppButton` - 20 edges
9. `WorkoutDetailComponent` - 20 edges
10. `WorkoutCalendarComponent` - 19 edges

## Surprising Connections (you probably didn't know these)
- `ExerciseCacheRecord` --references--> `Exercise`  [EXTRACTED]
  src/app/features/exercise-library/data-access/services/exercise-library.service.ts → src/app/features/exercise-library/data-access/models/exercise.models.ts
- `WorkoutDetailComponent` --references--> `WorkoutExerciseSection`  [EXTRACTED]
  src/app/features/workout/components/workout-detail/workout-detail.component.ts → src/app/features/workout/data-access/models/workout-storage.models.ts
- `WorkoutCalendarConfig` --references--> `Workout`  [EXTRACTED]
  src/app/features/workout/data-access/models/workout-calendar-config.interface.ts → src/app/features/workout/data-access/models/workout-storage.models.ts
- `resolveWorkoutStatus()` --calls--> `compareDateKeys()`  [EXTRACTED]
  src/app/features/workout/utils/workout-status.util.ts → src/app/features/workout/utils/calendar-date.util.ts
- `AppButtonConfig` --references--> `AppButtonMode`  [EXTRACTED]
  src/app/data-access/models/app-button-config.interface.ts → src/app/data-access/models/app-button.type.ts

## Import Cycles
- None detected.

## Communities (24 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (39): Exercise, ExerciseDifficulty, ExerciseLicense, ExerciseMediaAsset, ExerciseMediaKind, ExerciseMediaRole, ExerciseProvenance, ExerciseSearchQuery (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (30): AppBar, Component, AppButton, Component, AppBarConfig, EmptyDayStateComponent, Component, RestDayStateComponent (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (7): AddWorkoutSaveConfig, WorkoutExerciseSection, WorkoutExerciseSummary, AddWorkoutService, Injectable, AddWorkoutComponent, Component

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (33): DailyProgressComponent, Component, Component, WeeklyCaloriesComponent, CalendarDay, Component, WorkoutOverviewComponent, DailyProgressConfig (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (12): I18nService, TranslationKey, translations, Injectable, AppLanguage, AppTheme, UserProfile, defaultProfile (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (21): AddWorkoutHeaderComponent, Component, Component, WorkoutPlanningStepComponent, AddWorkoutHeaderConfig, AddWorkoutStep, WorkoutPlanningChangedOutput, WorkoutPlanningExerciseConfig (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (3): Component, WorkoutPage, WorkoutRoutes

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (17): NearbyGymsComponent, Component, Component, UpcomingWorkoutsComponent, Component, WeeklyActivityComponent, NearbyGymConfig, NearbyGymsConfig (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (17): @angular/build, @angular/compiler-cli, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli, postcss, tailwindcss (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, dependencies, @angular/common (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (3): Component, ViewChild, WorkoutCalendarComponent

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (5): App, BottomNavItem, appConfig, routes, Component

### Community 15 - "Community 15"
Cohesion: 0.31
Nodes (8): AppHeader, Component, AppButtonConfig, AppButtonMode, AppButtonSize, AppButtonType, AppButtonVariant, AppHeaderConfig

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (3): SearchPageComponent, Component, ViewChild

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (7): scripts, build, build:github-pages, ng, start, test, watch

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

## Knowledge Gaps
- **90 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+85 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AddWorkoutComponent` connect `Community 2` to `Community 3`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Exercise` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 9`, `Community 16`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `AppButton` connect `Community 1` to `Community 0`, `Community 3`, `Community 6`, `Community 8`, `Community 13`, `Community 15`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _90 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.060939060939060936 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.059395801331285206 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.055299539170506916 - nodes in this community are weakly interconnected._