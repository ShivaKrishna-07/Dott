import { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, PenLine } from "lucide-react";
import { ICON_MAP, IconName } from "@/lib/icons";
import { Habit, SubHabit } from "@/lib/habitStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICONS: IconName[] = [
  'activity', 'book', 'brain', 'droplets', 'dumbbell',
  'heart', 'moon', 'music', 'palette', 'pen', 'sprout',
  'sun', 'wallet', 'zap', 'coffee', 'target', 'flame',
  'utensils', 'smile', 'briefcase'
];

const TEMPLATES: { name: string, icon: IconName, category: string, defaultSubHabits?: Omit<SubHabit, 'id'>[], target?: number, unit?: string }[] = [
  { name: "Practice English", icon: "book", category: "Learning", defaultSubHabits: [{ name: "Minutes practiced", completed: false }] },
  { name: "Morning Run", icon: "activity", category: "Fitness", target: 3, unit: "km" },
  { name: "Meditate", icon: "sprout", category: "Mindfulness", target: 10, unit: "minutes" },
  { name: "Read 30 min", icon: "book", category: "Learning", target: 30, unit: "pages" },
  { name: "Drink Water", icon: "droplets", category: "Health", target: 8, unit: "glasses" },
  { name: "Journal", icon: "pen", category: "Mindfulness", target: 1, unit: "session" },
  { name: "No Sugar", icon: "target", category: "Health" },
  { name: "Workout", icon: "dumbbell", category: "Fitness", target: 45, unit: "minutes" },
  { name: "Sleep 8h", icon: "moon", category: "Health", target: 8, unit: "hours" },
  { name: "Practice Music", icon: "music", category: "Creative", target: 30, unit: "minutes" },
  { name: "Learn Language", icon: "brain", category: "Learning", target: 15, unit: "minutes" },
  { name: "Eat Healthy", icon: "utensils", category: "Health" },
  { name: "Save Money", icon: "wallet", category: "Finance" },
  { name: "Wake Up Early", icon: "sun", category: "Productivity" },
  { name: "Clean Room", icon: "zap", category: "Productivity" },
  { name: "Draw / Paint", icon: "palette", category: "Creative", target: 1, unit: "session" },
  { name: "Take Vitamins", icon: "heart", category: "Health" },
];

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (name: string, icon: string, defaultSubHabits?: SubHabit[], target?: number, unit?: string) => void;
  habitToEdit?: Habit;
  onUpdate?: (habit: Habit) => void;
}

export function AddHabitModal({ onClose, onAdd, habitToEdit, onUpdate }: AddHabitModalProps) {
  const isEditing = !!habitToEdit;
  const [name, setName] = useState(habitToEdit?.name || '');
  const [icon, setIcon] = useState<IconName>((habitToEdit?.icon as IconName) || 'target');
  const [tab, setTab] = useState<'templates' | 'custom'>(isEditing ? 'custom' : 'templates');
  const [target, setTarget] = useState(habitToEdit?.target?.toString() || '');
  const [unit, setUnit] = useState(habitToEdit?.unit || 'session');
  const [isCustomUnit, setIsCustomUnit] = useState(!!habitToEdit?.unit && !['session', 'minutes', 'hours', 'pages', 'glasses', 'miles', 'km'].includes(habitToEdit.unit));

  const handleSubmit = () => {
    if (!name.trim()) return;
    const parsedTarget = target ? parseFloat(target) : undefined;
    const finalUnit = parsedTarget ? unit.trim() || 'session' : undefined;
    
    if (isEditing && onUpdate && habitToEdit) {
      onUpdate({
        ...habitToEdit,
        name: name.trim(),
        icon,
        target: parsedTarget,
        unit: finalUnit
      });
    } else {
      onAdd(name.trim(), icon, undefined, parsedTarget, finalUnit);
    }
    onClose();
  };

  const handleTemplate = (template: typeof TEMPLATES[0]) => {
    let subHabits: SubHabit[] | undefined = undefined;
    if (template.defaultSubHabits) {
      subHabits = template.defaultSubHabits.map(sh => ({ ...sh, id: crypto.randomUUID() }));
    }
    onAdd(template.name, template.icon, subHabits, template.target, template.unit);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-md glass-card shadow-2xl overflow-hidden sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl max-h-[90vh] sm:max-h-none"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-base text-foreground">{isEditing ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          {!isEditing && (
            <div className="flex gap-1 p-1 bg-accent/50 rounded-xl relative z-0">
              <button
                onClick={() => setTab('templates')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  tab === 'templates'
                    ? 'text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/10'
                }`}
              >
                {tab === 'templates' && (
                  <motion.div
                    layoutId="add-modal-tab-indicator"
                    className="absolute inset-0 bg-foreground rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Sparkles className="w-3.5 h-3.5" />
                Templates
              </button>
              <button
                onClick={() => setTab('custom')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  tab === 'custom'
                    ? 'text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/10'
                }`}
              >
                {tab === 'custom' && (
                  <motion.div
                    layoutId="add-modal-tab-indicator"
                    className="absolute inset-0 bg-foreground rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <PenLine className="w-3.5 h-3.5" />
                Custom
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {tab === 'templates' ? (
            <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
              {TEMPLATES.map((t, i) => (
                <motion.button
                  key={t.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleTemplate(t)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-accent hover:border-border transition-all text-left group"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-background flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform text-foreground">
                    {(() => {
                      const IconItem = ICON_MAP[t.icon] || ICON_MAP.target;
                      return <IconItem className="w-5 h-5" />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.category}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(iName => {
                    const IconComp = ICON_MAP[iName];
                    return (
                      <button
                        key={iName}
                        onClick={() => setIcon(iName)}
                        className={`p-2.5 rounded-xl transition-all ${
                          icon === iName ? 'bg-accent ring-2 ring-foreground/20' : 'hover:bg-accent border border-transparent hover:border-border/50'
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${icon === iName ? 'text-foreground' : 'text-muted-foreground'}`} />
                      </button>
                    );
                  })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Target</label>
                  <input
                    type="number"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    placeholder="e.g. 1"
                    min="0"
                    step="0.1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Unit</label>
                  {!isCustomUnit ? (
                    <Select
                      value={unit}
                      onValueChange={val => {
                        if (val === 'custom') {
                          setIsCustomUnit(true);
                          setUnit('');
                        } else {
                          setUnit(val);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full px-3.5 py-2.5 h-[42px] rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border/50 shadow-md">
                        <SelectItem value="session" className="rounded-lg">session</SelectItem>
                        <SelectItem value="minutes" className="rounded-lg">minutes</SelectItem>
                        <SelectItem value="hours" className="rounded-lg">hours</SelectItem>
                        <SelectItem value="pages" className="rounded-lg">pages</SelectItem>
                        <SelectItem value="glasses" className="rounded-lg">glasses</SelectItem>
                        <SelectItem value="miles" className="rounded-lg">miles</SelectItem>
                        <SelectItem value="km" className="rounded-lg">km</SelectItem>
                        <SelectItem value="custom" className="rounded-lg font-medium text-primary">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <input
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      placeholder="e.g. chapters"
                      autoFocus
                      onBlur={() => !unit.trim() && setIsCustomUnit(false)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full py-2.5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                {isEditing ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
