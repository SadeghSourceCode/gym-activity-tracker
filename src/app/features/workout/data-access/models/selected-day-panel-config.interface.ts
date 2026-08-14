import { SelectedDayViewModel, WorkoutDisplayStatus } from '../../models/workout-planner.models';

export interface SelectedDayPanelTextConfig {
  selectedDayWorkoutsLabel: string;
  retryLabel: string;
  openLabel: string;
  editLabel: string;
  deleteLabel: string;
  copyLabel: string;
  copiedLabel: string;
  restDayTitle: string;
  recoveryMessage: string;
  removeRestDayLabel: string;
  noWorkoutPlannedTitle: string;
  setWorkoutOrRestMessage: string;
  setWorkoutLabel: string;
  markAsRestDayLabel: string;
  inProgressLabel: string;
  doneLabel: string;
  rejectedLabel: string;
  incomingLabel: string;
  workoutSummaryHeadingLabel: string;
  startWorkoutLabel: string;
  closeMenuLabel: string;
  estimatedLabel: string;
  minutesLabel: string;
  moreExercisesLabel: string;
  isPersian: boolean;
}

export interface SelectedDayPanelConfig {
  selectedDateLabel: string;
  selectedDayViewModel: SelectedDayViewModel;
  text: SelectedDayPanelTextConfig;
  workoutStatus?: WorkoutDisplayStatus | null;
  error?: string | null;
}
