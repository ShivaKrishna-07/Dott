import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Zap, Clock, SmilePlus, ListChecks } from "lucide-react";
import { Habit, HabitEntry, getEntry, SubHabit } from "@/lib/habitStore";

const MOODS = ['😞', '😐', '🙂', '😊', '🤩'];

interface HabitModalProps {
  habit: Habit;
  dateKey: string;
  dateLabel: string;
  isPast: boolean;
  onClose: () => void;
  onSave: (entry: HabitEntry) => void;
}

export function HabitModal({ habit, dateKey, dateLabel, isPast, onClose, onSave }: HabitModalProps) {
  const existing = getEntry(habit, dateKey);
  const [notes, setNotes] = useState(existing.notes);
  const [mood, setMood] = useState(existing.mood);
  const [energy, setEnergy] = useState(existing.energyLevel);
  const [timeSpent, setTimeSpent] = useState(existing.timeSpent);
  const [subHabits, setSubHabits] = useState<SubHabit[]>(existing.subHabits);
  const [newSubHabit, setNewSubHabit] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const addSubHabit = () => {
    if (!newSubHabit.trim()) return;
    setSubHabits([...subHabits, { id: crypto.randomUUID(), name: newSubHabit.trim(), completed: false }]);
    setNewSubHabit('');
  };

  const toggleSubHabit = (id: string) => {
    if (isPast) return;
    setSubHabits(subHabits.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSubHabit = (id: string) => {
    if (isPast) return;
    setSubHabits(subHabits.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onSave({
      date: dateKey,
      completed: true,
      notes,
      mood,
      energyLevel: energy,
      timeSpent,
      subHabits,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{habit.emoji}</span>
                <div>
                  <h2 className="font-semibold text-base text-foreground">{habit.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {existing.completed && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[11px] font-medium text-success">Completed</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto scrollbar-thin flex-1">
            {/* Mood */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
                <SmilePlus className="w-3.5 h-3.5" /> Mood
              </label>
              <div className="flex gap-1.5">
                {MOODS.map((m, i) => (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => setMood(i + 1)}
                    className={`text-xl p-2 rounded-xl transition-all ${
                      mood === i + 1 ? 'bg-accent ring-1 ring-border scale-110' : 'hover:bg-accent'
                    } ${isPast ? 'cursor-default' : ''}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Energy
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    disabled={isPast}
                    onClick={() => setEnergy(level)}
                    className={`flex-1 h-8 rounded-lg transition-all text-xs font-mono ${
                      energy >= level
                        ? 'bg-foreground text-background'
                        : 'bg-accent text-muted-foreground'
                    } ${isPast ? 'cursor-default' : 'hover:opacity-80'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Spent */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> Minutes
              </label>
              <input
                type="number"
                min={0}
                value={timeSpent || ''}
                onChange={e => setTimeSpent(Number(e.target.value))}
                disabled={isPast}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50 disabled:cursor-default"
              />
            </div>

            {/* Sub-habits */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
                <ListChecks className="w-3.5 h-3.5" /> Sub-habits
              </label>
              <div className="space-y-1.5">
                <AnimatePresence>
                  {subHabits.map(sh => (
                    <motion.div
                      key={sh.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2.5 group"
                    >
                      <button
                        onClick={() => toggleSubHabit(sh.id)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          sh.completed
                            ? 'bg-foreground border-foreground'
                            : 'border-border hover:border-muted-foreground'
                        } ${isPast ? 'cursor-default' : ''}`}
                      >
                        {sh.completed && (
                          <svg className="w-2.5 h-2.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${sh.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {sh.name}
                      </span>
                      {!isPast && (
                        <button
                          onClick={() => removeSubHabit(sh.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!isPast && (
                  <div className="flex gap-1.5 mt-2">
                    <input
                      value={newSubHabit}
                      onChange={e => setNewSubHabit(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSubHabit()}
                      placeholder="Add sub-habit..."
                      className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      onClick={addSubHabit}
                      className="px-3 py-2 rounded-xl border border-border hover:bg-accent transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2.5 block uppercase tracking-wider">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={isPast}
                placeholder="How did it go?"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none disabled:opacity-50 disabled:cursor-default"
              />
            </div>
          </div>

          {/* Footer */}
          {!isPast && (
            <div className="px-6 py-4 border-t border-border">
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Mark Complete
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
