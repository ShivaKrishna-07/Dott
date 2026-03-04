import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Target, Clock, Zap } from "lucide-react";
import { Habit, getStreak, getCompletionRate, formatDateKey, getDaysInMonth } from "@/lib/habitStore";
import { ProgressRing } from "./ProgressRing";

interface StatsDashboardProps {
  habits: Habit[];
  year: number;
  month: number;
}

export function StatsDashboard({ habits, year, month }: StatsDashboardProps) {
  const stats = useMemo(() => {
    if (habits.length === 0) {
      return { totalHabits: 0, bestStreak: 0, avgCompletion: 0, totalMinutes: 0 };
    }

    const streaks = habits.map(h => getStreak(h));
    const bestStreak = Math.max(...streaks);

    const rates = habits.map(h => getCompletionRate(h, year, month));
    const avgCompletion = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);

    const days = getDaysInMonth(year, month);
    const today = new Date();
    const relevantDays = days.filter(d => d <= today);
    let totalMinutes = 0;
    for (const habit of habits) {
      for (const day of relevantDays) {
        const key = formatDateKey(day);
        if (habit.entries[key]?.timeSpent) {
          totalMinutes += habit.entries[key].timeSpent;
        }
      }
    }

    return {
      totalHabits: habits.length,
      bestStreak,
      avgCompletion,
      totalMinutes,
    };
  }, [habits, year, month]);

  const cards = [
    {
      label: "Active Habits",
      value: stats.totalHabits,
      suffix: "",
      icon: Target,
      gradient: "gradient-text-purple",
      glow: "glow-purple",
      color: "hsl(270 70% 65%)",
    },
    {
      label: "Best Streak",
      value: stats.bestStreak,
      suffix: "d",
      icon: Flame,
      gradient: "gradient-text-amber",
      glow: "glow-amber",
      color: "hsl(38 92% 55%)",
    },
    {
      label: "Completion",
      value: stats.avgCompletion,
      suffix: "%",
      icon: Zap,
      gradient: "gradient-text-emerald",
      glow: "glow-emerald",
      color: "hsl(160 60% 50%)",
      showRing: true,
    },
    {
      label: "Time Logged",
      value: stats.totalMinutes,
      suffix: "m",
      icon: Clock,
      gradient: "gradient-text-blue",
      glow: "glow-blue",
      color: "hsl(220 80% 65%)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          className={`stat-card ${card.glow} group`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-accent/60">
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            {card.showRing && stats.totalHabits > 0 && (
              <ProgressRing
                progress={stats.avgCompletion}
                size={36}
                strokeWidth={3}
                color={card.color}
              />
            )}
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold tracking-tight ${card.gradient}`}>
              {card.value}{card.suffix}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {card.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
