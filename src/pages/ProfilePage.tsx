import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Mail, Calendar, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

const ADMIN_EMAIL = "salimovsarvar21@gmail.com";

const t_map = {
  uz: {
    profile: "Mening profilim",
    email: "Elektron pochta",
    joined: "Ro'yxatdan o'tgan sana",
    logout: "Tizimdan chiqish",
    back: "Orqaga",
    admin: "Administrator",
    logoutSuccess: "Tizimdan chiqdingiz!",
    logoutFail: "Xatolik yuz berdi",
    unknown: "Noma'lum",
  },
  ru: {
    profile: "Мой профиль",
    email: "Электронная почта",
    joined: "Дата регистрации",
    logout: "Выйти из системы",
    back: "Назад",
    admin: "Администратор",
    logoutSuccess: "Вы вышли из системы!",
    logoutFail: "Произошла ошибка",
    unknown: "Неизвестно",
  },
  en: {
    profile: "My Profile",
    email: "Email address",
    joined: "Member since",
    logout: "Sign out",
    back: "Back",
    admin: "Administrator",
    logoutSuccess: "Logged out successfully!",
    logoutFail: "Something went wrong",
    unknown: "Unknown",
  },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const tr = t_map[lang] || t_map.uz;

  const isAdmin = user?.email === ADMIN_EMAIL;

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  const getFormattedDate = (dateStr: string | undefined) => {
    if (!dateStr) return tr.unknown;
    const date = new Date(dateStr);
    const day = date.getDate();
    const year = date.getFullYear();
    
    const monthsUz = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
    const monthsRu = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    if (lang === "uz") {
      return `${day}-${monthsUz[date.getMonth()]}, ${year}`;
    } else if (lang === "ru") {
      return `${day} ${monthsRu[date.getMonth()]} ${year} г.`;
    } else {
      return `${monthsEn[date.getMonth()]} ${day}, ${year}`;
    }
  };

  const joinedDate = getFormattedDate(user?.metadata?.creationTime);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(tr.logoutSuccess);
      navigate("/");
    } catch {
      toast.error(tr.logoutFail);
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {tr.back}
          </button>

          {/* Card */}
          <div className="glass-strong border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Top gradient banner */}
            <div className="h-28 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.15),transparent_70%)]" />
            </div>

            {/* Avatar — overlaps banner */}
            <div className="px-8 pb-8 -mt-14">
              <div className="relative w-fit mb-5">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-accent/20">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-1 shadow-md">
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>

              {/* Name + badge */}
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-display font-bold text-white">
                  {user.displayName || tr.unknown}
                </h1>
                {isAdmin && (
                  <span className="bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {tr.admin}
                  </span>
                )}
              </div>

              {/* Info cards */}
              <div className="mt-6 space-y-3">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                >
                  <div className="p-2 rounded-xl bg-accent/10">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider font-body">
                      {tr.email}
                    </p>
                    <p className="text-sm text-white font-medium mt-0.5 break-all">
                      {user.email}
                    </p>
                  </div>
                </motion.div>

                {/* Joined date */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                >
                  <div className="p-2 rounded-xl bg-white/5">
                    <Calendar className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider font-body">
                      {tr.joined}
                    </p>
                    <p className="text-sm text-white font-medium mt-0.5">{joinedDate}</p>
                  </div>
                </motion.div>
              </div>

              {/* Logout button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-semibold transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                {tr.logout}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
