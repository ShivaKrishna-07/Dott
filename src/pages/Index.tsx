import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MonthPicker } from "@/components/MonthPicker";
import { HabitGrid } from "@/components/HabitGrid";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { Habit, loadHabits, loadHabitsCloud, saveHabitsCloud, formatDateKey, getEntry } from "@/lib/habitStore";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { LogOut, Orbit, LayoutList, FileText } from "lucide-react";
import { Note, loadNotesCloud, saveNoteCloud, deleteNoteCloud } from "@/lib/noteStore";
import { NotesPage } from "@/components/NotesPage";

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'notes' ? 'notes' : 'tasks';

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
      
      const cloudNotes = await loadNotesCloud(user.uid);
      setNotes(cloudNotes);
    };

    initializeData();
  }, [user]);

  const handleSaveNote = async (note: Note) => {
    if (!user) return;
    try {
      await saveNoteCloud(note);
      setNotes(await loadNotesCloud(user.uid));
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Failed to save note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      await deleteNoteCloud(noteId);
      setNotes(await loadNotesCloud(user.uid));
      toast("Note deleted");
    } catch (err) {
      console.error("Failed to delete note:", err);
      toast.error("Failed to delete note");
    }
  };

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
            <img src="/dott.jpg" alt="Dott Logo" className="w-7 h-7 rounded-lg object-cover" />
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

      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header Row: Tabs + MonthPicker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          {/* Tabs */}
          <div className="flex bg-card/50 p-1 rounded-xl border border-border/60 w-full sm:w-max">
            <button
              onClick={() => setSearchParams({ tab: 'tasks' })}
              className={`flex-1 sm:flex-none flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tasks' 
                  ? 'bg-foreground text-background shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              Tasks
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'notes' })}
              className={`flex-1 sm:flex-none flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notes' 
                  ? 'bg-foreground text-background shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Notes
            </button>
          </div>

          {/* Month Picker - only show on Tasks tab */}
          {activeTab === 'tasks' && (
            <div className="flex justify-end w-full sm:w-auto">
              <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
            </div>
          )}
        </div>

        {activeTab === 'tasks' ? (
          <>
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
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {user && (
              <NotesPage
                userId={user.uid}
                notes={notes}
                onUpdateNotes={setNotes}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
