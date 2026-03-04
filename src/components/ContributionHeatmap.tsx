import { useMemo } from "react";
import { motion } from "framer-motion";
import { Habit, formatDateKey, getEntry } from "@/lib/habitStore";

interface ContributionHeatmapProps {
  habits: Habit[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ContributionHeatmap({ habits }: ContributionHeatmapProps) {
  const { weeks, maxCompleted } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    // Adjust to start on a Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const days = [];
    let current = new Date(startDate);
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay())); // Pad to end of week

    while (current <= end) {
      const key = formatDateKey(current);
      let completed = 0;
      if (current <= today) {
        for (const habit of habits) {
          if (getEntry(habit, key).completed) completed++;
        }
      }
      
      days.push({
        date: new Date(current),
        key,
        completed,
        isFuture: current > today,
      });
      current.setDate(current.getDate() + 1);
    }

    // Group into weeks
    const weeks = [];
    let max = 1;
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7);
      weeks.push(week);
      for (const day of week) {
        if (day.completed > max) max = day.completed;
      }
    }

    return { weeks, maxCompleted: max };
  }, [habits]);

  const getColorClass = (completed: number, max: number, isFuture: boolean) => {
    if (isFuture) return "bg-accent/30";
    if (completed === 0) return "bg-accent/50";
    const ratio = completed / max;
    if (ratio <= 0.25) return "bg-emerald-950";
    if (ratio <= 0.5) return "bg-emerald-800";
    if (ratio <= 0.75) return "bg-emerald-600";
    return "bg-emerald-500";
  };

  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="stat-card glow-emerald overflow-x-auto scrollbar-thin"
    >
      <div className="flex items-center justify-between mb-8 min-w-[700px]">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity Landscape</h3>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
          <span>Less</span>
          <div className="flex gap-1.5">
            <div className="w-[11px] h-[11px] rounded-[3px] bg-accent/50" />
            <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-950" />
            <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-800" />
            <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-600" />
            <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex min-w-max gap-1.5 relative mx-auto w-fit">
        {/* Days labels */}
        <div className="flex flex-col gap-1.5 pr-2 pt-5">
          <span className="text-[10px] text-muted-foreground font-sans h-[11px] leading-[11px]" />
          <span className="text-[10px] text-muted-foreground font-sans h-[11px] leading-[11px]">Mon</span>
          <span className="text-[10px] text-muted-foreground font-sans h-[11px] leading-[11px]" />
          <span className="text-[10px] text-muted-foreground font-sans h-[11px] leading-[11px]">Wed</span>
          <span className="text-[10px] text-muted-foreground font-sans h-[11px] leading-[11px]" />
          <span className="text-[10px] text-muted-foreground font-sans h-[11px] leading-[11px]">Fri</span>
          <span className="text-[10px] text-muted-foreground font-sans h-[11px] leading-[11px]" />
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-1 gap-1.5 pt-5 relative">
          {weeks.map((week, i) => {
            const firstDayOfMonth = week.find(d => d.date.getDate() >= 1 && d.date.getDate() <= 7 && d.date.getDay() === 1);
            let showMonth = false;
            if (firstDayOfMonth || (i === 0)) {
               // Only show if it's the first week of the month, or first week overall
               showMonth = true;
            }

            const monthName = week[0].date.getMonth();

            return (
              <div key={i} className="flex flex-col gap-1.5 relative">
                {/* Month Label */}
                {showMonth && (
                  <div className="h-4 absolute -top-5 text-[11px] text-muted-foreground font-sans whitespace-nowrap">
                    {MONTHS[monthName]}
                  </div>
                )}
                
                {/* Days */}
                {week.map(day => (
                  <div
                    key={day.key}
                    title={`${day.date.toDateString()}: ${day.completed} tasks`}
                    className={`w-[11px] h-[11px] rounded-[3px] ${getColorClass(day.completed, maxCompleted, day.isFuture)} transition-colors hover:ring-1 hover:ring-foreground/40`}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
