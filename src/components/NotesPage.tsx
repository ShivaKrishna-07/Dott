import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pin, FileText } from 'lucide-react';
import { Note, createNote, formatNoteDate } from '@/lib/noteStore';
import { NoteEditor } from './NoteEditor';

interface NotesPageProps {
  userId: string;
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
  onSaveNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesPage({ userId, notes, onUpdateNotes, onSaveNote, onDeleteNote }: NotesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    
    // Sort: Pinned first, then by updatedAt descending
    return result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery]);

  const handleCreateNote = () => {
    const newNote = createNote(userId);
    setEditingNote(newNote);
  };

  const handleSave = (note: Note) => {
    onSaveNote(note);
    setEditingNote(null);
  };

  const handleDelete = (noteId: string) => {
    onDeleteNote(noteId);
    setEditingNote(null);
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Header & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:bg-card transition-all"
          />
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Note</span>
        </button>
      </div>

      {/* Notes List / Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 px-4 glass-card border-dashed flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-sm mb-6 max-w-[250px]">
            {searchQuery ? "No notes found matching your search." : "You don't have any notes yet. Create your first note below."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setEditingNote(note)}
                className="group relative px-4 py-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border/50 bg-card/40 hover:bg-card/80 transition-all cursor-pointer flex flex-col gap-1.5 sm:gap-3"
              >
                {/* Header Row */}
                <div className="flex items-center sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-medium sm:font-semibold text-foreground text-base truncate sm:pr-4">
                      {note.title || <span className="text-muted-foreground/60 font-normal italic">Untitled</span>}
                    </h3>
                    {note.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-foreground shrink-0 sm:absolute sm:top-5 sm:right-5" fill="currentColor" />
                    )}
                  </div>
                  <span className="text-xs sm:text-[10px] sm:uppercase sm:font-mono sm:tracking-wider text-muted-foreground/80 sm:text-muted-foreground/60 whitespace-nowrap shrink-0 sm:absolute sm:bottom-4 sm:left-5">
                    {formatNoteDate(note.updatedAt)}
                  </span>
                </div>
                
                {/* Content */}
                <p className="text-[13px] sm:text-sm leading-relaxed text-muted-foreground sm:text-foreground/80 line-clamp-2 sm:line-clamp-4 sm:min-h-[40px] break-words sm:pb-6">
                  {note.content || <span className="opacity-50 italic">Empty note</span>}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Note Editor Modal */}
      <AnimatePresence>
        {editingNote && (
          <NoteEditor
            note={editingNote}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setEditingNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
