import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MonthPicker } from "@/components/MonthPicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HabitGrid } from "@/components/HabitGrid";
import { Habit, loadHabits, saveHabits } from "@/lib/habitStore";

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

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✦</span>
            <h1 className="font-display font-bold text-xl text-foreground tracking-tight">Habits</h1>
          </div>
          <div className="flex items-center gap-3">
            <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HabitGrid year={year} month={month} habits={habits} onUpdate={handleUpdate} />
        </motion.div>

        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <p className="text-4xl mb-4">✦</p>
            <p className="text-muted-foreground font-display">Add your first habit to start tracking</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
