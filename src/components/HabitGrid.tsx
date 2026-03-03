import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Flame, TrendingUp, Check } from "lucide-react";
import {
  Habit, HabitEntry, getDaysInMonth, formatDateKey,
  getEntry, getStreak, getCompletionRate,
} from "@/lib/habitStore";
import { HabitModal } from "./HabitModal";
import { AddHabitModal } from "./AddHabitModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface HabitGridProps {
  year: number;
  month: number;
  habits: Habit[];
  onUpdate: (habits: Habit[]) => void;
}

export function HabitGrid({ year, month, habits, onUpdate }: HabitGridProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ habitId: string; dateKey: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const days = getDaysInMonth(year, month);
  const today = new Date();
  const todayKey = formatDateKey(today);

  const isToday = (d: Date) => formatDateKey(d) === todayKey;
  const isPast = (d: Date) => formatDateKey(d) < todayKey;
  const isFuture = (d: Date) => formatDateKey(d) > todayKey;

  const addHabit = (name: string, emoji: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      emoji,
      color: '0 0% 9%',
      entries: {},
      createdAt: new Date().toISOString(),
    };
    onUpdate([...habits, newHabit]);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    onUpdate(habits.filter(h => h.id !== deleteTarget.id));
    setDeleteTarget(null);
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
                <th className="sticky left-0 z-20 bg-card p-0 min-w-[180px]">
                  <div className="px-4 py-2.5 text-left grid-header border-b border-r border-border">
                    Habit
                  </div>
                </th>
                {days.map(d => {
                  const dayNum = d.getDate();
                  const dayName = DAYS[d.getDay()];
                  return (
                    <th key={dayNum} className="p-0 min-w-[40px]">
                      <div
                        className={`px-0.5 py-2.5 text-center border-b border-border ${
                          isToday(d) ? 'bg-foreground/5' : ''
                        }`}
                      >
                        <div className="text-[10px] text-muted-foreground font-mono">{dayName}</div>
                        <div className={`text-xs font-mono mt-0.5 ${isToday(d) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{dayNum}</div>
                      </div>
                    </th>
                  );
                })}
                <th className="p-0 min-w-[56px]">
                  <div className="px-2 py-2.5 text-center border-b border-l border-border grid-header">
                    <TrendingUp className="w-3 h-3 mx-auto text-muted-foreground" />
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
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className="habit-row group"
                    >
                      <td className="sticky left-0 z-10 bg-card p-0">
                        <div className="px-4 py-2 flex items-center gap-2 border-r border-border">
                          <span className="text-base">{habit.emoji}</span>
                          <span className="text-sm font-medium text-foreground truncate flex-1">{habit.name}</span>
                          {streak > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] font-mono text-streak shrink-0">
                              <Flame className="w-3 h-3" />{streak}
                            </span>
                          )}
                          <button
                            onClick={() => setDeleteTarget(habit)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 transition-all shrink-0"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </td>
                      {days.map(d => {
                        const dateKey = formatDateKey(d);
                        const entry = getEntry(habit, dateKey);
                        const future = isFuture(d);
                        const todayD = isToday(d);

                        return (
                          <td key={dateKey} className="p-0.5">
                            <button
                              onClick={() => !future && handleCellClick(habit.id, dateKey)}
                              disabled={future}
                              className={`w-full h-8 flex items-center justify-center rounded-lg border transition-all ${
                                future
                                  ? 'cell-disabled'
                                  : entry.completed
                                    ? 'cell-checked'
                                    : 'cell-unchecked'
                              } ${todayD ? 'ring-1 ring-ring/20' : ''}`}
                            >
                              {entry.completed && (
                                <Check className="w-3 h-3" strokeWidth={2.5} />
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-0">
                        <div className="px-2 py-2 text-center border-l border-border">
                          <span className={`text-xs font-mono ${
                            rate >= 80 ? 'text-success' : rate >= 50 ? 'text-streak' : 'text-muted-foreground'
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

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors border-t border-border"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Habit
        </button>
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
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            habitName={deleteTarget.name}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
