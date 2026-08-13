export type AddWorkoutStep = 'exercises' | 'planning';

export interface AddWorkoutHeaderConfig {
  title: string;
  selectedDateLabel: string;
  step: AddWorkoutStep;
  backLabel: string;
  nextLabel: string;
  nextDisabled?: boolean;
}
