import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-4 h-4 text-foreground" /> : <Moon className="w-4 h-4 text-foreground" />}
    </motion.button>
  );
}
