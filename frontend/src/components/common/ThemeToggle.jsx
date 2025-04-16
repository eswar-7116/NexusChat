import { useEffect } from "react";
import { Sun, Moon } from 'lucide-react';
import { useAuthStore } from "../../stores/authStore";

function ThemeToggle() {
  const { theme, changeTheme } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button
      onClick={changeTheme}
      className="btn btn-ghost btn-circle hover:bg-base-300 scale-105 transform transition-transform duration-300 hover:scale-120"
      aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === 'dark' ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  )
}

export default ThemeToggle;