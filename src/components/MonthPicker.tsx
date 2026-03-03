import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthPickerProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  const prev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };
  const next = () => {
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={prev}
        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </motion.button>
      <motion.span
        key={`${year}-${month}`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display font-semibold text-foreground min-w-[160px] text-center"
      >
        {MONTHS[month]} {year}
      </motion.span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={next}
        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </motion.button>
    </div>
  );
}
