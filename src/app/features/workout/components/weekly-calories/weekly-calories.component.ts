import { Component, computed, input } from '@angular/core';
import { WeeklyCaloriesConfig } from '../../data-access/models/weekly-calories-config.interface';

@Component({
  selector: 'app-weekly-calories',
  standalone: true,
  templateUrl: './weekly-calories.component.html',
})
export class WeeklyCaloriesComponent {
  readonly config = input.required<WeeklyCaloriesConfig>();
  readonly maximumCalories = computed(() =>
    Math.max(...this.config().days.map((day) => day.calories), 1),
  );

  getBarHeight(calories: number): number {
    if (!calories) {
      return 8;
    }

    return Math.max((calories / this.maximumCalories()) * 100, 18);
  }
}
