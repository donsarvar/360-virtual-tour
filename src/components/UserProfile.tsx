import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const localTranslations = {
  uz: {
    login: "Kirish",
    loginGoogle: "Google orqali kirish",
    logout: "Chiqish",
    account: "Profil",
    loginSuccess: "Tizimga muvaffaqiyatli kirdingiz!",
    loginFailed: "Tizimga kirishda xatolik yuz berdi",
    logoutSuccess: "Tizimdan chiqdingiz!",
    loading: "Kutilmoqda..."
  },
  ru: {
    login: "Войти",
    loginGoogle: "Войти через Google",
    logout: "Выйти",
    account: "Профиль",
    loginSuccess: "Вы успешно вошли в систему!",
    loginFailed: "Ошибка при входе в систему",
    logoutSuccess: "Вы вышли из системы!",
    loading: "Ожидание..."
  },
  en: {
    login: "Sign In",
    loginGoogle: "Sign in with Google",
    logout: "Sign Out",
    account: "Profile",
    loginSuccess: "Successfully logged in!",
    loginFailed: "Login failed, please try again",
    logoutSuccess: "Logged out successfully!",
    loading: "Loading..."
  }
};

export default function UserProfile() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const t = localTranslations[lang] || localTranslations.uz;

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success(t.loginSuccess);
    } catch (error) {
      toast.error(t.loginFailed);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t.logoutSuccess);
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 glass" disabled>
        <Loader2 className="w-4 h-4 animate-spin text-white/75" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button 
        onClick={handleLogin}
        variant="ghost" 
        className="glass hover:bg-white/10 text-white rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 border border-white/10 hover:border-white/20 transition-all pointer-events-auto active:scale-95 shadow-md"
      >
        {/* Simple Google SVG Icon */}
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
        <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">{t.login}</span>
      </Button>
    );
  }

  // Fallback letters if user has no photo
  const userInitials = user.displayName
    ? user.displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : user.email ? user.email.slice(0, 2).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="pointer-events-auto">
        <Button variant="ghost" className="relative h-10 w-10 rounded-full glass border border-white/10 hover:border-white/30 focus-visible:ring-0 active:scale-95 transition-all p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User avatar"} />
            <AvatarFallback className="bg-primary/20 text-accent text-xs font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass-strong border border-white/10 text-white p-2 rounded-2xl shadow-xl mt-2 mr-2" align="end">
        <DropdownMenuLabel className="font-display px-2 py-1.5">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-white/50 truncate mt-0.5">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10 my-1" />
        <DropdownMenuItem 
          onClick={() => navigate("/profile")}
          className="focus:bg-white/10 focus:text-white rounded-lg flex items-center gap-2 cursor-pointer py-2"
        >
          <User className="mr-2 h-4 w-4 text-accent" />
          <span className="text-sm">{t.account}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10 my-1" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="focus:bg-destructive/20 focus:text-red-400 text-red-300 rounded-lg flex items-center gap-2 cursor-pointer py-2"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-sm">{t.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
