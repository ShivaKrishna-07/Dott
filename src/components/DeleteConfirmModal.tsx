import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ habitName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-6"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="font-semibold text-base text-foreground mb-1">Delete Habit</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Are you sure you want to delete <span className="font-medium text-foreground">"{habitName}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
