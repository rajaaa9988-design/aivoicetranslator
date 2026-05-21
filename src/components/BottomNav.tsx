import { Link, useLocation } from "@tanstack/react-router";
import { Mic, MessagesSquare, History, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Translate", icon: Mic },
  { to: "/conversation", label: "Talk", icon: MessagesSquare },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={[
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium transition",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-xl transition",
                    active ? "bg-primary/15 text-primary glow-primary" : "",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
