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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
              <span className="text-background text-xs font-bold">H</span>
            </div>
            <h1 className="font-semibold text-sm text-foreground tracking-tight">Habits</h1>
          </div>
          <div className="flex items-center gap-2">
            <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
            <div className="w-px h-5 bg-border" />
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
        >
          <HabitGrid year={year} month={month} habits={habits} onUpdate={handleUpdate} />
        </motion.div>

        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-24"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <span className="text-muted-foreground text-lg">+</span>
            </div>
            <p className="text-muted-foreground text-sm">Add your first habit to start tracking</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
