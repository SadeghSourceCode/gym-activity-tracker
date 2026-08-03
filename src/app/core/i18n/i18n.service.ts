import { Injectable, computed, inject } from '@angular/core';
import { ProfilePreferencesService } from '../profile/profile-preferences.service';

type TranslationKey =
  | 'addSet'
  | 'addWorkout'
  | 'allWorkoutsLoaded'
  | 'ageBirthday'
  | 'birthday'
  | 'close'
  | 'closeExerciseDetails'
  | 'closeExerciseSearch'
  | 'closeWorkoutDetails'
  | 'couldNotFindWorkout'
  | 'couldNotFindWorkoutToEdit'
  | 'couldNotLoadExercises'
  | 'couldNotLoadMoreWorkouts'
  | 'couldNotLoadWorkouts'
  | 'done'
  | 'edit'
  | 'editWorkout'
  | 'exerciseDetails'
  | 'findWorkoutsAndExercises'
  | 'firstDay'
  | 'fourthDay'
  | 'fifthDay'
  | 'home'
  | 'incoming'
  | 'inProgress'
  | 'language'
  | 'leaveEmptyToUse'
  | 'loadMore'
  | 'loadingExercises'
  | 'loadingMoreWorkouts'
  | 'loadingWorkouts'
  | 'markAsDone'
  | 'markAsRestDay'
  | 'noDescriptionAvailable'
  | 'noExercisesFound'
  | 'noWorkoutPlanned'
  | 'noWorkoutsFound'
  | 'open'
  | 'profile'
  | 'profileImage'
  | 'progress'
  | 'reject'
  | 'rejected'
  | 'rejectWorkout'
  | 'remove'
  | 'removeRestDay'
  | 'removeWorkoutBeforeRest'
  | 'repeat'
  | 'retry'
  | 'recoveryMessage'
  | 'restDay'
  | 'save'
  | 'saveWorkout'
  | 'search'
  | 'searchByNameMuscleEquipment'
  | 'searchExercises'
  | 'searchWorkouts'
  | 'secondDay'
  | 'select'
  | 'selected'
  | 'selectedDayWorkouts'
  | 'selectedExercises'
  | 'selectExerciseForDate'
  | 'selectAtLeastOneExercise'
  | 'setWorkout'
  | 'setWorkoutOrRest'
  | 'seventhDay'
  | 'similarExercises'
  | 'sixthDay'
  | 'systemTheme'
  | 'tall'
  | 'themeDark'
  | 'themeLight'
  | 'themeSystem'
  | 'thirdDay'
  | 'today'
  | 'uploadImage'
  | 'userName'
  | 'weight'
  | 'workoutDay'
  | 'workoutDetails'
  | 'workoutTitle';

const translations: Record<'en' | 'fa', Record<TranslationKey, string>> = {
  en: {
    addSet: 'Add set',
    addWorkout: 'Add new workout',
    allWorkoutsLoaded: 'All workouts loaded.',
    ageBirthday: 'Age / birthday',
    birthday: 'Birthday',
    close: 'Close',
    closeExerciseDetails: 'Close exercise details',
    closeExerciseSearch: 'Close exercise search',
    closeWorkoutDetails: 'Close workout details',
    couldNotFindWorkout: 'Could not find this workout.',
    couldNotFindWorkoutToEdit: 'Could not find this workout to edit.',
    couldNotLoadExercises: 'Could not load exercises. Check your connection and try again.',
    couldNotLoadMoreWorkouts: 'Could not load more workouts. Check your connection and try again.',
    couldNotLoadWorkouts: 'Could not load workouts. Check your connection and try again.',
    done: 'Done',
    edit: 'Edit',
    editWorkout: 'Edit workout',
    exerciseDetails: 'Exercise details',
    findWorkoutsAndExercises: 'Find workouts and exercises',
    firstDay: 'First Day',
    fourthDay: 'Fourth Day',
    fifthDay: 'Fifth Day',
    home: 'Home',
    incoming: 'Incoming',
    inProgress: 'In Progress',
    language: 'Language',
    leaveEmptyToUse: 'Leave empty to use',
    loadMore: 'Load more',
    loadingExercises: 'Loading exercises...',
    loadingMoreWorkouts: 'Loading more workouts...',
    loadingWorkouts: 'Loading workouts...',
    markAsDone: 'Mark as Done',
    markAsRestDay: 'Mark as rest day',
    noDescriptionAvailable: 'No description is available for this exercise.',
    noExercisesFound: 'No exercises found.',
    noWorkoutPlanned: 'No workout planned for this day.',
    noWorkoutsFound: 'No workouts found.',
    open: 'Open',
    profile: 'Profile',
    profileImage: 'Profile image',
    progress: 'Progress',
    reject: 'Reject',
    rejected: 'Rejected',
    rejectWorkout: 'Reject Workout',
    remove: 'Remove',
    removeRestDay: 'Remove rest day',
    removeWorkoutBeforeRest: 'Remove this day’s workouts before marking it as a rest day.',
    repeat: 'Repeat',
    retry: 'Retry',
    recoveryMessage: 'Recovery is part of your training plan.',
    restDay: 'Rest Day',
    save: 'Save',
    saveWorkout: 'Save workout',
    search: 'Search',
    searchByNameMuscleEquipment: 'Search by name, muscle, equipment...',
    searchExercises: 'Search exercises',
    searchWorkouts: 'Search workouts',
    secondDay: 'Second Day',
    select: 'Select',
    selected: 'Selected',
    selectedDayWorkouts: 'Selected day workouts',
    selectedExercises: 'Selected exercises',
    selectExerciseForDate: 'Select one or more exercises for',
    selectAtLeastOneExercise: 'Select at least one exercise to create a workout.',
    setWorkout: 'Set workout',
    setWorkoutOrRest: 'Set a workout or mark this day as rest.',
    seventhDay: 'Seventh Day',
    similarExercises: 'Similar exercises',
    sixthDay: 'Sixth Day',
    systemTheme: 'System theme',
    tall: 'Tall',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeSystem: 'System',
    thirdDay: 'Third Day',
    today: 'Today',
    uploadImage: 'Upload image',
    userName: 'User name',
    weight: 'Weight',
    workoutDay: 'Workout Day',
    workoutDetails: 'Workout details',
    workoutTitle: 'Workout title',
  },
  fa: {
    addSet: 'افزودن ست',
    addWorkout: 'افزودن تمرین جدید',
    allWorkoutsLoaded: 'همه تمرین‌ها بارگذاری شدند.',
    ageBirthday: 'سن / تاریخ تولد',
    birthday: 'تاریخ تولد',
    close: 'بستن',
    closeExerciseDetails: 'بستن جزئیات حرکت',
    closeExerciseSearch: 'بستن جستجوی حرکت',
    closeWorkoutDetails: 'بستن جزئیات تمرین',
    couldNotFindWorkout: 'این تمرین پیدا نشد.',
    couldNotFindWorkoutToEdit: 'این تمرین برای ویرایش پیدا نشد.',
    couldNotLoadExercises: 'حرکت‌ها بارگذاری نشدند. اتصال خود را بررسی کنید و دوباره تلاش کنید.',
    couldNotLoadMoreWorkouts: 'تمرین‌های بیشتر بارگذاری نشدند. اتصال خود را بررسی کنید و دوباره تلاش کنید.',
    couldNotLoadWorkouts: 'تمرین‌ها بارگذاری نشدند. اتصال خود را بررسی کنید و دوباره تلاش کنید.',
    done: 'انجام شد',
    edit: 'ویرایش',
    editWorkout: 'ویرایش تمرین',
    exerciseDetails: 'جزئیات حرکت',
    findWorkoutsAndExercises: 'جستجوی تمرین‌ها و حرکت‌ها',
    firstDay: 'روز اول',
    fourthDay: 'روز چهارم',
    fifthDay: 'روز پنجم',
    home: 'خانه',
    incoming: 'در پیش',
    inProgress: 'در حال انجام',
    language: 'زبان',
    leaveEmptyToUse: 'برای استفاده از این عنوان خالی بگذارید',
    loadMore: 'بارگذاری بیشتر',
    loadingExercises: 'در حال بارگذاری حرکت‌ها...',
    loadingMoreWorkouts: 'در حال بارگذاری تمرین‌های بیشتر...',
    loadingWorkouts: 'در حال بارگذاری تمرین‌ها...',
    markAsDone: 'ثبت به‌عنوان انجام‌شده',
    markAsRestDay: 'ثبت به‌عنوان روز استراحت',
    noDescriptionAvailable: 'توضیحی برای این حرکت موجود نیست.',
    noExercisesFound: 'حرکتی پیدا نشد.',
    noWorkoutPlanned: 'برای این روز تمرینی ثبت نشده است.',
    noWorkoutsFound: 'تمرینی پیدا نشد.',
    open: 'باز کردن',
    profile: 'پروفایل',
    profileImage: 'تصویر پروفایل',
    progress: 'پیشرفت',
    reject: 'رد کردن',
    rejected: 'رد شده',
    rejectWorkout: 'رد کردن تمرین',
    remove: 'حذف',
    removeRestDay: 'حذف روز استراحت',
    removeWorkoutBeforeRest: 'قبل از ثبت روز استراحت، تمرین‌های این روز را حذف کنید.',
    repeat: 'تکرار',
    retry: 'تلاش دوباره',
    recoveryMessage: 'ریکاوری بخشی از برنامه تمرینی شماست.',
    restDay: 'روز استراحت',
    save: 'ذخیره',
    saveWorkout: 'ذخیره تمرین',
    search: 'جستجو',
    searchByNameMuscleEquipment: 'جستجو بر اساس نام، عضله، تجهیزات...',
    searchExercises: 'جستجوی حرکت‌ها',
    searchWorkouts: 'جستجوی تمرین‌ها',
    secondDay: 'روز دوم',
    select: 'انتخاب',
    selected: 'انتخاب‌شده',
    selectedDayWorkouts: 'تمرین‌های روز انتخاب‌شده',
    selectedExercises: 'حرکت‌های انتخاب‌شده',
    selectExerciseForDate: 'یک یا چند حرکت را انتخاب کنید برای',
    selectAtLeastOneExercise: 'برای ساخت تمرین حداقل یک حرکت انتخاب کنید.',
    setWorkout: 'ثبت تمرین',
    setWorkoutOrRest: 'یک تمرین ثبت کنید یا این روز را استراحت بزنید.',
    seventhDay: 'روز هفتم',
    similarExercises: 'حرکت‌های مشابه',
    sixthDay: 'روز ششم',
    systemTheme: 'تم سیستم',
    tall: 'قد',
    themeDark: 'تیره',
    themeLight: 'روشن',
    themeSystem: 'سیستم',
    thirdDay: 'روز سوم',
    today: 'امروز',
    uploadImage: 'بارگذاری تصویر',
    userName: 'نام کاربر',
    weight: 'وزن',
    workoutDay: 'روز تمرین',
    workoutDetails: 'جزئیات تمرین',
    workoutTitle: 'عنوان تمرین',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly profilePreferences = inject(ProfilePreferencesService);
  readonly language = this.profilePreferences.language;
  readonly isRtl = computed(() => this.language() === 'fa');

  t(key: TranslationKey): string {
    return translations[this.language()][key];
  }
}
