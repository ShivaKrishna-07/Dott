import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
    <div className="flex items-center gap-1">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <span className="text-sm font-medium text-foreground min-w-[100px] text-center tabular-nums">
        {MONTHS[month]} {year}
      </span>
      <button
        onClick={next}
        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
