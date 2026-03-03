import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const EMOJIS = ['💪', '📚', '🧘', '🏃', '💧', '🎨', '✍️', '🎵', '🧠', '😴', '🥗', '💊', '🚫', '🌅', '🧹', '💰'];

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (name: string, emoji: string) => void;
}

export function AddHabitModal({ onClose, onAdd }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), emoji);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base text-foreground">New Habit</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-lg p-2 rounded-xl transition-all ${
                    emoji === e ? 'bg-accent ring-1 ring-border scale-110' : 'hover:bg-accent'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Meditate, Read, Exercise..."
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            Add Habit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
