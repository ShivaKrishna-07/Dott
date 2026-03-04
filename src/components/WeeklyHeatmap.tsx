import { useMemo } from "react";
import { motion } from "framer-motion";
import { Habit, formatDateKey, getEntry } from "@/lib/habitStore";

interface WeeklyHeatmapProps {
  habits: Habit[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyHeatmap({ habits }: WeeklyHeatmapProps) {
  const weekData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Adjust to start from Monday
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return DAYS.map((name, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - mondayOffset + i);
      const key = formatDateKey(d);
      const isToday = key === formatDateKey(today);
      const isFuture = d > today;

      let completed = 0;
      let total = habits.length;

      for (const habit of habits) {
        const entry = getEntry(habit, key);
        if (entry.completed) completed++;
      }

      const rate = total > 0 ? completed / total : 0;

      return { name, date: d.getDate(), key, isToday, isFuture, completed, total, rate };
    });
  }, [habits]);

  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="stat-card glow-purple"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Week</h3>
        <span className="text-[10px] text-muted-foreground font-mono">
          {weekData.filter(d => !d.isFuture && d.completed === d.total && d.total > 0).length}/{weekData.filter(d => !d.isFuture).length} perfect days
        </span>
      </div>
      <div className="flex gap-2">
        {weekData.map((day, i) => (
          <motion.div
            key={day.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
            className="flex-1 flex flex-col items-center gap-1.5"
          >
            <span className={`text-[10px] font-mono ${day.isToday ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              {day.name}
            </span>
            <div
              className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-all ${
                day.isFuture
                  ? 'bg-accent/30 text-muted-foreground/40'
                  : day.rate >= 1
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                    : day.rate >= 0.5
                      ? 'bg-amber-500/15 text-amber-400'
                      : day.rate > 0
                        ? 'bg-foreground/5 text-muted-foreground'
                        : 'bg-accent/50 text-muted-foreground/60'
              } ${day.isToday ? 'ring-1 ring-foreground/20' : ''}`}
            >
              {day.isFuture ? '' : `${day.completed}/${day.total}`}
            </div>
            <span className={`text-[10px] font-mono ${day.isToday ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              {day.date}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
