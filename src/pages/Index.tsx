import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MonthPicker } from "@/components/MonthPicker";
import { HabitGrid } from "@/components/HabitGrid";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { Habit, loadHabits, loadHabitsCloud, saveHabitsCloud, formatDateKey, getEntry } from "@/lib/habitStore";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { LogOut, Orbit } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

const Index = () => {
  const [user] = useAuthState(auth);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!user) return;

    const initializeData = async () => {
      let cloudHabits = await loadHabitsCloud(user.uid);
      const localHabits = loadHabits();

      // Migrate local to cloud if cloud is empty and local has data
      if (cloudHabits.length === 0 && localHabits.length > 0) {
        toast.info("Syncing your local habits to the cloud...");
        await saveHabitsCloud(user.uid, localHabits);
        cloudHabits = localHabits;
      }

      setHabits(cloudHabits);
    };

    initializeData();
  }, [user]);

  const handleUpdate = (updated: Habit[]) => {
    setHabits(updated);
    if (user) {
      saveHabitsCloud(user.uid, updated).catch(err => {
        console.error("Failed to save to cloud:", err);
      });
    }
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
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground/10 border border-border/60 flex items-center justify-center">
              <Orbit className="w-4 h-4 text-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-foreground tracking-tight">Dott</h1>
            </div>
          </div>
          <button
            onClick={() => {
              signOut(auth);
              toast.success("Signed out successfully");
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </motion.header>

      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Greeting + Month Picker Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
