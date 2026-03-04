import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ChevronRight } from "lucide-react";
import { Habit, formatDateKey, getEntry, getStreak } from "@/lib/habitStore";
import { ICON_MAP } from "@/lib/icons";

interface TodaysFocusProps {
  habits: Habit[];
  onQuickComplete: (habitId: string) => void;
}

export function TodaysFocus({ habits, onQuickComplete }: TodaysFocusProps) {
  const todayKey = formatDateKey(new Date());

  const { pending, completed } = useMemo(() => {
    const pending: Habit[] = [];
    const completed: Habit[] = [];
    for (const h of habits) {
      const entry = getEntry(h, todayKey);
      if (entry.completed) completed.push(h);
      else pending.push(h);
    }
    return { pending, completed };
  }, [habits, todayKey]);

  const allDone = pending.length === 0 && completed.length > 0;

  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="stat-card glow-emerald"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Today's Focus
          </h3>
          {allDone && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium"
            >
              <Sparkles className="w-3 h-3" /> All done!
            </motion.span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {completed.length}/{habits.length} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-accent/60 rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${habits.length > 0 ? (completed.length / habits.length) * 100 : 0}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
        />
      </div>

      {/* Pending habits */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {pending.map((habit, i) => {
            const streak = getStreak(habit);
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, height: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-accent/50 transition-colors group"
              >
                <button
                  onClick={() => onQuickComplete(habit.id)}
                  className="w-5 h-5 rounded-md border border-border/80 flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-500/10 transition-all shrink-0"
                >
                  <Check className="w-3 h-3 text-transparent group-hover:text-emerald-500 transition-colors" strokeWidth={3} />
                </button>
                {(() => {
                  const IconComponent = ICON_MAP[habit.icon as keyof typeof ICON_MAP] || ICON_MAP.target;
                  return <IconComponent className="w-4 h-4 text-muted-foreground shrink-0" />;
                })()}
                <span className="text-sm font-medium text-foreground flex-1 truncate">{habit.name}</span>
                {streak > 0 && (
                  <span className="text-[10px] font-mono text-streak">🔥 {streak}d</span>
                )}
                <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Completed habits (collapsed) */}
        {completed.length > 0 && (
          <div className="pt-1.5 border-t border-border/40 mt-2">
            {completed.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 py-1.5 px-3 opacity-50"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                </div>
                {(() => {
                  const IconComponent = ICON_MAP[habit.icon as keyof typeof ICON_MAP] || ICON_MAP.target;
                  return <IconComponent className="w-4 h-4 text-emerald-400 shrink-0 opacity-50" />;
                })()}
                <span className="text-sm font-medium text-foreground flex-1 truncate line-through">{habit.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
