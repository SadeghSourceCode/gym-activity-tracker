export interface ExerciseSelectionItemConfig {
  id: string;
  name: string;
  targetMuscleLabel: string;
  equipmentLabel?: string;
  mediaUrl?: string;
  selected: boolean;
}

export interface ExerciseSelectionMuscleConfig {
  id: string;
  label: string;
  imageUrl: string;
  description: string;
  selected: boolean;
}

export interface ExerciseSelectionStepConfig {
  selectedDate: string;
  searchQuery: string;
  exercises: readonly ExerciseSelectionItemConfig[];
  muscles: readonly ExerciseSelectionMuscleConfig[];
  selectedCount: number;
  loading: boolean;
  hasMore: boolean;
  error?: string;
  searchPlaceholder: string;
  selectedLabel: string;
  loadingLabel: string;
  emptyLabel: string;
}
