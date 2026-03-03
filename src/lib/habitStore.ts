export interface SubHabit {
  id: string;
  name: string;
  completed: boolean;
}

export interface HabitEntry {
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes: string;
  mood: number; // 1-5
  energyLevel: number; // 1-5
  timeSpent: number; // minutes
  subHabits: SubHabit[];
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  entries: Record<string, HabitEntry>;
  createdAt: string;
}

const STORAGE_KEY = 'habit-tracker-data';

const COLORS = [
  '155 70% 40%', '220 70% 55%', '280 65% 55%', '38 92% 50%',
  '0 72% 55%', '190 80% 42%', '330 70% 55%', '95 60% 40%',
];

export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export function createHabit(name: string, emoji: string): Habit {
  return {
    id: crypto.randomUUID(),
    name,
    emoji,
    color: getRandomColor(),
    entries: {},
    createdAt: new Date().toISOString(),
  };
}

export function getEntry(habit: Habit, dateKey: string): HabitEntry {
  return habit.entries[dateKey] || {
    date: dateKey,
    completed: false,
    notes: '',
    mood: 0,
    energyLevel: 0,
    timeSpent: 0,
    subHabits: [],
  };
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const count = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= count; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function getStreak(habit: Habit): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    if (habit.entries[key]?.completed) {
      streak++;
    } else if (i > 0) break;
  }
  return streak;
}

export function getCompletionRate(habit: Habit, year: number, month: number): number {
  const days = getDaysInMonth(year, month);
  const today = new Date();
  const relevantDays = days.filter(d => d <= today);
  if (relevantDays.length === 0) return 0;
  const completed = relevantDays.filter(d => habit.entries[formatDateKey(d)]?.completed).length;
  return Math.round((completed / relevantDays.length) * 100);
}
