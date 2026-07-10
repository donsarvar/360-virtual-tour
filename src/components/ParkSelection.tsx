import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { MapPin, Map as MapIcon, ExternalLink, Loader2, Search, Sparkles, Accessibility, LayoutGrid, List as ListIcon, Compass } from "lucide-react";
import { YMaps, Map, Placemark, ZoomControl } from "@pbe/react-yandex-maps";
import { ALL_PARKS, ParkData } from "@/lib/parksData";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getAvailableFacilities, getParkFacilities } from "@/lib/facilities";
import { parseSearchQuery, SearchFilters } from "@/lib/aiSearch";
import { FacilityBadge, EntryFeeBadge } from "@/components/FacilityBadge";
import { useAccessibility } from "@/contexts/AccessibilityContext";

import parkBotanika from "@/assets/park-botanika.jpg";
import parkIslamicCenter from "@/assets/park-islamic-center.png";
import parkEcoPark from "@/assets/park-ecopark.png";

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const ParkSelection = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { location } = useGeoLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Firestore states
  const [dbParks, setDbParks] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  
  // AI qidiruv statelari
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);
  
  // UX statelari (Yandex xarita va Grid/List ko'rinish)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Inklyuzivlik holati
  const { isInclusiveMode, toggleInclusiveMode } = useAccessibility();

  useEffect(() => {
    async function loadParks() {
      try {
        const q = query(
          collection(db, "parks"),
          where("isPublished", "==", true),
          orderBy("order", "asc")
        );
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setDbParks(list);
      } catch (err) {
        console.error("Error fetching parks:", err);
      } finally {
        setDbLoading(false);
      }
    }
    loadParks();
  }, []);

  // Baza (Firebase) va Mahalliy mock ma'lumotlarni birlashtiramiz
  const displayParks = ALL_PARKS.map(park => {
    // Agar Firebase dan kelgan yangi ma'lumot bo'lsa (coverUrl kabi), shuni olamiz
    const dbPark = dbParks.find(p => p.id === park.id);
    return {
      id: park.id,
      name: lang === "uz" ? park.name_uz : lang === "ru" ? park.name_ru : park.name_en,
      desc: lang === "uz" ? park.desc_uz : lang === "ru" ? park.desc_ru : park.desc_en,
      image: park.id === 'botanika' ? parkBotanika : park.id === 'islamic-center' ? parkIslamicCenter : park.id === 'ecopark' ? parkEcoPark : (dbPark?.coverUrl || park.coverUrl),
      coords: { lat: park.lat, lng: park.lng },
      has360: park.has360,
      type: park.type,
      district: park.district
    };
  });

  // Filtrni qo'llash
  const filteredParks = displayParks.filter(park => {
    const facilities = getParkFacilities(park.id);

    // Agar inklyuziv rejim yoniq bo'lsa, qat'iy filtrlash
    if (isInclusiveMode) {
      if (!facilities) return false;
      if (!facilities.has_ramp && !facilities.has_nursing_room && !facilities.child_friendly) {
        return false;
      }
    }

    if (!activeFilters) return true;

    // AI filter bor, lekin parkni sharoiti noma'lum bo'lsa
    if (!facilities) return false;

    // Har bir o'rnatilgan filtrni tekshiramiz
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value !== undefined && (facilities as any)[key] !== value) {
        return false;
      }
    }
    return true;
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setActiveFilters(null);
      return;
    }

    setIsSearching(true);
    try {
      const filters = await parseSearchQuery(searchQuery);
      setActiveFilters(Object.keys(filters).length > 0 ? filters : null);
      
      // Tahlil uchun (3-bosqich) so'rovni konsolga yozib qo'yamiz
      console.log(`🔍 [AI Qidiruv] So'rov: "${searchQuery}" -> Filtrlar:`, filters);
    } catch (err) {
      console.error("AI Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section id="parks" className="py-24 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            {t.parks}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-body">
            {t.parksSubtitle}
          </p>
        </motion.div>

        {/* Inklyuzivlik Toggle va AI Qidiruv Maydoni */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full mx-auto mb-16 relative z-20"
        >
          {/* To'siqsiz muhit Toggle */}
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleInclusiveMode}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-xl border ${
                isInclusiveMode 
                  ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30 glow-green" 
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              }`}
            >
              <div className={`p-1.5 rounded-full ${isInclusiveMode ? "bg-green-500/30" : "bg-white/10"}`}>
                <Compass className="w-5 h-5" />
              </div>
              <span className="tracking-wide">
                {lang === "uz" ? "Faqat tayyor 360° bog'lar" : "Только готовые 360° парки"}
              </span>
              {isInclusiveMode && (
                <span className="ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:bg-accent/30 transition-all duration-500" />
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center glass-strong border border-white/20 rounded-2xl p-2 shadow-2xl focus-within:border-accent/50 transition-colors gap-2">
              <div className="flex items-center flex-1 w-full pl-2 sm:pl-4 overflow-hidden">
                <div className="pr-3 text-accent flex-shrink-0">
                  {isSearching ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "uz" ? "Qanday park qidiryapsiz? Masalan: bolalar uchun tinch joy..." : "Какой парк вы ищете? Например: тихое место для детей..."}
                  className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-white placeholder:text-white/40 h-12 text-sm sm:text-base md:text-lg font-body truncate"
                />
              </div>
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0 w-full sm:w-auto h-12"
              >
                <Search className="w-5 h-5" />
                <span>{lang === "uz" ? "Qidirish" : "Искать"}</span>
              </button>
            </div>
            {activeFilters && (
              <div className="absolute -bottom-8 left-0 text-xs text-accent font-medium flex items-center gap-2">
                <span>✓ {lang === "uz" ? "AI filtri faol" : "AI фильтр активен"}</span>
                <button type="button" onClick={() => { setSearchQuery(""); setActiveFilters(null); }} className="text-white/50 hover:text-white underline">
                  {lang === "uz" ? "Bekor qilish" : "Отменить"}
                </button>
              </div>
            )}
          </form>
        </motion.div>

        {dbLoading && dbParks.length === 0 ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredParks.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 glass">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">{lang === "uz" ? "Afsuski, bunday park topilmadi" : "К сожалению, такой парк не найден"}</h3>
            <p className="text-white/60 mb-6">{lang === "uz" ? "Boshqa so'zlar bilan qidirib ko'ring yoki filtrlarni o'chiring." : "Попробуйте поискать другими словами или отключите фильтры."}</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilters(null); }} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
              {lang === "uz" ? "Barcha parklarni ko'rish" : "Посмотреть все парки"}
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-8">
            
            {/* Yandex Map */}
            <div className="w-full h-[400px] rounded-3xl overflow-hidden glass border border-white/10 relative z-10">
              <YMaps>
                <Map 
                  defaultState={{ center: [41.311081, 69.240562], zoom: 11 }} 
                  width="100%" 
                  height="100%"
                >
                  <ZoomControl options={{ float: "right" }} />
                  {filteredParks.map(park => (
                    <Placemark 
                      key={park.id} 
                      geometry={[park.coords.lat, park.coords.lng]} 
                      properties={{
                        hintContent: park.name,
                        balloonContentHeader: `<b>${park.name}</b>`,
                        balloonContentBody: `${park.desc}<br/><br/>${park.has360 ? '<a href="/tour/'+park.id+'">360 Turga kirish</a>' : 'Tez kunda'}`,
                      }}
                      options={{
                        preset: park.has360 ? "islands#greenIcon" : "islands#blueIcon"
                      }}
                    />
                  ))}
                </Map>
              </YMaps>
            </div>

            {/* View Mode Controls */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <h3 className="text-xl md:text-2xl font-bold font-display text-white">
                {filteredParks.length} {lang === "uz" ? "ta park topildi" : "парков найдено"}
              </h3>
              <div className="flex bg-black/20 border border-white/10 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-accent text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-accent text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                  title="List View"
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Park Cards */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" : "flex flex-col gap-4 sm:gap-6"}>
              {filteredParks.map((park, index) => {
                const isHovered = hoveredIndex === index;
                
                return (
                  <motion.div
                    key={park.id}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer group glass border border-white/10 flex ${viewMode === 'grid' ? 'flex-col min-h-[420px]' : 'flex-col sm:flex-row h-auto sm:h-56'}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      if (park.has360) {
                        navigate(`/tour/${park.id}`);
                      }
                    }}
                  >
                    {/* Image Section */}
                    <div className={`relative ${viewMode === 'grid' ? 'w-full h-48 flex-shrink-0' : 'w-full sm:w-1/3 h-48 sm:h-full'} overflow-hidden`}>
                      <img
                        src={park.image}
                        alt={park.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes(parkBotanika)) {
                            target.src = parkBotanika;
                          }
                        }}
                      />
                      {/* Dark overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {!park.has360 && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 z-20">
                          <span className="text-xs font-bold text-white/90">
                            {lang === "uz" ? "⏳ Tez kunda" : "⏳ Скоро"}
                          </span>
                        </div>
                      )}
                      {park.has360 && (
                        <div className="absolute top-3 right-3 bg-accent/80 backdrop-blur-md px-3 py-1 rounded-full border border-accent z-20 shadow-lg shadow-accent/20">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Compass className="w-3 h-3" /> 360°
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className={`relative z-10 flex flex-col flex-1 p-5 ${viewMode === 'grid' ? '' : 'sm:w-2/3 sm:justify-center'}`}>
                      <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-1">
                        {park.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-xs text-white/60 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{park.district}</span>
                      </div>

                      <p className="text-white/70 text-sm font-body line-clamp-2 mb-auto">
                        {park.desc}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        {park.has360 ? (
                          <button className="px-4 py-2 bg-white/10 hover:bg-accent hover:text-white rounded-xl text-sm font-bold transition-all border border-white/10 group-hover:border-accent flex items-center gap-2">
                            {t.explorePark}
                          </button>
                        ) : (
                          <button disabled className="px-4 py-2 bg-white/5 rounded-xl text-sm font-bold text-white/30 border border-white/5 cursor-not-allowed">
                            {lang === "uz" ? "Hali tayyor emas" : "Еще не готово"}
                          </button>
                        )}
                        
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${park.coords.lat},${park.coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/20 transition-all border border-white/10"
                          onClick={(e) => e.stopPropagation()}
                          title={t.viewOnMap}
                        >
                          <MapIcon className="w-4 h-4 text-white/70" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ParkSelection;
