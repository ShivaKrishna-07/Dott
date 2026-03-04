import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, ListChecks, Check, Edit2 } from "lucide-react";
import { Habit, HabitEntry, getEntry, SubHabit } from "@/lib/habitStore";
import { ICON_MAP } from "@/lib/icons";

interface HabitModalProps {
  habit: Habit;
  dateKey: string;
  dateLabel: string;
  isPast: boolean;
  onClose: () => void;
  onSave: (entry: HabitEntry) => void;
}

// Pure functions for deep updates
function updateNode(nodes: SubHabit[], id: string, updater: (node: SubHabit) => SubHabit): SubHabit[] {
  return nodes.map(node => {
    if (node.id === id) return updater(node);
    if (node.subHabits) return { ...node, subHabits: updateNode(node.subHabits, id, updater) };
    return node;
  });
}

function deleteNode(nodes: SubHabit[], id: string): SubHabit[] {
  return nodes.filter(n => n.id !== id).map(n => {
    if (n.subHabits) return { ...n, subHabits: deleteNode(n.subHabits, id) };
    return n;
  });
}

function addChildNode(nodes: SubHabit[], parentId: string, newNode: SubHabit): SubHabit[] {
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, subHabits: [...(node.subHabits || []), newNode] };
    }
    if (node.subHabits) {
      return { ...node, subHabits: addChildNode(node.subHabits, parentId, newNode) };
    }
    return node;
  });
}

export function HabitModal({ habit, dateKey, dateLabel, isPast, onClose, onSave }: HabitModalProps) {
  const existing = getEntry(habit, dateKey);
  const [notes, setNotes] = useState(existing.notes);
  const [subHabits, setSubHabits] = useState<SubHabit[]>(existing.subHabits);
  const [newSubHabit, setNewSubHabit] = useState('');
  const [editingSubHabit, setEditingSubHabit] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const addTopLevelSubHabit = () => {
    if (!newSubHabit.trim()) return;
    setSubHabits([...subHabits, { id: crypto.randomUUID(), name: newSubHabit.trim(), completed: false }]);
    setNewSubHabit('');
  };

  const toggleSubHabit = (id: string) => {
    if (isPast) return;
    setSubHabits(updateNode(subHabits, id, s => ({ ...s, completed: !s.completed })));
  };

  const removeSubHabit = (id: string) => {
    if (isPast) return;
    setSubHabits(deleteNode(subHabits, id));
  };

  const updateSubHabitValue = (id: string, value: string) => {
    if (isPast) return;
    setSubHabits(updateNode(subHabits, id, s => ({ ...s, value })));
  };

  const startEditSubHabit = (sh: SubHabit) => {
    if (isPast) return;
    setEditingSubHabit({ id: sh.id, name: sh.name });
  };

  const saveEditSubHabit = () => {
    if (!editingSubHabit || !editingSubHabit.name.trim()) return;
    setSubHabits(updateNode(subHabits, editingSubHabit.id, s => ({ ...s, name: editingSubHabit.name.trim() })));
    setEditingSubHabit(null);
  };

  const addChildSubHabit = (parentId: string, name: string) => {
    if (!name.trim() || isPast) return;
    const newNode: SubHabit = { id: crypto.randomUUID(), name: name.trim(), completed: false };
    setSubHabits(addChildNode(subHabits, parentId, newNode));
  };

  const handleSave = (completed: boolean) => {
    onSave({
      date: dateKey,
      completed,
      notes,
      subHabits,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg glass-card shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/80 flex items-center justify-center">
                  {(() => {
                    const IconComponent = ICON_MAP[habit.icon as keyof typeof ICON_MAP] || ICON_MAP.target;
                    return <IconComponent className="w-5 h-5 text-foreground" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-semibold text-base text-foreground">{habit.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {existing.completed && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] font-medium text-success">Completed</span>
              </div>
            )}
            {isPast && !existing.completed && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
                <span className="text-[11px] font-medium text-muted-foreground">Incomplete (Past)</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto scrollbar-thin flex-1">
            {/* Sub-habits */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
                <ListChecks className="w-3.5 h-3.5" /> Sub-tasks
              </label>
              <div className="space-y-1.5">
                <AnimatePresence>
                  {subHabits.map(sh => (
                    <SubTaskNode
                      key={sh.id}
                      node={sh}
                      depth={0}
                      isPast={isPast}
                      editingSubHabit={editingSubHabit}
                      setEditingSubHabit={setEditingSubHabit}
                      toggleSubHabit={toggleSubHabit}
                      updateSubHabitValue={updateSubHabitValue}
                      startEditSubHabit={startEditSubHabit}
                      saveEditSubHabit={saveEditSubHabit}
                      removeSubHabit={removeSubHabit}
                      addChildSubHabit={addChildSubHabit}
                    />
                  ))}
                </AnimatePresence>
                {!isPast && (
                  <div className="flex gap-1.5 mt-2">
                    <input
                      value={newSubHabit}
                      onChange={e => setNewSubHabit(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTopLevelSubHabit()}
                      placeholder="Add sub-task..."
                      className="flex-1 px-3 py-2 rounded-xl bg-background border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      onClick={addTopLevelSubHabit}
                      className="px-3 py-2 rounded-xl border border-border/60 hover:bg-accent transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
               <label className="text-xs font-medium text-muted-foreground mb-2.5 block uppercase tracking-wider">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={isPast}
                placeholder="How did it go?"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none disabled:opacity-50 disabled:cursor-default"
              />
            </div>
          </div>

          {/* Footer */}
          {!isPast && (
            <div className="px-6 py-4 border-t border-border/60">
              {existing.completed ? (
                <button
                  onClick={() => handleSave(false)}
                  className="w-full py-2.5 rounded-xl border border-destructive/20 text-destructive font-medium text-sm hover:bg-destructive/10 transition-colors"
                >
                  Uncheck
                </button>
              ) : (
                <button
                  onClick={() => handleSave(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
                >
                  Mark Complete
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface SubTaskNodeProps {
  node: SubHabit;
  depth: number;
  isPast: boolean;
  editingSubHabit: { id: string; name: string } | null;
  setEditingSubHabit: (val: { id: string; name: string } | null) => void;
  toggleSubHabit: (id: string) => void;
  updateSubHabitValue: (id: string, val: string) => void;
  startEditSubHabit: (sh: SubHabit) => void;
  saveEditSubHabit: () => void;
  removeSubHabit: (id: string) => void;
  addChildSubHabit: (parentId: string, name: string) => void;
}

function SubTaskNode({
  node, depth, isPast, editingSubHabit, setEditingSubHabit,
  toggleSubHabit, updateSubHabitValue, startEditSubHabit, saveEditSubHabit,
  removeSubHabit, addChildSubHabit
}: SubTaskNodeProps) {
  const [newChildName, setNewChildName] = useState('');

  const handleAddChild = () => {
    addChildSubHabit(node.id, newChildName);
    setNewChildName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center gap-2.5 group">
        {/* Indent line visual indicator for nested items */}
        {depth > 0 && (
          <div className="w-3 border-b border-border/40 shrink-0 opacity-40" />
        )}
        
        <button
          onClick={() => toggleSubHabit(node.id)}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
            node.completed
              ? 'bg-foreground border-foreground'
              : 'border-border hover:border-muted-foreground'
          } ${isPast ? 'cursor-default' : ''}`}
        >
          {node.completed && (
            <Check className="w-3 h-3 text-background" strokeWidth={3} />
          )}
        </button>
        
        {editingSubHabit?.id === node.id ? (
          <input
            value={editingSubHabit.name}
            onChange={(e) => setEditingSubHabit({ ...editingSubHabit, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEditSubHabit();
              if (e.key === 'Escape') setEditingSubHabit(null);
            }}
            onBlur={saveEditSubHabit}
            autoFocus
            className="flex-1 px-2 py-1 text-sm bg-background border border-border/60 rounded focus:outline-none focus:ring-1 focus:ring-ring/50"
          />
        ) : (
          <span className={`text-sm flex-1 ${node.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {node.name}
          </span>
        )}

        <input
          value={node.value || ''}
          onChange={e => updateSubHabitValue(node.id, e.target.value)}
          disabled={isPast || !editingSubHabit && node.completed && !node.value}
          placeholder="Value..."
          className="w-[70px] px-2 py-1 text-[11px] bg-accent/30 border border-transparent hover:border-border/60 focus:bg-background focus:border-border/60 rounded focus:outline-none focus:ring-1 focus:ring-ring/20 transition-all disabled:opacity-50 text-right"
        />

        {!isPast && editingSubHabit?.id !== node.id && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => startEditSubHabit(node)}
              className="p-1 rounded-lg hover:bg-accent transition-all mr-0.5"
            >
              <Edit2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
            <button
              onClick={() => removeSubHabit(node.id)}
              className="p-1 rounded-lg hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        )}
      </div>

      {/* Render children array recursively */}
      {node.subHabits && node.subHabits.length > 0 && (
        <div className="flex flex-col gap-1.5 ml-3 border-l border-border/20 pl-2">
          {node.subHabits.map(child => (
            <SubTaskNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isPast={isPast}
              editingSubHabit={editingSubHabit}
              setEditingSubHabit={setEditingSubHabit}
              toggleSubHabit={toggleSubHabit}
              updateSubHabitValue={updateSubHabitValue}
              startEditSubHabit={startEditSubHabit}
              saveEditSubHabit={saveEditSubHabit}
              removeSubHabit={removeSubHabit}
              addChildSubHabit={addChildSubHabit}
            />
          ))}
        </div>
      )}

      {/* Add nested task inline if depth < 3 (4 levels total) */}
      {!isPast && depth < 3 && (
        <div className={`flex gap-1.5 opacity-0 focus-within:opacity-100 hover:opacity-100 transition-opacity ${depth > 0 ? 'ml-6' : 'ml-2'} mt-1`}>
          <input
            value={newChildName}
            onChange={e => setNewChildName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddChild()}
            placeholder="Add nested task..."
            className="flex-1 px-2 py-1 bg-transparent border-b border-border/20 text-muted-foreground text-[10px] focus:outline-none focus:border-border focus:text-foreground transition-colors"
          />
          {newChildName.trim() && (
            <button
              onClick={handleAddChild}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
