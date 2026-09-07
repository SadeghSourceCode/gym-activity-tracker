# Graph Report - .  (2026-08-30)

## Corpus Check
- 100 files · ~1,924,738 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 702 nodes · 1409 edges · 38 communities (29 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Workout Progress UI
- Exercise Library Domain
- Workout Detail Contracts
- Shared Workout Components
- Plan Builder Steps
- Angular Build Configuration
- Home Dashboard Components
- Localization and Preferences
- Development Dependencies
- Workout Creation Service
- Workout Page Orchestration
- Runtime Dependencies
- Application Shell
- Shared Header and Buttons
- Workout Calendar UI
- Active Workout Interaction
- Workout Clipboard
- Architecture Conventions
- Project Documentation
- Arm Anatomy Assets
- Nearby Gyms
- Leg Anatomy Assets
- Back Anatomy Assets
- Navigation and Accessibility
- Home Dashboard Presentation
- Chest Anatomy Assets
- Core Anatomy Assets
- Forearm Anatomy Assets
- Shoulder Anatomy Assets
- GitHub Pages Deployment
- Lower Back Anatomy
- Home Routing
- Profile Routing
- Exercise Discovery UI
- Search Routing
- HTML Application Host
- Angular Component Metadata
- Angular View Queries

## God Nodes (most connected - your core abstractions)
1. `Workout` - 39 edges
2. `WorkoutPage` - 34 edges
3. `WorkoutExerciseSummary` - 30 edges
4. `Exercise` - 29 edges
5. `AddWorkoutService` - 28 edges
6. `WorkoutDetailPage` - 27 edges
7. `AddWorkoutComponent` - 26 edges
8. `ExerciseLibraryService` - 25 edges
9. `WorkoutCalendarComponent` - 23 edges
10. `WorkoutDetailComponent` - 21 edges

## Surprising Connections (you probably didn't know these)
- `WorkoutPage` --references--> `WeeklyCaloriesComponent`  [EXTRACTED]
  src/app/features/workout/features/workout-page/workout-page.ts → src/app/features/workout/components/weekly-calories/weekly-calories.component.html
- `WorkoutPage` --references--> `WorkoutOverviewComponent`  [EXTRACTED]
  src/app/features/workout/features/workout-page/workout-page.ts → src/app/features/workout/components/workout-overview/workout-overview.component.html
- `StatisticsPageComponent` --references--> `WorkoutCalendarComponent`  [EXTRACTED]
  src/app/features/workout/features/statistics/statistics-page.component.html → src/app/features/workout/components/workout-calendar/workout-calendar.component.ts
- `Daily Progress Rings` --conceptually_related_to--> `Workout Session Domain`  [INFERRED]
  src/app/features/workout/components/daily-progress/daily-progress.component.html → AGENTS.md
- `Root Destination Bottom Navigation` --conceptually_related_to--> `Shell Navigation`  [INFERRED]
  src/app/components/bottom-nav/bottom-nav.html → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Workout Planning and Execution Domain** — agents_workout_plan_domain, agents_plan_builder_v2, agents_workout_session_domain, agents_workout_calendar_state [EXTRACTED 1.00]
- **Home Dashboard Sections** — src_app_features_home_features_home_page_home_page_home_dashboard, src_app_features_home_components_upcoming_workouts_upcoming_workouts_component_upcoming_workout_collection, src_app_features_home_components_weekly_activity_weekly_activity_component_activity_chart [EXTRACTED 1.00]
- **Workout Dashboard Composition** — src_app_features_workout_features_workout_page_workout_page_workoutpage, src_app_features_workout_components_workout_calendar_workout_calendar_component_workoutcalendarcomponent, src_app_features_workout_components_selected_day_panel_selected_day_panel_component_selecteddaypanelcomponent, src_app_features_workout_components_workout_overview_workout_overview_component_workoutoverviewcomponent, src_app_features_workout_components_weekly_calories_weekly_calories_component_weeklycaloriescomponent [EXTRACTED 1.00]
- **Add Workout Two-Step Flow** — src_app_features_workout_features_add_workout_add_workout_component_addworkoutcomponent, src_app_features_workout_components_exercise_selection_step_exercise_selection_step_component_exerciseselectionstepcomponent, src_app_features_workout_components_workout_planning_step_workout_planning_step_component_workoutplanningstepcomponent [EXTRACTED 1.00]
- **Posterior Back Muscle Group** — src_assets_images_muscle_groups_back_trapezius, src_assets_images_muscle_groups_back_latissimus_dorsi, src_assets_images_muscle_groups_back_posterior_deltoids, src_assets_images_muscle_groups_back_spinal_extensors [EXTRACTED 1.00]
- **Chest Anatomy Front and Back Context** — src_assets_images_muscle_groups_chest_chest_muscle_group, src_assets_images_muscle_groups_chest_anterior_muscular_view, src_assets_images_muscle_groups_chest_posterior_muscular_view [EXTRACTED 1.00]
- **Forearm Anatomy Dual View** — src_assets_images_muscle_groups_forearms_forearm_muscle_group, src_assets_images_muscle_groups_forearms_anterior_upper_body_view, src_assets_images_muscle_groups_forearms_posterior_upper_body_view, src_assets_images_muscle_groups_forearms_bilateral_forearm_highlight [EXTRACTED 1.00]
- **Highlighted Leg Muscles** — src_assets_images_muscle_groups_legs_quadriceps, src_assets_images_muscle_groups_legs_hamstrings, src_assets_images_muscle_groups_legs_calves [EXTRACTED 1.00]
- **Shoulder Anatomy Views and Highlighted Deltoids** — src_assets_images_muscle_groups_shoulder_anterior_shoulders, src_assets_images_muscle_groups_shoulder_posterior_shoulders, src_assets_images_muscle_groups_shoulder_deltoid_muscles [EXTRACTED 1.00]
- **Triceps Anatomical Views** — src_assets_images_muscle_groups_tricept_anterior_view, src_assets_images_muscle_groups_tricept_posterior_view [EXTRACTED 1.00]

## Communities (38 total, 9 thin omitted)

### Community 0 - "Workout Progress UI"
Cohesion: 0.07
Nodes (39): DailyProgressComponent, Component, Component, WeeklyCaloriesComponent, CalendarDay, Component, WorkoutOverviewComponent, DailyProgressConfig (+31 more)

### Community 1 - "Exercise Library Domain"
Cohesion: 0.06
Nodes (31): Exercise, ExerciseDifficulty, ExerciseLicense, ExerciseMediaAsset, ExerciseMediaKind, ExerciseMediaRole, ExerciseProvenance, ExerciseSearchQuery (+23 more)

### Community 2 - "Workout Detail Contracts"
Cohesion: 0.07
Nodes (25): HostListener, WorkoutDetailConfig, WorkoutDetailTextConfig, WorkoutExerciseAddedOutput, WorkoutExerciseOutput, WorkoutExerciseReplacedOutput, WorkoutSetUpdatedOutput, WorkoutCompletionStatus (+17 more)

### Community 3 - "Shared Workout Components"
Cohesion: 0.07
Nodes (27): AppButton, Component, EmptyDayStateComponent, Component, RestDayStateComponent, Component, SelectedDayPanelComponent, Component (+19 more)

### Community 4 - "Plan Builder Steps"
Cohesion: 0.07
Nodes (15): ExerciseSelectionStepComponent, Component, Component, WorkoutPlanningStepComponent, ExerciseSelectionItemConfig, ExerciseSelectionMuscleConfig, ExerciseSelectionStepConfig, WorkoutPlanningChangedOutput (+7 more)

### Community 5 - "Angular Build Configuration"
Cohesion: 0.05
Nodes (42): build, serve, test, builder, configurations, defaultConfiguration, options, analytics (+34 more)

### Community 6 - "Home Dashboard Components"
Cohesion: 0.09
Nodes (21): TodayWorkoutEmptyStateComponent, Component, Component, UpcomingWorkoutCardComponent, Component, UpcomingWorkoutsComponent, Component, WeeklyActivityComponent (+13 more)

### Community 7 - "Localization and Preferences"
Cohesion: 0.10
Nodes (12): I18nService, TranslationKey, translations, Injectable, AppLanguage, AppTheme, UserProfile, defaultProfile (+4 more)

### Community 8 - "Development Dependencies"
Cohesion: 0.06
Nodes (32): @angular/build, @angular/cli, @angular/compiler-cli, jsdom, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+24 more)

### Community 9 - "Workout Creation Service"
Cohesion: 0.15
Nodes (6): AddWorkoutSaveConfig, Workout, WorkoutExerciseSummary, AddWorkoutService, LegacyWorkoutSet, Injectable

### Community 11 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): @angular/cdk, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, @fontsource-variable/roboto (+15 more)

### Community 12 - "Application Shell"
Cohesion: 0.18
Nodes (10): App, appConfig, routes, Component, BottomNav, Component, BottomNavConfig, BottomNavItemConfig (+2 more)

### Community 13 - "Shared Header and Buttons"
Cohesion: 0.18
Nodes (11): AppBar, Component, AppHeader, Component, AppBarConfig, AppButtonConfig, AppButtonMode, AppButtonSize (+3 more)

### Community 14 - "Workout Calendar UI"
Cohesion: 0.18
Nodes (3): Component, WorkoutCalendarComponent, ViewChild

### Community 16 - "Workout Clipboard"
Cohesion: 0.31
Nodes (11): CopiedWorkoutClipboard, clearCopiedWorkout(), CopiedWorkoutLoadResult, escapeField(), loadCopiedWorkout(), parseCopiedWorkoutText(), readCopiedWorkoutFromSystemClipboard(), saveCopiedWorkout() (+3 more)

### Community 17 - "Architecture Conventions"
Cohesion: 0.25
Nodes (8): Canonical Exercise Catalog, Feature Locality Rule, Plan Builder V2, Workout Calendar Day State, Workout Plan Domain, Workout Session Domain, Daily Progress Rings, Empty Day Planning Choices

### Community 18 - "Project Documentation"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, GymActivityTracker, Running end-to-end tests, Running unit tests

### Community 19 - "Arm Anatomy Assets"
Cohesion: 0.33
Nodes (7): Biceps Brachii, Biceps Muscle Group Illustration, Bilateral Anterior Upper Arm Target Area, Front and Back Anatomical Views, Anterior View, Posterior View, Upper Body Anatomy Reference

### Community 20 - "Nearby Gyms"
Cohesion: 0.40
Nodes (4): NearbyGymsComponent, Component, NearbyGymConfig, NearbyGymsConfig

### Community 21 - "Leg Anatomy Assets"
Cohesion: 0.40
Nodes (6): Anterior Leg View, Calves, Hamstrings, Leg Muscle Group Illustration, Posterior Leg View, Quadriceps

### Community 22 - "Back Anatomy Assets"
Cohesion: 0.40
Nodes (5): Latissimus Dorsi, Posterior Back Musculature, Posterior Deltoids, Spinal Extensors, Trapezius

### Community 23 - "Navigation and Accessibility"
Cohesion: 0.50
Nodes (4): Shell Navigation, Root Page Shell, Accessible Configurable Button, Root Destination Bottom Navigation

### Community 24 - "Home Dashboard Presentation"
Cohesion: 0.50
Nodes (4): Upcoming Workout Card, Upcoming Workout Collection, Weekly Activity Chart, Home Dashboard Composition

### Community 25 - "Chest Anatomy Assets"
Cohesion: 0.50
Nodes (4): Anterior Muscular View, Chest Muscle Group, Pectoralis Major, Posterior Muscular View

### Community 26 - "Core Anatomy Assets"
Cohesion: 0.67
Nodes (4): Anterior Anatomical View, Core and Abdominal Muscle Group, Posterior Anatomical View, Rectus Abdominis

### Community 27 - "Forearm Anatomy Assets"
Cohesion: 0.83
Nodes (4): Anterior Upper-Body View, Bilateral Forearm Highlight, Forearm Muscle Group, Posterior Upper-Body View

### Community 28 - "Shoulder Anatomy Assets"
Cohesion: 0.67
Nodes (4): Anterior Shoulders, Deltoid Muscles, Posterior Shoulders, Shoulder Muscle Group Illustration

### Community 29 - "GitHub Pages Deployment"
Cohesion: 1.00
Nodes (3): Build Job, Deploy Angular to GitHub Pages, Deploy Job

### Community 30 - "Lower Back Anatomy"
Cohesion: 0.67
Nodes (3): Front and Rear Anatomical Body Views, Lower Back Muscle Group, Posterior Lower Back Highlight

## Knowledge Gaps
- **131 isolated node(s):** `$schema`, `version`, `packageManager`, `analytics`, `newProjectRoot` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AddWorkoutComponent` connect `Plan Builder Steps` to `Workout Detail Contracts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `WorkoutPage` connect `Workout Page Orchestration` to `Workout Progress UI`, `Workout Detail Contracts`, `Shared Workout Components`, `Workout Calendar UI`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `Workout` connect `Workout Creation Service` to `Workout Progress UI`, `Workout Detail Contracts`, `Plan Builder Steps`, `Home Dashboard Components`, `Workout Page Orchestration`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `packageManager` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Workout Progress UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06881287726358148 - nodes in this community are weakly interconnected._
- **Should `Exercise Library Domain` be split into smaller, more focused modules?**
  _Cohesion score 0.059673659673659674 - nodes in this community are weakly interconnected._
- **Should `Workout Detail Contracts` be split into smaller, more focused modules?**
  _Cohesion score 0.07219662058371736 - nodes in this community are weakly interconnected._