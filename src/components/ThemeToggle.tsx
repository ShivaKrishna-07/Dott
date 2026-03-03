import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-1.5 rounded-lg hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-3.5 h-3.5 text-muted-foreground" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}
