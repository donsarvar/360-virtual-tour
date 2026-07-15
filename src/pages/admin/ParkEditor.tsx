import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Map as MapIcon,
  HelpCircle,
  Upload,
  CheckCircle2,
  Accessibility,
  Car,
  Baby,
  Coffee,
  Wifi,
  Bike,
  TreePine,
  Volume2,
  Ticket,
  Clock,
  ShieldCheck,
  Bath
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParkFormState {
  name_uz: string;
  name_ru: string;
  name_en: string;
  desc_uz: string;
  desc_ru: string;
  desc_en: string;
  coverUrl: string;
  audioUrl: string;
  mapUrl: string;
  order: number;
  isPublished: boolean;
  lat: number;
  lng: number;
  // Sharoitlar (Facilities)
  has_ramp: boolean;
  has_parking: boolean;
  has_playground: boolean;
  has_cafe: boolean;
  has_nursing_room: boolean;
  has_clean_restroom: boolean;
  has_wifi: boolean;
  has_bike_rental: boolean;
  shade_level: "low" | "medium" | "high";
  noise_level: "low" | "medium" | "high";
  child_friendly: boolean;
  entry_fee: "free" | "paid";
  working_hours: string;
}

export default function ParkEditor() {
  const { parkId } = useParams<{ parkId: string }>();
  const isEditMode = !!parkId;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [slugId, setSlugId] = useState("");
  
  // Upload states
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [mapProgress, setMapProgress] = useState<number | null>(null);

  const [form, setForm] = useState<ParkFormState>({
    name_uz: "",
    name_ru: "",
    name_en: "",
    desc_uz: "",
    desc_ru: "",
    desc_en: "",
    coverUrl: "/assets/placeholder-cover.jpg",
    audioUrl: "",
    mapUrl: "",
    order: 1,
    isPublished: true,
    lat: 41.31,
    lng: 69.28,
    // Sharoitlar default qiymatlari
    has_ramp: false,
    has_parking: false,
    has_playground: false,
    has_cafe: false,
    has_nursing_room: false,
    has_clean_restroom: false,
    has_wifi: false,
    has_bike_rental: false,
    shade_level: "medium",
    noise_level: "medium",
    child_friendly: false,
    entry_fee: "free",
    working_hours: "06:00-22:00"
  });

  useEffect(() => {
    if (isEditMode && parkId) {
      async function loadPark() {
        try {
          const docRef = doc(db, "parks", parkId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setForm({
              name_uz: data.name_uz || "",
              name_ru: data.name_ru || "",
              name_en: data.name_en || "",
              desc_uz: data.desc_uz || "",
              desc_ru: data.desc_ru || "",
              desc_en: data.desc_en || "",
              coverUrl: data.coverUrl || "/assets/placeholder-cover.jpg",
              audioUrl: data.audioUrl || "",
              mapUrl: data.mapUrl || "",
              order: data.order || 1,
              isPublished: data.isPublished !== false,
              lat: data.lat || 41.31,
              lng: data.lng || 69.28,
              // Sharoitlar bazadan o'qish
              has_ramp: data.has_ramp || false,
              has_parking: data.has_parking || false,
              has_playground: data.has_playground || false,
              has_cafe: data.has_cafe || false,
              has_nursing_room: data.has_nursing_room || false,
              has_clean_restroom: data.has_clean_restroom || false,
              has_wifi: data.has_wifi || false,
              has_bike_rental: data.has_bike_rental || false,
              shade_level: data.shade_level || "medium",
              noise_level: data.noise_level || "medium",
              child_friendly: data.child_friendly || false,
              entry_fee: data.entry_fee || "free",
              working_hours: data.working_hours || "06:00-22:00"
            });
            setSlugId(parkId);
          } else {
            toast.error("Park topilmadi.");
            navigate("/admin/parks");
          }
        } catch (error) {
          console.error("Error loading park details:", error);
          toast.error("Park ma'lumotlarini yuklashda xatolik yuz berdi.");
        } finally {
          setLoading(false);
        }
      }
      loadPark();
    }
  }, [isEditMode, parkId, navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "map") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentSlug = isEditMode ? parkId : slugId.trim();
    if (!currentSlug) {
      toast.error("Fayl yuklashdan oldin iltimos Bog' ID (Slug) yozing!");
      return;
    }

    const setProgress = type === "cover" ? setCoverProgress : setMapProgress;
    
    const fileRef = ref(storage, `parks/${currentSlug}/${type}_${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.round(progress));
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("Yuklashda xatolik: " + error.message);
        setProgress(null);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (type === "cover") {
            setForm(prev => ({ ...prev, coverUrl: downloadURL }));
          } else {
            setForm(prev => ({ ...prev, mapUrl: downloadURL }));
          }
          toast.success("Rasm muvaffaqiyatli yuklandi!");
        } catch (err) {
          console.error("Error getting URL:", err);
        } finally {
          setProgress(null);
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!isEditMode && !slugId.trim()) {
      toast.error("Bog' ID (Slug) yozilishi shart!");
      return;
    }

    const cleanSlug = slugId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!isEditMode && cleanSlug.length < 3) {
      toast.error("Bog' ID kamida 3 ta harfdan iborat bo'lishi kerak.");
      return;
    }

    setSaving(true);
    try {
      const parkData = {
        name_uz: form.name_uz,
        name_ru: form.name_ru,
        name_en: form.name_en,
        desc_uz: form.desc_uz,
        desc_ru: form.desc_ru,
        desc_en: form.desc_en,
        coverUrl: form.coverUrl,
        audioUrl: form.audioUrl,
        mapUrl: form.mapUrl,
        order: Number(form.order),
        isPublished: form.isPublished,
        lat: Number(form.lat),
        lng: Number(form.lng),
        // Sharoitlar bazaga yozish
        has_ramp: form.has_ramp,
        has_parking: form.has_parking,
        has_playground: form.has_playground,
        has_cafe: form.has_cafe,
        has_nursing_room: form.has_nursing_room,
        has_clean_restroom: form.has_clean_restroom,
        has_wifi: form.has_wifi,
        has_bike_rental: form.has_bike_rental,
        shade_level: form.shade_level,
        noise_level: form.noise_level,
        child_friendly: form.child_friendly,
        entry_fee: form.entry_fee,
        working_hours: form.working_hours,
        updatedAt: new Date()
      };

      if (isEditMode && parkId) {
        const docRef = doc(db, "parks", parkId);
        await updateDoc(docRef, parkData);
        toast.success("Bog' muvaffaqiyatli tahrirlandi!");
      } else {
        const docRef = doc(db, "parks", cleanSlug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          toast.error("Bunday ID dagi bog' allaqachon mavjud. Boshqa ID tanlang.");
          setSaving(false);
          return;
        }

        await setDoc(docRef, {
          ...parkData,
          totalScenes: 0,
          createdAt: new Date()
        });
        toast.success("Yangi bog' muvaffaqiyatli yaratildi!");
      }
      navigate("/admin/parks");
    } catch (error) {
      console.error("Error saving park:", error);
      toast.error("Saqlashda xatolik yuz berdi. Firebase qoidalarini tekshiring.");
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/parks"
          className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Parklar ro'yxatiga qaytish
        </Link>
        <span className="text-white/40 text-xs font-mono">
          {isEditMode ? `Tahrirlash: ${parkId}` : "Yangi yaratish"}
        </span>
      </div>

      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">
          {isEditMode ? "Bog'ni tahrirlash" : "Yangi bog' yaratish"}
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Saytda ko'rsatiladigan barcha ma'lumotlarni to'ldiring.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-strong border border-white/5 rounded-3xl p-6 sm:p-8 space-y-8">
          
          {/* Main Info Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-display font-bold text-accent border-b border-white/5 pb-2">Asosiy ma'lumotlar</h3>
            
            {/* Slug ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
                Bog' ID (Slug/Unique Key)
                <HelpCircle className="w-4 h-4 text-white/30" title="Linklarda ishlatiladigan unikal nom, masalan: botanika" />
              </label>
              <Input
                disabled={isEditMode}
                value={slugId}
                onChange={(e) => setSlugId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                placeholder="masalan: botanika-bogi"
                className="glass border-white/10 text-white rounded-xl focus:border-accent py-5 font-mono"
                required
              />
              {!isEditMode && (
                <p className="text-xs text-white/40">
                  Faqat kichik ingliz harflari, raqamlar va chiziqcha. Keyinchalik o'zgartirib bo'lmaydi.
                </p>
              )}
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Bog' nomi (O'zbekcha)</label>
                <Input
                  value={form.name_uz}
                  onChange={(e) => setForm({ ...form, name_uz: e.target.value })}
                  placeholder="masalan: Botanika Bog'i"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Bog' nomi (Русский)</label>
                <Input
                  value={form.name_ru}
                  onChange={(e) => setForm({ ...form, name_ru: e.target.value })}
                  placeholder="напр: Ботанический Сад"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Bog' nomi (English)</label>
                <Input
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  placeholder="e.g. Botanical Garden"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent"
                  required
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Tavsif (O'zbekcha)</label>
                <Textarea
                  value={form.desc_uz}
                  onChange={(e) => setForm({ ...form, desc_uz: e.target.value })}
                  placeholder="Bog' haqida batafsil ma'lumot kiriting..."
                  className="glass border-white/10 text-white rounded-xl focus:border-accent min-h-[100px]"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Описание (Русский)</label>
                <Textarea
                  value={form.desc_ru}
                  onChange={(e) => setForm({ ...form, desc_ru: e.target.value })}
                  placeholder="Введите подробное описание парка..."
                  className="glass border-white/10 text-white rounded-xl focus:border-accent min-h-[100px]"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Description (English)</label>
                <Textarea
                  value={form.desc_en}
                  onChange={(e) => setForm({ ...form, desc_en: e.target.value })}
                  placeholder="Enter detailed description of the park..."
                  className="glass border-white/10 text-white rounded-xl focus:border-accent min-h-[100px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Media & Coordinates Section */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <h3 className="text-lg font-display font-bold text-accent border-b border-white/5 pb-2">Media & Koordinatalar</h3>
            
            {/* Image & Audio URL inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cover Image Upload & Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Muqova rasmi (Cover Image)</label>
                <div className="flex gap-2">
                  <Input
                    value={form.coverUrl}
                    onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                    placeholder="assets/park-botanika.jpg yoki internet linki"
                    className="glass border-white/10 text-white rounded-xl focus:border-accent flex-1"
                    required
                  />
                  <div className="relative shrink-0">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, "cover")} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                      disabled={!isEditMode && !slugId.trim()}
                    />
                    <Button type="button" variant="outline" className="w-10 h-10 p-0 border-white/10 hover:bg-white/5 rounded-xl text-white">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {coverProgress !== null && (
                  <div className="space-y-1 mt-1">
                    <Progress value={coverProgress} className="h-1 bg-white/10" />
                    <span className="text-[10px] text-accent">Yuklanmoqda: {coverProgress}%</span>
                  </div>
                )}
              </div>

              {/* Audio URL */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Audio yo'lboshchi URL (Audio Guide)</label>
                <Input
                  value={form.audioUrl}
                  onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  placeholder="masalan: /audio/Botanika.mp3"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent"
                />
              </div>
              
              {/* Map Image Upload & Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Xarita rasmi (Map Layout)</label>
                <div className="flex gap-2">
                  <Input
                    value={form.mapUrl}
                    onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
                    placeholder="masalan: /maps/botanika.png"
                    className="glass border-white/10 text-white rounded-xl focus:border-accent flex-1"
                  />
                  <div className="relative shrink-0">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, "map")} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                      disabled={!isEditMode && !slugId.trim()}
                    />
                    <Button type="button" variant="outline" className="w-10 h-10 p-0 border-white/10 hover:bg-white/5 rounded-xl text-white">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {mapProgress !== null && (
                  <div className="space-y-1 mt-1">
                    <Progress value={mapProgress} className="h-1 bg-white/10" />
                    <span className="text-[10px] text-accent">Yuklanmoqda: {mapProgress}%</span>
                  </div>
                )}
              </div>

              {/* Order number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Tartib raqami (Order)</label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="glass border-white/10 text-white rounded-xl focus:border-accent"
                  required
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Kenglik (Latitude)</label>
                <Input
                  type="number"
                  step="0.0000001"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
                  placeholder="41.3448377"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80">Uzunlik (Longitude)</label>
                <Input
                  type="number"
                  step="0.0000001"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
                  placeholder="69.3106849"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent font-mono"
                  required
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="text-sm font-semibold text-white">Saytda ko'rsatish (Publish)</p>
                <p className="text-xs text-white/40 mt-0.5">Buni o'chirsangiz, park saytda vaqtinchalik ko'rinmay turadi.</p>
              </div>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(checked) => setForm({ ...form, isPublished: checked })}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </div>

          {/* ═══════ SHAROITLAR (Facilities) ═══════ */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <h3 className="text-lg font-display font-bold text-accent border-b border-white/5 pb-2">Sharoitlar (Facilities)</h3>
            <p className="text-xs text-white/40">Parkda qanday sharoitlar borligini belgilang. Bu ma'lumotlar foydalanuvchilarga ko'rsatiladi.</p>
            
            {/* Yoqish/O'chirish tugmalari */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "has_ramp" as const, icon: Accessibility, label: "Nogironlar uchun yo'lakcha (Rampa)", desc: "Nogironlar aravachasi uchun maxsus yo'lakcha" },
                { key: "has_parking" as const, icon: Car, label: "Avtoturargoh (Parking)", desc: "Mashina qo'yish uchun joy" },
                { key: "has_playground" as const, icon: Baby, label: "Bolalar maydonchasi", desc: "Bolalar o'ynashi uchun xavfsiz maydoncha" },
                { key: "has_cafe" as const, icon: Coffee, label: "Kafe / Choyxona", desc: "Ovqatlanish va ichimlik sotib olish joyi" },
                { key: "has_nursing_room" as const, icon: ShieldCheck, label: "Emizish xonasi (Nursing Room)", desc: "Bolali onalar uchun maxsus xona" },
                { key: "has_clean_restroom" as const, icon: Bath, label: "Toza hojatxona", desc: "Umumiy foydalanish hojatxonasi" },
                { key: "has_wifi" as const, icon: Wifi, label: "Bepul Wi-Fi", desc: "Bepul internet tarmog'i" },
                { key: "has_bike_rental" as const, icon: Bike, label: "Velosiped ijarasi", desc: "Velosiped ijaraga olish xizmati" },
                { key: "child_friendly" as const, icon: Baby, label: "Bolalar uchun xavfsiz", desc: "Kichik bolalar uchun xavfsiz muhit" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-accent">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-[11px] text-white/40">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={form[item.key] as boolean}
                    onCheckedChange={(checked) => setForm({ ...form, [item.key]: checked })}
                    className="data-[state=checked]:bg-accent"
                  />
                </div>
              ))}
            </div>

            {/* Tanlov (Select) maydonlari */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Soya darajasi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-accent" />
                  Soya darajasi
                </label>
                <Select value={form.shade_level} onValueChange={(val: "low" | "medium" | "high") => setForm({ ...form, shade_level: val })}>
                  <SelectTrigger className="glass border-white/10 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Past (kam daraxt)</SelectItem>
                    <SelectItem value="medium">O'rtacha</SelectItem>
                    <SelectItem value="high">Yuqori (ko'p daraxt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shovqin darajasi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-accent" />
                  Shovqin darajasi
                </label>
                <Select value={form.noise_level} onValueChange={(val: "low" | "medium" | "high") => setForm({ ...form, noise_level: val })}>
                  <SelectTrigger className="glass border-white/10 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Past (tinch)</SelectItem>
                    <SelectItem value="medium">O'rtacha</SelectItem>
                    <SelectItem value="high">Yuqori (shovqinli)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kirish narxi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-accent" />
                  Kirish narxi
                </label>
                <Select value={form.entry_fee} onValueChange={(val: "free" | "paid") => setForm({ ...form, entry_fee: val })}>
                  <SelectTrigger className="glass border-white/10 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Bepul</SelectItem>
                    <SelectItem value="paid">Pullik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ish vaqti */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Ish vaqti
                </label>
                <Input
                  value={form.working_hours}
                  onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                  placeholder="06:00-22:00"
                  className="glass border-white/10 text-white rounded-xl focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
            <Link to="/admin/parks">
              <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5 text-white rounded-full px-6">
                Bekor qilish
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 flex items-center gap-2 active:scale-95 transition-transform glow-pulse"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
