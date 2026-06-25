import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Map as MapIcon, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Plus, 
  Loader2,
  ExternalLink,
  ChevronRight,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ParkData {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  coverUrl: string;
  totalScenes: number;
  order: number;
  isPublished: boolean;
}

export default function ParksList() {
  const [parks, setParks] = useState<ParkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchParks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "parks"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const parksData: ParkData[] = [];
      querySnapshot.forEach((doc) => {
        parksData.push({ id: doc.id, ...doc.data() } as ParkData);
      });
      setParks(parksData);
    } catch (error) {
      console.error("Error fetching parks:", error);
      toast.error("Bog'larni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParks();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "parks", deleteId));
      toast.success("Park muvaffaqiyatli o'chirildi!");
      setParks(parks.filter(p => p.id !== deleteId));
    } catch (error) {
      console.error("Error deleting park:", error);
      toast.error("O'chirishda xatolik yuz berdi.");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Parklarni boshqarish</h1>
          <p className="text-white/60 text-sm mt-1">Virtual sayohat bog'lari ro'yxatini tahrirlang yoki yangisini qo'shing.</p>
        </div>
        <Link to="/admin/parks/new">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 flex items-center gap-2 active:scale-95 transition-transform glow-pulse">
            <Plus className="w-5 h-5" />
            Yangi Park qo'shish
          </Button>
        </Link>
      </div>

      {/* Grid List */}
      {parks.length === 0 ? (
        <Card className="glass-strong border border-white/5 rounded-3xl p-12 text-center">
          <MapIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Parklar topilmadi</h3>
          <p className="text-white/40 text-sm mb-6">Hozircha ma'lumotlar bazasida hech qanday park yaratilmagan.</p>
          <Link to="/admin/parks/new">
            <Button className="bg-accent text-accent-foreground rounded-full px-6">
              Yaratishni boshlash
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {parks.map((park) => (
            <Card key={park.id} className="glass border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
              <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Info Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5 relative">
                    <img 
                      src={park.coverUrl} 
                      alt={park.name_uz} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/placeholder-cover.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg font-display font-bold text-white">{park.name_uz}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        park.isPublished ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {park.isPublished ? "Chop etilgan" : "Qoralama"}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-body mt-1">
                      ID: <span className="font-mono text-accent">{park.id}</span> • Navbat: {park.order}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 text-sm text-white/60 font-body">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    <span><strong>{park.totalScenes}</strong> panorama</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                  <Link to={`/tour/${park.id}`} target="_blank">
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5 rounded-xl" title="Ko'rish">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link to={`/admin/parks/${park.id}/scenes`}>
                    <Button variant="ghost" className="text-accent hover:text-accent-foreground hover:bg-accent/15 rounded-xl flex items-center gap-2 font-semibold text-xs py-1.5 px-3">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Panoramalar ({park.totalScenes})
                    </Button>
                  </Link>

                  <Link to={`/admin/parks/${park.id}`}>
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5 rounded-xl" title="Tahrirlash">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setDeleteId(park.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl" 
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-strong border border-white/10 text-white rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl text-white">Parkni o'chirishni tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60 text-sm font-body">
              Ushbu amalni ortga qaytarib bo'lmaydi. Bu park va uning barcha 360° sahnalari ma'lumotlar bazasidan butunlay o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white rounded-full">
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              Ha, o'chirilsin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
