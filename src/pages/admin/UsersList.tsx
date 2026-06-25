import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Users, 
  Loader2, 
  Calendar, 
  Mail,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileData {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastLogin: any; // Firestore Timestamp
}

export default function UsersList() {
  const [users, setUsers] = useState<UserProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, "users"), orderBy("lastLogin", "desc"));
        const snapshot = await getDocs(q);
        const usersData: UserProfileData[] = [];
        snapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() } as UserProfileData);
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users list:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const formatTimestamp = (ts: any) => {
    if (!ts) return "Noma'lum";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Foydalanuvchilar ro'yxati</h1>
        <p className="text-white/60 text-sm mt-1">
          Saytga Google orqali login qilgan barcha foydalanuvchilar tarixi.
        </p>
      </div>

      {/* Grid List */}
      {users.length === 0 ? (
        <Card className="glass border border-white/5 rounded-3xl p-12 text-center text-white/40">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Foydalanuvchilar yo'q</h3>
          <p className="text-white/40 text-sm">Hozircha hech qanday foydalanuvchi tizimga kirmagan.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((item) => {
            const userInitials = item.displayName
              ? item.displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
              : item.email ? item.email.slice(0, 2).toUpperCase() : "U";
            const isAdmin = item.email === "salimovsarvar21@gmail.com";

            return (
              <Card key={item.id} className="glass border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
                <CardContent className="p-5 flex items-start gap-4">
                  <Avatar className="h-12 w-12 border border-white/10">
                    <AvatarImage src={item.photoURL} />
                    <AvatarFallback className="bg-primary/20 text-accent text-sm font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate leading-none">{item.displayName || "Foydalanuvchi"}</h3>
                        {isAdmin && (
                          <span className="bg-accent/15 border border-accent/30 text-accent text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wide">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 flex items-center gap-1.5 mt-1 font-body">
                        <Mail className="w-3.5 h-3.5 text-white/30" />
                        <span className="truncate">{item.email}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-white/40 font-body">
                      <Calendar className="w-3.5 h-3.5 text-white/20" />
                      <span>Oxirgi faollik: <strong>{formatTimestamp(item.lastLogin)}</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
