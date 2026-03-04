import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthPickerProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const prev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };
  const next = () => {
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };

  const handleMonthSelect = (m: number) => {
    onChange(pickerYear, m);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setPickerYear(year);
    setOpen(isOpen);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground tabular-nums">
              {FULL_MONTHS[month]} {year}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          {/* Year selector */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setPickerYear(y => y - 1)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {pickerYear}
            </span>
            <button
              onClick={() => setPickerYear(y => y + 1)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {MONTHS.map((name, idx) => {
              const isSelected = idx === month && pickerYear === year;
              return (
                <button
                  key={name}
                  onClick={() => handleMonthSelect(idx)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <button
        onClick={next}
        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
