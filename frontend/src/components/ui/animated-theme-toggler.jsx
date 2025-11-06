import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export function AnimatedThemeToggler() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          backgroundColor: theme === "light" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="absolute left-1 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md"
        initial={false}
        animate={{
          x: theme === "light" ? 0 : 40,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: theme === "light" ? 1 : 0,
            opacity: theme === "light" ? 1 : 0,
            rotate: theme === "light" ? 0 : 180,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="h-4 w-4 text-foreground" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            opacity: theme === "dark" ? 1 : 0,
            rotate: theme === "dark" ? 0 : -180,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="h-4 w-4 text-foreground" />
        </motion.div>
      </motion.div>
    </button>
  );
}
