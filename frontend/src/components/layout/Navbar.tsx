import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Droplets, Moon, Sun, Wifi, WifiOff, LayoutDashboard, History } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/cn";
import type { ConnectionState } from "@/types/sensor";

interface NavbarProps {
  apiStatus: ConnectionState;
}

export function Navbar({ apiStatus }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = apiStatus === "online";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
            <Droplets className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-foreground sm:text-base">Smart Water Tank</p>
            <p className="hidden text-xs text-muted-foreground sm:block">Monitoring &amp; Leak Detection</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-xl bg-muted p-1 text-sm font-medium md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors",
                isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors",
                isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <History className="h-4 w-4" />
            History
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:flex",
              isOnline
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger",
            )}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isOnline ? "Connected" : "Disconnected"}
          </div>

          <div className="hidden text-right text-xs leading-tight text-muted-foreground lg:block">
            <p className="font-mono text-sm font-semibold text-foreground">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p>{now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</p>
          </div>

          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Toggle dark mode" />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
