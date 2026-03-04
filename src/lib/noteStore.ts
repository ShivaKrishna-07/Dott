import { collection, doc, getDocs, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const NOTES_COLLECTION = 'notes';

export function createNote(userId: string, title: string = '', content: string = ''): Note {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    title,
    content,
    isPinned: false,
    color: 'default',
    createdAt: now,
    updatedAt: now,
  };
}

export async function loadNotesCloud(userId: string): Promise<Note[]> {
  try {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const notes = snapshot.docs.map(d => d.data() as Note);
    // Sort client-side to avoid requiring a Firebase composite index for userId + updatedAt
    return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (err) {
    console.error('Error loading notes:', err);
    return [];
  }
}

export async function saveNoteCloud(note: Note): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, note.id);
  await setDoc(docRef, note);
}

export async function deleteNoteCloud(noteId: string): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(docRef);
}

export function formatNoteDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}
