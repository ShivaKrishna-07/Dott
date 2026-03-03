import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Flame, TrendingUp } from "lucide-react";
import {
  Habit, HabitEntry, getDaysInMonth, formatDateKey,
  getEntry, getStreak, getCompletionRate,
} from "@/lib/habitStore";
import { HabitModal } from "./HabitModal";
import { AddHabitModal } from "./AddHabitModal";

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitGridProps {
  year: number;
  month: number;
  habits: Habit[];
  onUpdate: (habits: Habit[]) => void;
}

export function HabitGrid({ year, month, habits, onUpdate }: HabitGridProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ habitId: string; dateKey: string } | null>(null);
  const days = getDaysInMonth(year, month);
  const today = new Date();
  const todayKey = formatDateKey(today);

  const isToday = (d: Date) => formatDateKey(d) === todayKey;
  const isPast = (d: Date) => {
    const dk = formatDateKey(d);
    return dk < todayKey;
  };
  const isFuture = (d: Date) => {
    const dk = formatDateKey(d);
    return dk > todayKey;
  };

  const addHabit = (name: string, emoji: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      emoji,
      color: ['155 70% 40%', '220 70% 55%', '280 65% 55%', '38 92% 50%'][Math.floor(Math.random() * 4)],
      entries: {},
      createdAt: new Date().toISOString(),
    };
    onUpdate([...habits, newHabit]);
  };

  const deleteHabit = (id: string) => {
    onUpdate(habits.filter(h => h.id !== id));
  };

  const handleCellClick = (habitId: string, dateKey: string) => {
    setSelectedCell({ habitId, dateKey });
  };

  const handleSaveEntry = (entry: HabitEntry) => {
    if (!selectedCell) return;
    const updated = habits.map(h => {
      if (h.id !== selectedCell.habitId) return h;
      return { ...h, entries: { ...h.entries, [entry.date]: entry } };
    });
    onUpdate(updated);
  };

  const selectedHabit = selectedCell ? habits.find(h => h.id === selectedCell.habitId) : null;
  const selectedDate = selectedCell
    ? days.find(d => formatDateKey(d) === selectedCell.dateKey)
    : null;

  return (
    <>
      <div className="border border-border rounded-2xl overflow-hidden bg-card">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-card p-0 min-w-[200px]">
                  <div className="px-4 py-3 text-left grid-header border-b border-r border-border">
                    Habits
                  </div>
                </th>
                {days.map(d => {
                  const dayNum = d.getDate();
                  const dayName = DAYS[d.getDay()];
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <th key={dayNum} className="p-0 min-w-[44px]">
                      <div
                        className={`px-1 py-3 text-center border-b border-border grid-header ${
                          isToday(d) ? 'bg-primary/10 text-primary font-bold' : ''
                        } ${isWeekend ? 'text-muted-foreground/60' : ''}`}
                      >
                        <div className="text-[10px]">{dayName}</div>
                        <div className={`text-sm font-mono ${isToday(d) ? 'text-primary' : ''}`}>{dayNum}</div>
                      </div>
                    </th>
                  );
                })}
                <th className="p-0 min-w-[70px]">
                  <div className="px-3 py-3 text-center border-b border-l border-border grid-header">
                    <TrendingUp className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {habits.map((habit, idx) => {
                  const streak = getStreak(habit);
                  const rate = getCompletionRate(habit, year, month);
                  return (
                    <motion.tr
                      key={habit.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="habit-row group"
                    >
                      <td className="sticky left-0 z-10 bg-card p-0">
                        <div className="px-4 py-2.5 flex items-center gap-2.5 border-r border-border">
                          <span className="text-lg">{habit.emoji}</span>
                          <span className="text-sm font-medium text-foreground truncate flex-1">{habit.name}</span>
                          {streak > 0 && (
                            <span className="flex items-center gap-1 text-xs font-mono text-streak shrink-0">
                              <Flame className="w-3 h-3" />{streak}
                            </span>
                          )}
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all shrink-0"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      </td>
                      {days.map(d => {
                        const dateKey = formatDateKey(d);
                        const entry = getEntry(habit, dateKey);
                        const past = isPast(d);
                        const future = isFuture(d);
                        const todayD = isToday(d);

                        return (
                          <td key={dateKey} className="p-0">
                            <motion.button
                              whileTap={!future ? { scale: 0.8 } : {}}
                              onClick={() => !future && handleCellClick(habit.id, dateKey)}
                              disabled={future}
                              className={`w-full h-10 flex items-center justify-center border border-transparent transition-all ${
                                future
                                  ? 'cell-disabled'
                                  : entry.completed
                                    ? 'cell-checked'
                                    : past
                                      ? 'cell-disabled cursor-pointer !opacity-80'
                                      : 'cell-unchecked cursor-pointer'
                              } ${todayD ? 'ring-1 ring-primary/20' : ''}`}
                            >
                              {entry.completed && (
                                <motion.svg
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-4 h-4 text-primary"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                              )}
                            </motion.button>
                          </td>
                        );
                      })}
                      <td className="p-0">
                        <div className="px-3 py-2.5 text-center border-l border-border">
                          <span className={`text-xs font-mono font-medium ${
                            rate >= 80 ? 'text-primary' : rate >= 50 ? 'text-streak' : 'text-muted-foreground'
                          }`}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Add Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border-t border-border"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </motion.button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddHabitModal onClose={() => setShowAddModal(false)} onAdd={addHabit} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedHabit && selectedCell && selectedDate && (
          <HabitModal
            habit={selectedHabit}
            dateKey={selectedCell.dateKey}
            dateLabel={selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            isPast={isPast(selectedDate)}
            onClose={() => setSelectedCell(null)}
            onSave={handleSaveEntry}
          />
        )}
      </AnimatePresence>
    </>
  );
}
