import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Flame, Zap, Clock, SmilePlus } from "lucide-react";
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
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.emoji}</span>
                <div>
                  <h2 className="font-display font-bold text-lg text-foreground">{habit.name}</h2>
                  <p className="text-sm text-muted-foreground">{dateLabel}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {existing.completed && (
              <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 w-fit">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-primary">Completed</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin flex-1">
            {/* Mood */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <SmilePlus className="w-4 h-4 text-muted-foreground" /> Mood
              </label>
              <div className="flex gap-2">
                {MOODS.map((m, i) => (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => setMood(i + 1)}
                    className={`text-2xl p-2 rounded-xl transition-all ${
                      mood === i + 1 ? 'bg-primary/15 scale-110 ring-2 ring-primary/30' : 'hover:bg-secondary'
                    } ${isPast ? 'cursor-default' : ''}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-muted-foreground" /> Energy Level
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    disabled={isPast}
                    onClick={() => setEnergy(level)}
                    className={`flex-1 h-8 rounded-lg transition-all text-xs font-mono ${
                      energy >= level
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    } ${isPast ? 'cursor-default' : 'hover:opacity-80'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Spent */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" /> Time Spent (minutes)
              </label>
              <input
                type="number"
                min={0}
                value={timeSpent || ''}
                onChange={e => setTimeSpent(Number(e.target.value))}
                disabled={isPast}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-default"
              />
            </div>

            {/* Sub-habits */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-muted-foreground" /> Sub-habits
              </label>
              <div className="space-y-2">
                <AnimatePresence>
                  {subHabits.map(sh => (
                    <motion.div
                      key={sh.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 group"
                    >
                      <button
                        onClick={() => toggleSubHabit(sh.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                          sh.completed
                            ? 'bg-primary border-primary'
                            : 'border-border hover:border-primary/50'
                        } ${isPast ? 'cursor-default' : ''}`}
                      >
                        {sh.completed && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!isPast && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newSubHabit}
                      onChange={e => setNewSubHabit(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSubHabit()}
                      placeholder="Add sub-habit..."
                      className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={addSubHabit}
                      className="px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={isPast}
                placeholder="How did it go today?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-60 disabled:cursor-default"
              />
            </div>
          </div>

          {/* Footer */}
          {!isPast && (
            <div className="p-6 border-t border-border">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                ✓ Mark as Complete
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
