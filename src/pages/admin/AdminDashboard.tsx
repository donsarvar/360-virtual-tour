import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Map as MapIcon, 
  Image as ImageIcon, 
  Users, 
  Plus, 
  ArrowRight,
  Loader2,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    parksCount: 0,
    scenesCount: 0,
    usersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch parks
        const parksSnapshot = await getDocs(collection(db, "parks"));
        const parksCount = parksSnapshot.size;

        // Fetch scenes count for each park in parallel
        const scenesCountPromises = parksSnapshot.docs.map(async (parkDoc) => {
          const data = parkDoc.data();
          if (data.totalScenes !== undefined) {
            return data.totalScenes;
          }
          // Fallback: Query the subcollection count dynamically
          try {
            const scenesSnapshot = await getDocs(collection(db, "parks", parkDoc.id, "scenes"));
            return scenesSnapshot.size;
          } catch (err) {
            console.error(`Error fetching scenes for park ${parkDoc.id}:`, err);
            return 0;
          }
        });

        const scenesCounts = await Promise.all(scenesCountPromises);
        const totalScenes = scenesCounts.reduce((sum, count) => sum + count, 0);

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersCount = usersSnapshot.size;

        setStats({
          parksCount,
          scenesCount: totalScenes,
          usersCount
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Jami Parklar",
      value: stats.parksCount,
      description: "Tizimdagi virtual parklar soni",
      icon: MapIcon,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "360° Rasmlar",
      value: stats.scenesCount,
      description: "Barcha bog'lardagi panoramalar",
      icon: ImageIcon,
      color: "text-accent",
      bg: "bg-accent/10 border-accent/20"
    },
    {
      title: "Foydalanuvchilar",
      value: stats.usersCount,
      description: "Ro'yxatdan o'tgan mehmonlar",
      icon: Users,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">Virtual turlarni va ma'lumotlarni real vaqtda boshqaring.</p>
        </div>
        <Link to="/admin/parks/new">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 flex items-center gap-2 active:scale-95 transition-transform glow-pulse">
            <Plus className="w-5 h-5" />
            Yangi Park qo'shish
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className={`glass-strong border ${card.bg} rounded-2xl`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold tracking-wider uppercase text-white/50">{card.title}</CardTitle>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-display font-bold text-white mb-1">{card.value}</div>
                <CardDescription className="text-white/40 text-xs font-body">{card.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Links Card */}
        <Card className="glass-strong border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Tezkor havolalar</h3>
            <p className="text-white/50 text-sm mb-6 font-body">Tezkor boshqaruv sahifalari orqali ishlarni osonlashtiring.</p>
            
            <div className="space-y-3">
              <Link 
                to="/admin/parks"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <MapIcon className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-sm">Parklar ro'yxati va tahrirlash</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link 
                to="/admin/users"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-sm">Foydalanuvchilarni ko'rish</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-white/30 font-body">
            <span>Oxirgi yangilanish: Bugun</span>
            <span>Tashkent360 v2.0</span>
          </div>
        </Card>

        {/* System Settings Info Card */}
        <Card className="glass-strong border border-white/5 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-accent">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Tizim holati</h3>
              <p className="text-white/50 text-sm mb-4 font-body">Barcha tizimlar normal holatda ishlamoqda.</p>
              
              <ul className="space-y-2 text-xs font-body text-white/70">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Firestore Database: <strong>Faol</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Firebase Storage: <strong>Faol</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Google Auth Provider: <strong>Faol</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
