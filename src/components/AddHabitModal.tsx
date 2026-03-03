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
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-popover border border-border rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg text-foreground">New Habit</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-2 rounded-xl transition-all ${
                    emoji === e ? 'bg-primary/15 ring-2 ring-primary/30 scale-110' : 'hover:bg-secondary'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Habit Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Meditate, Read, Exercise..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Add Habit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
