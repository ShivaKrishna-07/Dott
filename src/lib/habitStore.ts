import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface SubHabit {
  id: string;
  name: string;
  completed: boolean;
  value?: string;
  subHabits?: SubHabit[];
}

export interface HabitEntry {
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number; // Target progress
  notes: string;
  mood?: number; // 1-5
  energyLevel?: number; // 1-5
  timeSpent?: number; // minutes
  subHabits: SubHabit[];
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  target?: number;
  unit?: string;
  entries: Record<string, HabitEntry>;
  createdAt: string;
  defaultSubHabits?: SubHabit[];
}


const COLORS = [
  '155 70% 40%', '220 70% 55%', '280 65% 55%', '38 92% 50%',
  '0 72% 55%', '190 80% 42%', '330 70% 55%', '95 60% 40%',
];

export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}


export function onHabitsSnapshot(userId: string, callback: (habits: Habit[]) => void) {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map(d => d.data() as Habit);
    // Sort tasks by creation time ascending
    callback(tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }, (err) => {
    console.error("Error in tasks snapshot listener:", err);
    callback([]);
  });
}

function removeUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = removeUndefined(value);
    }
  }
  return result;
}

export async function saveHabitCloud(habit: Habit): Promise<void> {
  const docRef = doc(db, 'tasks', habit.id);
  const cleanHabit = removeUndefined(habit);
  await setDoc(docRef, cleanHabit, { merge: true });
}

export async function deleteHabitCloud(habitId: string): Promise<void> {
  const docRef = doc(db, 'tasks', habitId);
  await deleteDoc(docRef);
}

export function createHabit(userId: string, name: string, icon: string, defaultSubHabits?: SubHabit[], target?: number, unit?: string): Habit {
  return {
    id: crypto.randomUUID(),
    userId,
    name,
    icon,
    color: getRandomColor(),
    target,
    unit,
    entries: {},
    createdAt: new Date().toISOString(),
    defaultSubHabits
  };
}

export function getEntry(habit: Habit, dateKey: string): HabitEntry {
  if (habit.entries[dateKey]) {
    return habit.entries[dateKey];
  }

  // Deep clone default sub-habits if they exist so modifications don't mutate the template
  const clonedSubHabits = habit.defaultSubHabits ? JSON.parse(JSON.stringify(habit.defaultSubHabits)) : [];

  return {
    date: dateKey,
    completed: false,
    value: 0,
    notes: '',
    mood: 0,
    energyLevel: 0,
    timeSpent: 0,
    subHabits: clonedSubHabits,
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
