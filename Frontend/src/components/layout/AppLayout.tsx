import { Home, LogOut, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/expenses", label: "Daily expenses", icon: ReceiptText },
    { to: "/profiles", label: "Profiles", icon: UserRound },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/82 shadow-sm shadow-slate-200/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Family Tracker</p>
              <h1 className="text-lg font-semibold">Household Expense Hub</h1>
            </div>
            <Button className="lg:hidden" variant="ghost" size="icon" onClick={logout} aria-label="Log out">
              <LogOut />
            </Button>
          </div>

          <nav className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <Badge variant="muted">{user?.role}</Badge>
            </div>
            <img src={user?.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
