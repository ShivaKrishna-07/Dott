import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MonthPicker } from "@/components/MonthPicker";
import { HabitGrid } from "@/components/HabitGrid";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { Habit, loadHabits, saveHabits, formatDateKey, getEntry } from "@/lib/habitStore";
import { toast } from "sonner";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

const Index = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    setHabits(loadHabits());
  }, []);

  const handleUpdate = (updated: Habit[]) => {
    setHabits(updated);
    saveHabits(updated);
  };



  const todayKey = formatDateKey(new Date());
  const todayStats = useMemo(() => {
    const total = habits.length;
    const done = habits.filter(h => getEntry(h, todayKey).completed).length;
    return { total, done };
  }, [habits, todayKey]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 bg-background/60 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm text-foreground tracking-tight">Velvet</h1>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
        {/* Greeting + Month Picker Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {getGreeting()} ✨
            </h2>
            {habits.length > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {todayStats.done === todayStats.total && todayStats.total > 0
                  ? "All tasks done today — you're on fire!"
                  : `${todayStats.total - todayStats.done} task${todayStats.total - todayStats.done !== 1 ? 's' : ''} left today`
                }
              </p>
            )}
          </div>
          <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
        </motion.div>

        {/* Habit Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <HabitGrid year={year} month={month} habits={habits} onUpdate={handleUpdate} />
        </motion.div>

        {/* Contribution Heatmap */}
        {habits.length > 0 && (
          <ContributionHeatmap habits={habits} />
        )}
      </main>
    </div>
  );
};

export default Index;
