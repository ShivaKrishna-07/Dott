import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Flame, TrendingUp, Check, Edit2 } from "lucide-react";
import {
  Habit, HabitEntry, getDaysInMonth, formatDateKey, SubHabit,
  getEntry, getStreak, getCompletionRate, createHabit
} from "@/lib/habitStore";
import { HabitModal } from "./HabitModal";
import { AddHabitModal } from "./AddHabitModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { ProgressRing } from "./ProgressRing";
import { StreakBadge } from "./StreakBadge";
import { ICON_MAP } from "@/lib/icons";
import { toast } from "sonner";

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
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: press 'N' to add a new habit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (!showAddModal && !selectedCell && !deleteTarget) {
          e.preventDefault();
          setShowAddModal(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showAddModal, selectedCell, deleteTarget]);

  const [editingHabit, setEditingHabit] = useState<{ id: string; name: string } | null>(null);
  const days = getDaysInMonth(year, month);
  const today = new Date();
  const todayKey = formatDateKey(today);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  const isToday = (d: Date) => formatDateKey(d) === todayKey;
  // Allow editing today and yesterday, lock anything older
  const isPast = (d: Date) => formatDateKey(d) < yesterdayKey;
  const isFuture = (d: Date) => formatDateKey(d) > todayKey;

  const addHabit = (name: string, icon: string, defaultSubHabits?: SubHabit[], target?: number, unit?: string) => {
    const newHabit = createHabit(name, icon, defaultSubHabits, target, unit);
    onUpdate([...habits, newHabit]);
    toast.success(`${name} added!`);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    toast(`${deleteTarget.name} deleted`);
    onUpdate(habits.filter(h => h.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleCellClick = (habitId: string, dateKey: string) => {
    setSelectedCell({ habitId, dateKey });
  };

  const saveEditHabit = () => {
    if (!editingHabit || !editingHabit.name.trim()) return;
    onUpdate(habits.map(h => h.id === editingHabit.id ? { ...h, name: editingHabit.name.trim() } : h));
    setEditingHabit(null);
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

  // Auto-scroll to current date on mount or month change
  useEffect(() => {
    if (tableContainerRef.current) {
      const todayIndex = days.findIndex(d => isToday(d));
      // Try to scroll to today if we are in the current month, otherwise scroll to start
      if (todayIndex !== -1) {
        // Approximate calculation: Left sticky column is 130px. Each day column is ~40px.
        // Scroll so today is visible in the middle/leftish area.
        const scrollPosition = Math.max(0, (todayIndex * 40) - 100);
        tableContainerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      } else {
        tableContainerRef.current.scrollTo({ left: 0 });
      }
    }
  }, [year, month, days]);

  return (
    <>
      {/* ===== MOBILE CARD VIEW (< 640px) ===== */}
      <div className="sm:hidden space-y-3">
        {habits.map((habit, idx) => {
          const streak = getStreak(habit);
          const IconComponent = ICON_MAP[habit.icon as keyof typeof ICON_MAP] || ICON_MAP.target;
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              className="glass-card p-4"
            >
              {/* Task header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <IconComponent className="w-5 h-5 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground truncate">{habit.name}</span>
                  {streak > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-streak shrink-0">
                      <Flame className="w-3 h-3" />{streak}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingHabit({ id: habit.id, name: habit.name })}
                    className="p-1.5 rounded-lg hover:bg-accent transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(habit)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Inline edit */}
              {editingHabit?.id === habit.id && (
                <div className="mb-3">
                  <input
                    value={editingHabit.name}
                    onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditHabit();
                      if (e.key === 'Escape') setEditingHabit(null);
                    }}
                    onBlur={saveEditHabit}
                    autoFocus
                    className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring/50"
                  />
                </div>
              )}

              {/* Month circles (Scrollable) */}
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1 -mx-2 px-2 snap-x snap-mandatory">
               {days.map(d => {
                  const dateKey = formatDateKey(d);
                  const entry = getEntry(habit, dateKey);
                  const future = isFuture(d);
                  const todayD = isToday(d);
                  const dayName = DAYS[d.getDay()];
                  const dayNum = d.getDate();

                  const isCompleted = habit.target !== undefined ? ((entry.value || 0) >= habit.target) : entry.completed;
                  const showTooltip = habit.target !== undefined && !isCompleted && !future;
                  const tooltipText = showTooltip ? `${entry.value || 0} / ${habit.target} ${habit.unit || ''}`.trim() : '';

                  return (
                    <button
                      key={dateKey}
                      title={tooltipText}
                      onClick={() => !future && handleCellClick(habit.id, dateKey)}
                      disabled={future}
                      className="flex flex-col items-center gap-1 shrink-0 snap-center"
                      style={{ width: '40px' }}
                    >
                      <span className={`text-[10px] font-mono ${todayD ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {dayName}
                      </span>
                      <div className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all ${
                        future
                          ? 'border-border/30 opacity-30'
                          : isCompleted
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border/60 hover:border-foreground/40'
                      } ${todayD && !isCompleted ? 'ring-2 ring-foreground/20 ring-offset-1 ring-offset-background' : ''}`}>
                        {isCompleted && <Check className="w-4 h-4" strokeWidth={3} />}
                        {!isCompleted && !future && (
                          <span className={`text-[11px] font-mono ${todayD ? 'text-foreground' : 'text-muted-foreground'}`}>{dayNum}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {habits.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center glass-card border-dashed">
            <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No tasks yet</p>
            <p className="text-xs text-muted-foreground mb-4">Start by adding a new habit tracking task.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 flex items-center gap-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground glass-card hover:bg-accent/50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* ===== DESKTOP TABLE VIEW (>= 640px) ===== */}
      <div className={`hidden sm:block glass-card overflow-hidden`}>
        <div ref={tableContainerRef} className="overflow-x-auto scrollbar-thin min-h-[300px]">
          <table className="w-full border-collapse min-w-max border-spacing-0">
            <thead>
              <tr className="h-11">
                <th className="sticky left-0 z-20 bg-card/90 backdrop-blur-sm p-0 w-[130px] min-w-[130px] max-w-[130px] border-b border-border/60 h-full">
                  <div className="px-4 flex items-center h-full text-left grid-header">
                    Task
                  </div>
                </th>
                {days.map(d => {
                  const dayNum = d.getDate();
                  const dayName = DAYS[d.getDay()];
                  return (
                    <th key={dayNum} className="p-0 min-w-[40px] border-b border-border/60 h-full">
                      <div
                        className={`px-0.5 flex flex-col justify-center items-center h-full ${
                          isToday(d) ? 'bg-foreground/5' : ''
                        }`}
                      >
                        <div className="text-[10px] text-muted-foreground font-mono leading-none">{dayName}</div>
                        <div className={`text-xs font-mono mt-0.5 ${isToday(d) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{dayNum}</div>
                      </div>
                    </th>
                  );
                })}
                <th className="sticky right-0 z-20 bg-card/90 backdrop-blur-sm p-0 min-w-[50px] border-b border-border/60 h-full">
                  <div className="px-1.5 flex items-center justify-center h-full grid-header">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {habits.length === 0 ? (
                  <tr>
                    <td colSpan={days.length + 2} className="p-0">
                      <div className="flex flex-col items-center justify-center py-16 text-center border-b border-border/20">
                        <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">No tasks yet</p>
                        <p className="text-xs text-muted-foreground mb-4">Start by adding a new tracking task.</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 flex items-center gap-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Task
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : habits.map((habit, idx) => {
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
                      <td className="sticky left-0 z-10 bg-card/90 backdrop-blur-sm p-0">
                        <div className="px-2.5 py-2.5 flex items-center gap-2 group/row min-w-0">
                          {(() => {
                            const IconComponent = ICON_MAP[habit.icon as keyof typeof ICON_MAP] || ICON_MAP.target;
                            return <IconComponent className="w-[18px] h-[18px] shrink-0 text-muted-foreground group-hover/row:text-foreground transition-colors" />;
                          })()}
                          {editingHabit?.id === habit.id ? (
                            <input
                              value={editingHabit.name}
                              onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditHabit();
                                if (e.key === 'Escape') setEditingHabit(null);
                              }}
                              onBlur={saveEditHabit}
                              autoFocus
                              className="flex-1 min-w-0 px-2 py-1 text-sm bg-background border border-border/60 rounded focus:outline-none focus:ring-1 focus:ring-ring/50"
                            />
                          ) : (
                            <span className="text-sm font-medium text-foreground truncate flex-1">{habit.name}</span>
                          )}
                          {streak > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-streak shrink-0">
                              <Flame className="w-3 h-3" />{streak}
                              <StreakBadge streak={streak} size="sm" />
                            </span>
                          )}
                          {editingHabit?.id !== habit.id && (
                            <div className="flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 ml-1">
                              <button
                                onClick={() => setEditingHabit({ id: habit.id, name: habit.name })}
                                className="p-1.5 rounded-lg hover:bg-accent transition-all mr-0.5"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(habit)}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      {days.map(d => {
                        const dateKey = formatDateKey(d);
                        const entry = getEntry(habit, dateKey);
                        const future = isFuture(d);
                        const todayD = isToday(d);

                        const isCompleted = habit.target !== undefined ? ((entry.value || 0) >= habit.target) : entry.completed;
                        const showTooltip = habit.target !== undefined && !isCompleted && !future;
                        const tooltipText = showTooltip ? `${entry.value || 0} / ${habit.target} ${habit.unit || ''}`.trim() : '';

                        return (
                          <td key={dateKey} className="p-0.5">
                            <button
                              title={tooltipText}
                              onClick={() => !future && handleCellClick(habit.id, dateKey)}
                              disabled={future}
                              className={`w-6 h-6 mx-auto flex items-center justify-center rounded-[8px] border transition-all ${
                                future
                                  ? 'cell-disabled'
                                  : isCompleted
                                    ? 'cell-checked border-foreground/50 shadow-sm shadow-foreground/20'
                                    : 'cell-unchecked border-border/80 hover:border-foreground/30'
                              } ${todayD && !isCompleted ? 'ring-2 ring-foreground/20 ring-offset-1 ring-offset-background' : ''}`}
                            >
                              {isCompleted && (
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td className="sticky right-0 z-10 bg-card/90 backdrop-blur-sm p-0 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                        <div className="px-1.5 py-2 flex items-center justify-center h-full">
                          <ProgressRing progress={rate} size={20} strokeWidth={2} color={
                            rate >= 80 ? 'hsl(160 60% 50%)' : rate >= 50 ? 'hsl(38 92% 55%)' : 'hsl(var(--muted-foreground))'
                          } />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {habits.length > 0 && (
                  <tr className="bg-card/30">
                    <td className="sticky left-0 z-10 bg-card/90 backdrop-blur-sm p-0">
                      <div className="px-3.5 py-2 mt-2 flex justify-end items-center">
                        <Flame className="w-3.5 h-3.5 text-muted-foreground/60" />
                      </div>
                    </td>
                    {days.map(d => {
                      const dateKey = formatDateKey(d);
                      const total = habits.length;
                      const done = habits.filter(h => getEntry(h, dateKey).completed).length;
                      const dailyRate = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <td key={`daily-${dateKey}`} className="p-0.5">
                          <div className="w-full h-6 mt-2 flex items-center justify-center">
                            {dailyRate > 0 ? (
                              <ProgressRing 
                                progress={dailyRate} 
                                size={14} 
                                strokeWidth={2} 
                                color={dailyRate >= 100 ? 'hsl(160 60% 50%)' : 'hsl(var(--muted-foreground))'} 
                              />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-border/30" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-card/90 backdrop-blur-sm p-0 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                      <div className="px-1.5 py-2 mt-2 flex h-full"></div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors border-t border-border/60"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
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
