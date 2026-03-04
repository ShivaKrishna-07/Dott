import { motion } from "framer-motion";
import { Trophy, Star, Crown, Gem, Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md";
}

const MILESTONES = [
  { min: 100, label: "Legendary", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/30" },
  { min: 60, label: "Diamond", icon: Gem, color: "text-cyan-400", bg: "bg-cyan-500/15", ring: "ring-cyan-500/30" },
  { min: 30, label: "Gold", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/15", ring: "ring-yellow-500/30" },
  { min: 14, label: "Silver", icon: Star, color: "text-slate-300", bg: "bg-slate-500/15", ring: "ring-slate-500/30" },
  { min: 7, label: "Bronze", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/15", ring: "ring-orange-500/30" },
];

export function StreakBadge({ streak, size = "sm" }: StreakBadgeProps) {
  if (streak < 7) return null;

  const milestone = MILESTONES.find(m => streak >= m.min);
  if (!milestone) return null;

  const Icon = milestone.icon;
  const isSmall = size === "sm";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 ${
        isSmall ? 'px-1.5 py-0.5' : 'px-2 py-1'
      } rounded-full ${milestone.bg} ring-1 ${milestone.ring}`}
    >
      <Icon className={`${isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} ${milestone.color}`} />
      {!isSmall && (
        <span className={`text-[10px] font-medium ${milestone.color}`}>
          {milestone.label}
        </span>
      )}
    </motion.div>
  );
}

export function getStreakMilestoneLabel(streak: number): string | null {
  const milestone = MILESTONES.find(m => streak >= m.min);
  return milestone?.label ?? null;
}
