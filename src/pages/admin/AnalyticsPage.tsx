import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Users, 
  Clock, 
  Activity, 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  History,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface LogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  parkId: string;
  enteredAt: any;
  exitedAt: any;
  duration: number;
  device: string;
  createdAt?: any;
}

export default function AnalyticsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    uniqueUsers: 0,
    totalDuration: 0,
    averageDuration: 0
  });
  
  const [parkData, setParkData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const q = query(collection(db, "activity_logs"), orderBy("enteredAt", "desc"), limit(200));
        const snapshot = await getDocs(q);
        
        const fetchedLogs: LogEntry[] = [];
        const uniqueUserIds = new Set<string>();
        let totalDuration = 0;
        const parkCounts: Record<string, number> = {};
        const deviceCounts = { mobil: 0, desktop: 0 };

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const entry: LogEntry = {
            id: docSnap.id,
            userId: data.userId || "",
            userEmail: data.userEmail || "",
            userName: data.userName || "",
            parkId: data.parkId || "",
            enteredAt: data.enteredAt,
            exitedAt: data.exitedAt,
            duration: data.duration || 0,
            device: data.device || "desktop",
            createdAt: data.createdAt
          };
          fetchedLogs.push(entry);

          // Calculate unique users
          if (entry.userId) {
            uniqueUserIds.add(entry.userId);
          }

          // Calculate total duration
          totalDuration += entry.duration;

          // Count parks
          const parkName = formatParkName(entry.parkId);
          parkCounts[parkName] = (parkCounts[parkName] || 0) + 1;

          // Count devices
          if (entry.device === "mobil") {
            deviceCounts.mobil += 1;
          } else {
            deviceCounts.desktop += 1;
          }
        });

        setLogs(fetchedLogs);
        
        // Calculate statistics
        const totalSessions = fetchedLogs.length;
        const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
        setStats({
          totalSessions,
          uniqueUsers: uniqueUserIds.size,
          totalDuration,
          averageDuration
        });

        // Set Park visits data for chart
        const formattedParkData = Object.keys(parkCounts).map(name => ({
          name,
          tashriflar: parkCounts[name]
        })).sort((a, b) => b.tashriflar - a.tashriflar);
        setParkData(formattedParkData);

        // Set Device usage data for chart
        const formattedDeviceData = [
          { name: "Mobil", value: deviceCounts.mobil, color: "#14b8a6" },
          { name: "Desktop", value: deviceCounts.desktop, color: "#6366f1" }
        ].filter(d => d.value > 0);
        setDeviceData(formattedDeviceData);

      } catch (err) {
        console.error("Error fetching activity logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const formatParkName = (parkId: string) => {
    switch (parkId) {
      case "botanika": return "Botanika Bog'i";
      case "islamic-center": return "Islom Sivilizatsiyasi Markazi";
      case "ecopark": return "Eko Park";
      default: return parkId;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0s";
    if (seconds < 60) return `${seconds} soniya`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}soat ${remainingMinutes}m` : `${hours}soat`;
  };

  const formatDate = (firebaseTimestamp: any) => {
    if (!firebaseTimestamp) return "-";
    let date: Date;
    if (typeof firebaseTimestamp.toDate === "function") {
      date = firebaseTimestamp.toDate();
    } else if (firebaseTimestamp instanceof Date) {
      date = firebaseTimestamp;
    } else {
      date = new Date(firebaseTimestamp);
    }
    return date.toLocaleString("uz-UZ", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const COLORS = ["#14b8a6", "#6366f1"];

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin"
          className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboardga qaytish
        </Link>
        <span className="text-white/40 text-xs font-mono">
          Faollik Tahlili
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Foydalanuvchilar Faolligi & Analitika</h1>
        <p className="text-white/60 text-sm mt-1">
          Mehmonlar qaysi virtual turlarga kirgani va saytda qancha vaqt o'tkazganini real vaqtda kuzating.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-strong border border-white/5 rounded-2xl bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-white/50">Jami Tashriflar</CardTitle>
            <Activity className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-white mb-1">{stats.totalSessions}</div>
            <CardDescription className="text-white/40 text-[10px]">Tizimga kirishlar soni</CardDescription>
          </CardContent>
        </Card>

        <Card className="glass-strong border border-white/5 rounded-2xl bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-white/50">Noyob Foydalanuvchilar</CardTitle>
            <Users className="w-5 h-5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-white mb-1">{stats.uniqueUsers}</div>
            <CardDescription className="text-white/40 text-[10px]">Faol tashrif buyuruvchilar</CardDescription>
          </CardContent>
        </Card>

        <Card className="glass-strong border border-white/5 rounded-2xl bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-white/50">Jami o'tkazilgan vaqt</CardTitle>
            <Clock className="w-5 h-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-white mb-1">{formatDuration(stats.totalDuration)}</div>
            <CardDescription className="text-white/40 text-[10px]">Barcha seanslar umumiy vaqti</CardDescription>
          </CardContent>
        </Card>

        <Card className="glass-strong border border-white/5 rounded-2xl bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-white/50">O'rtacha seans vaqti</CardTitle>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-white mb-1">{formatDuration(stats.averageDuration)}</div>
            <CardDescription className="text-white/40 text-[10px]">Har bir tashrif o'rtacha vaqti</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Graphical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart: Park Popularity */}
        <Card className="glass-strong border border-white/5 rounded-3xl p-6 lg:col-span-2">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-display font-bold text-white">Eng ko'p ko'rilgan bog'lar</CardTitle>
            <CardDescription className="text-white/40 text-xs">Tashriflar soni bo'yicha bog'lar reytingi</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-64">
            {parkData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={11} tickLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={11} tickLine={false} allowDecimals={false} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#14b8a6", fontSize: "12px" }}
                    labelStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Bar dataKey="tashriflar" fill="#14b8a6" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/40 text-sm">Ma'lumotlar mavjud emas</div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart: Devices */}
        <Card className="glass-strong border border-white/5 rounded-3xl p-6">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-display font-bold text-white">Qurilmalar kesimida</CardTitle>
            <CardDescription className="text-white/40 text-xs">Mobil vs Desktop foydalanuvchilar</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center justify-center h-64">
            {deviceData.length > 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      itemStyle={{ color: "#fff", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legends */}
                <div className="flex gap-6 mt-2">
                  {deviceData.map((d, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs text-white/70 font-semibold">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white/40 text-sm">Ma'lumotlar mavjud emas</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Log Table */}
      <Card className="glass-strong border border-white/5 rounded-3xl p-6">
        <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-accent" />
              Oxirgi faolliklar ro'yxati
            </CardTitle>
            <CardDescription className="text-white/40 text-xs mt-1">Real vaqtdagi oxirgi 200 ta foydalanuvchilar seansi</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full rounded-2xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-white/50 text-[10px] font-bold tracking-widest uppercase border-b border-white/5">
                  <th className="px-6 py-4">Foydalanuvchi</th>
                  <th className="px-6 py-4">Manzil</th>
                  <th className="px-6 py-4">Kirgan vaqti</th>
                  <th className="px-6 py-4">Ketgan vaqti</th>
                  <th className="px-6 py-4">O'tkazilgan vaqt</th>
                  <th className="px-6 py-4">Qurilma</th>
                </tr>
              </thead>
              <tbody className="text-xs text-white/80 divide-y divide-white/5 font-body">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{log.userName}</div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">{log.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-accent">
                        {formatParkName(log.parkId)}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {formatDate(log.enteredAt)}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {formatDate(log.exitedAt)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {formatDuration(log.duration)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${log.device === "mobil" 
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          {log.device === "mobil" ? (
                            <>
                              <Smartphone className="w-3 h-3" />
                              Mobil
                            </>
                          ) : (
                            <>
                              <Monitor className="w-3 h-3" />
                              Desktop
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">
                      Hozircha hech qanday faollik qayd etilmagan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
