import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="absolute top-4 right-4"
    >
      {theme === "light" ? (
        <Moon className="h-6 w-6 text-game-background" />
      ) : (
        <Sun className="h-6 w-6 text-game-accent" />
      )}
    </Button>
  );
}