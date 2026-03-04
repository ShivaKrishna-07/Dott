import { 
  Activity, BookOpen, Brain, Droplets, Dumbbell, 
  Heart, Moon, Music, Palette, PenTool, Sprout, 
  Sun, Wallet, Zap, Coffee, CheckCircle, Target, 
  Flame, Utensils, Smile, Briefcase
} from "lucide-react";

export const ICON_MAP = {
  activity: Activity,
  book: BookOpen,
  brain: Brain,
  droplets: Droplets,
  dumbbell: Dumbbell,
  heart: Heart,
  moon: Moon,
  music: Music,
  palette: Palette,
  pen: PenTool,
  sprout: Sprout,
  sun: Sun,
  wallet: Wallet,
  zap: Zap,
  coffee: Coffee,
  check: CheckCircle,
  target: Target,
  flame: Flame,
  utensils: Utensils,
  smile: Smile,
  briefcase: Briefcase
} as const;

export type IconName = keyof typeof ICON_MAP;
