import { WorkoutCardViewModel } from '../../models/workout-planner.models';

export interface WorkoutSummaryCardConfig {
  workout: WorkoutCardViewModel;
  exerciseCountLabel: string;
  openLabel: string;
  copyLabel: string;
  copiedLabel: string;
  headingLabel?: string;
  startLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  closeMenuLabel?: string;
  estimatedLabel?: string;
  minutesLabel?: string;
  moreExercisesLabel?: string;
  canManage?: boolean;
}
