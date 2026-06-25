import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  LogOut, 
  Globe, 
  Menu, 
  X,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      path: "/admin",
      name: "Dashboard",
      icon: LayoutDashboard
    },
    {
      path: "/admin/parks",
      name: "Parklarni boshqarish",
      icon: MapIcon
    },
    {
      path: "/admin/users",
      name: "Foydalanuvchilar",
      icon: Users
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userInitials = user?.displayName
    ? user.displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email ? user.email.slice(0, 2).toUpperCase() : "AD";

  return (
    <div className="min-h-screen bg-background text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-strong border-r border-white/5 p-6 shrink-0 relative z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">
            Tashkent<span className="text-gradient">360</span> Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-[0_0_20px_rgba(20,184,166,0.25)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-accent hover:bg-accent/10 transition-all border border-accent/10 hover:border-accent/20"
          >
            <Globe className="w-5 h-5" />
            Asosiy saytga o'tish
          </Link>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-primary/20 text-accent text-xs font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate leading-tight">{user?.displayName || "Admin"}</p>
              <p className="text-[10px] text-white/50 truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              title="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Header - Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 glass border-b border-white/5 relative z-30">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent" />
            <span className="font-display font-bold">
              Tashkent<span className="text-accent">360</span> Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[65px] bg-background/95 backdrop-blur-md z-20 flex flex-col p-6 border-t border-white/5">
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-sm font-semibold text-accent bg-accent/5 border border-accent/10"
              >
                <Globe className="w-5 h-5" />
                Asosiy saytga o'tish
              </Link>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/20 text-accent text-xs font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold leading-tight">{user?.displayName}</p>
                    <p className="text-xs text-white/50 leading-tight mt-0.5">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
