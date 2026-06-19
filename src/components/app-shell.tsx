"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Code2,
  Crown,
  Flame,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Trophy,
  User
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: BookOpen },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/interview", label: "Mock Interview", icon: Bot },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/admin", label: "Admin", icon: Shield }
];

export function AppShell({
  children,
  user
}: {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    xp: number;
    level: number;
    currentStreak: number;
  };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleNav = navItems.filter((item) => item.href !== "/admin" || user.role === "ADMIN");

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r bg-card transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">DSA Mentor AI</p>
            <p className="text-xs text-muted-foreground">Practice. Review. Grow.</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open ? <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-semibold leading-tight">{user.name || "DSA learner"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm sm:flex">
              <Crown className="h-4 w-4 text-amber-600" />
              Level {user.level}
            </div>
            <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm sm:flex">
              <Flame className="h-4 w-4 text-rose-600" />
              {user.currentStreak} day streak
            </div>
            <Avatar src={user.image} name={user.name} email={user.email} />
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => signOut({ callbackUrl: "/sign-in" })}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
