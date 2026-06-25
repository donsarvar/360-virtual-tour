import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  HelpCircle,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface SceneData {
  id: string; // usually the order number as string, e.g. "1"
  url: string;
  order: number;
}

export default function ScenesManager() {
  const { parkId } = useParams<{ parkId: string }>();
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [parkName, setParkName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // Upload and form states
  const [newUrl, setNewUrl] = useState("");
  const [newOrder, setNewOrder] = useState<number>(1);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const fetchParkAndScenes = async () => {
    if (!parkId) return;
    setLoading(true);
    try {
      // Get Park Name
      const parkDoc = await getDoc(doc(db, "parks", parkId));
      if (parkDoc.exists()) {
        setParkName(parkDoc.data().name_uz || parkId);
      } else {
        toast.error("Park topilmadi.");
        return;
      }

      // Get Scenes
      const q = query(collection(db, "parks", parkId, "scenes"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const scenesData: SceneData[] = [];
      snapshot.forEach((doc) => {
        scenesData.push({ id: doc.id, ...doc.data() } as SceneData);
      });
      setScenes(scenesData);
      
      // Suggest next order number
      const maxOrder = scenesData.reduce((max, s) => s.order > max ? s.order : max, 0);
      setNewOrder(maxOrder + 1);
    } catch (error) {
      console.error("Error loading scenes:", error);
      toast.error("Panoramalarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkAndScenes();
  }, [parkId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !parkId) return;

    const fileRef = ref(storage, `parks/${parkId}/scenes/${newOrder}__${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setUploadProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("Rasm yuklashda xatolik: " + error.message);
        setUploadProgress(null);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setNewUrl(downloadURL);
          toast.success("360° panorama fayli muvaffaqiyatli yuklandi!");
        } catch (err) {
          console.error("Error getting download URL:", err);
        } finally {
          setUploadProgress(null);
        }
      }
    );
  };

  const handleAddScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parkId) return;
    if (!newUrl.trim()) {
      toast.error("Rasm URL manzili yoki yuklangan fayl bo'lishi shart!");
      return;
    }

    setAdding(true);
    try {
      const sceneId = newOrder.toString();
      const sceneDocRef = doc(db, "parks", parkId, "scenes", sceneId);
      
      // Save scene to subcollection
      await setDoc(sceneDocRef, {
        url: newUrl.trim(),
        order: newOrder,
        createdAt: new Date()
      });

      // Update parent park's totalScenes count
      const updatedScenes = [...scenes, { id: sceneId, url: newUrl.trim(), order: newOrder }]
        .sort((a, b) => a.order - b.order);
      
      const parkDocRef = doc(db, "parks", parkId);
      await updateDoc(parkDocRef, {
        totalScenes: updatedScenes.length,
        updatedAt: new Date()
      });

      setScenes(updatedScenes);
      setNewUrl("");
      setNewOrder(updatedScenes.length + 1);
      toast.success("Yangi panorama qo'shildi!");
    } catch (error) {
      console.error("Error adding scene:", error);
      toast.error("Panoramani saqlashda xatolik yuz berdi.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteScene = async (sceneId: string, orderVal: number) => {
    if (!parkId) return;
    try {
      const sceneDocRef = doc(db, "parks", parkId, "scenes", sceneId);
      await deleteDoc(sceneDocRef);

      const updatedScenes = scenes.filter(s => s.id !== sceneId);
      
      // Update parent park's totalScenes count
      const parkDocRef = doc(db, "parks", parkId);
      await updateDoc(parkDocRef, {
        totalScenes: updatedScenes.length,
        updatedAt: new Date()
      });

      setScenes(updatedScenes);
      setNewOrder(updatedScenes.length + 1);
      toast.success("Panorama o'chirildi!");
    } catch (error) {
      console.error("Error deleting scene:", error);
      toast.error("Panoramani o'chirishda xatolik yuz berdi.");
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/parks"
          className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Parklar ro'yxatiga qaytish
        </Link>
        <span className="text-white/40 text-xs font-mono">
          Park ID: {parkId}
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold">{parkName} — 360° Panoramalar</h1>
        <p className="text-white/60 text-sm mt-1">
          Virtual sayohat sahnalarini tartib bo'yicha boshqaring. Sahna tartibi 1-dan boshlanishi kerak.
        </p>
      </div>

      {/* Add New Scene Form */}
      <Card className="glass-strong border border-white/5 rounded-3xl p-6">
        <h3 className="text-lg font-display font-bold text-accent mb-4">Yangi panorama (sahna) qo'shish</h3>
        <form onSubmit={handleAddScene} className="space-y-4">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 flex flex-col gap-2 w-full">
              <label className="text-xs font-semibold text-white/70 flex items-center gap-1">
                Panorama rasm URL manzili
                <HelpCircle className="w-3.5 h-3.5 text-white/30" title="Rasm fayli manzili. Masalan: /botanika/1.webp, internet linki yoki quyida fayl yuklang." />
              </label>
              <div className="flex gap-2">
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="masalan: /botanika/17.webp"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent flex-1"
                  required
                />
                
                {/* File Upload Input Button wrapper */}
                <div className="relative shrink-0">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                  />
                  <Button type="button" variant="outline" className="w-10 h-10 p-0 border-white/10 hover:bg-white/5 rounded-xl text-white">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-32 flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/70">Tartib (Order)</label>
              <Input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(Number(e.target.value))}
                className="glass border-white/10 text-white rounded-xl focus:border-accent"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={adding || uploadProgress !== null}
              className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Qo'shish
            </Button>
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress !== null && (
            <div className="space-y-1.5 pt-2">
              <Progress value={uploadProgress} className="h-1.5 bg-white/10" />
              <div className="flex justify-between text-[11px] text-accent">
                <span>360° panorama fayli yuklanmoqda...</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Scenes List */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold text-white">Mavjud sahnalar ro'yxati ({scenes.length})</h3>
        
        {scenes.length === 0 ? (
          <Card className="glass border border-white/5 rounded-2xl p-12 text-center text-white/40">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p className="text-sm">Hozircha panoramalar yuklanmagan. Birinchi panoramani tepadan qo'shing.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {scenes.map((scene) => (
              <Card key={scene.id} className="glass border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group relative">
                {/* 360 preview thumbnail */}
                <div className="h-40 bg-white/5 border-b border-white/5 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={scene.url} 
                    alt={`Scene ${scene.order}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/placeholder-scene.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-black/60 border border-white/10 rounded-full px-3 py-1 text-xs font-bold text-accent font-mono backdrop-blur-md">
                    #{scene.order}
                  </div>
                </div>

                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/40 font-mono truncate" title={scene.url}>{scene.url}</p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteScene(scene.id, scene.order)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl shrink-0" 
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
