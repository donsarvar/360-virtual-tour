import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const ADMIN_EMAIL = "salimovsarvar21@gmail.com";

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent" />
          <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
        </div>
        <p className="text-white/70 text-sm font-display tracking-widest uppercase animate-pulse">
          Xavfsizlik tekshirilmoqda...
        </p>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="glass-strong rounded-[2.5rem] p-8 sm:p-12 w-full max-w-md border border-white/10 shadow-2xl text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6 border border-accent/20 text-accent">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            Admin Panelga Kirish
          </h1>
          <p className="text-white/60 text-sm font-body mb-8">
            Ushbu bo'limga kirish faqat adminlar uchun ruxsat etilgan. Iltimos, tizimga kiring.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={loginWithGoogle}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full py-6 font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform glow-pulse"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google orqali kirish
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="w-full border-white/10 hover:bg-white/5 text-white rounded-full py-6 font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <Home className="w-4 h-4" />
              Bosh sahifaga qaytish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in but is NOT the admin
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="glass-strong rounded-[2.5rem] p-8 sm:p-12 w-full max-w-md border border-red-500/20 shadow-2xl text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 text-red-400">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            Ruxsat berilmagan!
          </h1>
          <p className="text-white/60 text-sm font-body mb-2">
            Siz tizimga muvaffaqiyatli kirdingiz:
          </p>
          <p className="text-accent text-sm font-semibold font-body mb-4">
            {user.email}
          </p>
          <p className="text-white/40 text-xs font-body mb-8 max-w-xs">
            Lekin bu email admin ro'yxatida yo'q. Faqat <strong>{ADMIN_EMAIL}</strong> admin panelga kira oladi.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="w-full border-white/10 hover:bg-white/5 text-white rounded-full py-6 font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <Home className="w-4 h-4" />
              Bosh sahifaga qaytish
            </Button>
            
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full hover:bg-red-500/10 text-red-300 hover:text-red-200 rounded-full py-6 font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <LogOut className="w-4 h-4" />
              Tizimdan chiqish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Admin
  return <>{children}</>;
}
