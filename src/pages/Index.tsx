import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MonthPicker } from "@/components/MonthPicker";
import { HabitGrid } from "@/components/HabitGrid";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { Habit, saveHabitCloud, deleteHabitCloud, createHabit, formatDateKey, getEntry, onHabitsSnapshot } from "@/lib/habitStore";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { LogOut, Orbit, LayoutList, FileText, Download, User, Loader2 } from "lucide-react";
import { Note, saveNoteCloud, deleteNoteCloud, onNotesSnapshot } from "@/lib/noteStore";
import { NotesPage } from "@/components/NotesPage";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'notes' ? 'notes' : 'tasks';
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPrompt || null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    setLoadingHabits(true);
    const unsubscribeHabits = onHabitsSnapshot(user.uid, (data) => {
      setHabits(data);
      setLoadingHabits(false);
    });

    setLoadingNotes(true);
    const unsubscribeNotes = onNotesSnapshot(user.uid, (data) => {
      setNotes(data);
      setLoadingNotes(false);
    });

    return () => {
      unsubscribeHabits();
      unsubscribeNotes();
    };
  }, [user]);

  const handleSaveNote = async (note: Note) => {
    if (!user) return;
    try {
      await saveNoteCloud(note);
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Failed to save note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      await deleteNoteCloud(noteId);
      toast("Note deleted");
    } catch (err) {
      console.error("Failed to delete note:", err);
      toast.error("Failed to delete note");
    }
  };

  const handleAdd = async (name: string, icon: string, defaultSubHabits?: any[], target?: number, unit?: string) => {
    if (!user) return;
    const newHabit = createHabit(user.uid, name, icon, defaultSubHabits, target, unit);
    // Optimistic UI update
    setHabits([...habits, newHabit]);
    try {
      await saveHabitCloud(newHabit);
      toast.success(`${name} added!`);
    } catch (err) {
      console.error("Failed to save to cloud:", err);
      toast.error(`Failed to add ${name}`);
    }
  };

  const handleUpdateHabit = async (updated: Habit) => {
    if (!user) return;
    setHabits(habits.map(h => h.id === updated.id ? updated : h));
    try {
      await saveHabitCloud(updated);
    } catch (err) {
      console.error("Failed to save to cloud:", err);
      toast.error(`Failed to update ${updated.name}`);
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!user) return;
    const habitName = habits.find(h => h.id === habitId)?.name;
    setHabits(habits.filter(h => h.id !== habitId));
    try {
      await deleteHabitCloud(habitId);
      if (habitName) toast(`${habitName} deleted`);
    } catch (err) {
      console.error("Failed to delete from cloud:", err);
      toast.error(`Failed to delete task`);
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
          <div className="flex items-center gap-3">
            <img src="/dott.jpg" alt="Dott Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <div>
              <h1 className="font-semibold text-lg text-foreground tracking-tight">Dott</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-border/80 transition-all focus:outline-none focus:ring-2 focus:ring-ring">
                    <Avatar className="w-8 h-8 rounded-full border border-border/50 shadow-sm">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-accent text-xs">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-muted-foreground" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 glass-card border-border/40 p-1 rounded-xl shadow-xl">
                  <div className="flex items-center gap-3 px-2 py-1.5 focus:outline-none">
                    <Avatar className="w-9 h-9 border border-border/50 shadow-sm">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-accent">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-muted-foreground" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium text-foreground leading-none truncate mb-1.5">{user.displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground leading-none truncate">{user.email || ""}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border/40 my-1 mx-1" />
                  {deferredPrompt && (
                    <>
                      <DropdownMenuItem 
                        onClick={handleInstallClick}
                        className="flex items-center gap-2 cursor-pointer text-sm font-medium focus:bg-accent focus:text-accent-foreground rounded-lg py-1.5 px-2.5"
                      >
                        <Download className="w-4 h-4 ml-0.5 text-muted-foreground" />
                        Download App
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/40 my-1 mx-1" />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={() => {
                      signOut(auth);
                      toast.success("Logged out successfully");
                    }}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium focus:bg-destructive/10 focus:text-destructive text-destructive rounded-lg py-1.5 px-2.5"
                  >
                    <LogOut className="w-4 h-4 ml-0.5" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </motion.header>

      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header Row: Tabs + MonthPicker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          {/* Tabs */}
          <div className="flex bg-card/50 p-1 rounded-xl border border-border/60 w-full sm:w-max relative">
            <button
              onClick={() => setSearchParams({ tab: 'tasks' })}
              className={`relative z-10 flex-1 sm:flex-none flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'tasks' 
                  ? 'text-background' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {activeTab === 'tasks' && (
                <motion.div
                  layoutId="main-tab-indicator"
                  className="absolute inset-0 bg-foreground rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <LayoutList className="w-4 h-4" />
              Tasks
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'notes' })}
              className={`relative z-10 flex-1 sm:flex-none flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'notes' 
                  ? 'text-background' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {activeTab === 'notes' && (
                <motion.div
                  layoutId="main-tab-indicator"
                  className="absolute inset-0 bg-foreground rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <FileText className="w-4 h-4" />
              Notes
            </button>
          </div>

          {/* Month Picker - only show on Tasks tab */}
          {activeTab === 'tasks' && (
            <div className="flex justify-center sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
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
              {loadingHabits ? (
                <div className="flex flex-col items-center justify-center p-16 text-center glass-card">
                  <Loader2 className="w-8 h-8 text-foreground/50 animate-spin mb-4" />
                  <p className="text-sm font-medium text-foreground">Loading Tasks...</p>
                </div>
              ) : (
                <HabitGrid 
                  year={year} 
                  month={month} 
                  habits={habits} 
                  onAdd={handleAdd}
                  onUpdateHabit={handleUpdateHabit}
                  onDelete={handleDelete}
                />
              )}
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
            {loadingNotes ? (
              <div className="flex flex-col items-center justify-center p-16 text-center glass-card">
                <Loader2 className="w-8 h-8 text-foreground/50 animate-spin mb-4" />
                <p className="text-sm font-medium text-foreground">Loading Notes...</p>
              </div>
            ) : user && (
              <NotesPage
                userId={user.uid}
                notes={notes}
                // No need to update local state; snapshot handles it
                onUpdateNotes={() => {}}
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
