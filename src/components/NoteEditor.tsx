import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff, Trash2, X } from 'lucide-react';
import { Note, formatNoteDate } from '@/lib/noteStore';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onClose: () => void;
}

export function NoteEditor({ note, onSave, onDelete, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const isNew = !note.title && !note.content;

  // Auto-focus content on new note
  useEffect(() => {
    if (isNew && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isNew]);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSaveClick = () => {
    let finalTitle = title.trim();
    const trimmedContent = content.trim();

    // Don't save empty notes if it's new
    if (!finalTitle && !trimmedContent && isNew) {
      onClose();
      return;
    }
    
    // If we have content but no title, fallback
    if (!finalTitle && trimmedContent) {
      finalTitle = 'Untitled';
    }

    onSave({
      ...note,
      title: finalTitle,
      content: trimmedContent,
      isPinned,
      color: 'default',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCancelClick = () => {
    onClose();
  };

  const handleDelete = () => {
    onDelete(note.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleCancelClick} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full sm:max-w-lg bg-card border border-border/60 shadow-2xl overflow-hidden sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl h-[80vh] sm:h-auto sm:max-h-[85vh] flex flex-col"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <span className="text-sm font-medium text-muted-foreground">{isNew ? 'New Note' : 'Edit Note'}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              title={isPinned ? "Unpin note" : "Pin note"}
            >
              {isPinned ? (
                <Pin className="w-4.5 h-4.5 text-foreground" fill="currentColor" />
              ) : (
                <PinOff className="w-4.5 h-4.5 text-muted-foreground" />
              )}
            </button>
            {!isNew && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4.5 h-4.5 text-muted-foreground hover:text-destructive" />
              </button>
            )}
            <button
              onClick={handleCancelClick}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-1"
              title="Close"
            >
              <X className="w-4.5 h-4.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-xl font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
          />
          <textarea
            ref={contentRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full text-sm text-foreground/90 bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-muted-foreground/40 min-h-[150px]"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
            <span>{isNew ? 'Draft' : `Edited ${formatNoteDate(note.updatedAt)}`}</span>
            <span>•</span>
            <span>{content.length} chars</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors flex-1 sm:flex-none border border-border/60"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={!title.trim() && !content.trim()}
              className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex-1 sm:flex-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>

        {/* Delete confirmation overlay */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="text-center space-y-4 px-6">
              <p className="text-sm text-foreground font-medium">Delete this note?</p>
              <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-border/60 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
