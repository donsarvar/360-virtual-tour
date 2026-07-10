import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { MapPin, Map as MapIcon, ExternalLink, Loader2, Search, Sparkles, Wheelchair } from "lucide-react";
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

  const defaultParks = [
    {
      id: "islamic-center",
      name: t.islamicCenter,
      desc: t.islamicCenterDesc,
      image: parkIslamicCenter,
      coords: { lat: 41.3350498, lng: 69.2404586 }
    },
    {
      id: "botanika",
      name: t.botanika,
      desc: t.botanikaDesc,
      image: parkBotanika,
      coords: { lat: 41.3448377, lng: 69.3106849 }
    },
    {
      id: "ecopark",
      name: t.ecoPark,
      desc: t.ecoParkDesc,
      image: parkEcoPark,
      coords: { lat: 41.3125933, lng: 69.2946446 }
    },
  ];

  const displayParks = dbParks.length > 0 
    ? dbParks.map(park => ({
        id: park.id,
        name: lang === "uz" ? park.name_uz : lang === "ru" ? park.name_ru : park.name_en,
        desc: lang === "uz" ? park.desc_uz : lang === "ru" ? park.desc_ru : park.desc_en,
        image: park.coverUrl,
        coords: { lat: park.lat || 41.3, lng: park.lng || 69.3 }
      }))
    : defaultParks;

  // Filtrni qo'llash
  const filteredParks = displayParks.filter(park => {
    const facilities = getParkFacilities(park.id);
    if (!facilities) return false;

    // Agar inklyuziv rejim yoniq bo'lsa, qat'iy filtrlash
    if (isInclusiveMode) {
      if (!facilities.has_ramp && !facilities.has_nursing_room && !facilities.child_friendly) {
        return false;
      }
    }

    if (!activeFilters) return true;

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
          className="max-w-2xl mx-auto mb-16 relative z-20"
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
                <Wheelchair className="w-5 h-5" />
              </div>
              <span className="tracking-wide">
                {lang === "uz" ? "To'siqsiz muhit" : "Доступная среда"}
              </span>
              {isInclusiveMode && (
                <span className="ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:bg-accent/30 transition-all duration-500" />
            <div className="relative flex items-center glass-strong border border-white/20 rounded-2xl p-2 shadow-2xl overflow-hidden focus-within:border-accent/50 transition-colors">
              <div className="pl-4 pr-2 text-accent">
                {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "uz" ? "Qanday park qidiryapsiz? Masalan: bolalar uchun tinch joy..." : "Какой парк вы ищете? Например: тихое место для детей..."}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 h-12 text-base md:text-lg font-body"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Search className="w-5 h-5 hidden md:block" />
                <span className="hidden md:inline">{lang === "uz" ? "Qidirish" : "Искать"}</span>
                <Search className="w-5 h-5 md:hidden" />
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
          /* Expanding Cards */
          <div className="flex flex-col md:flex-row gap-4 h-[500px] md:h-[600px]">
            {filteredParks.map((park, index) => {
              const isHovered = hoveredIndex === index;
              const hasHover = hoveredIndex !== null;

              return (
                <motion.div
                  key={park.id}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{
                    flex: isHovered ? 3 : hasHover ? 0.8 : 1,
                    transition: "flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => navigate(`/tour/${park.id}`)}
                >
                  {/* Image */}
                  <img
                    src={park.image}
                    alt={park.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/placeholder-cover.jpg";
                    }}
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-background/60 transition-all duration-500 group-hover:bg-background/40" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                    {location.coords && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 text-xs text-accent font-bold mb-3 bg-accent/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-accent/20"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {t.distance} {getDistance(location.coords.latitude, location.coords.longitude, park.coords.lat, park.coords.lng).toFixed(1)} km {t.away}
                        </span>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl md:text-3xl font-display font-bold transition-all duration-500">
                        {park.name}
                      </h3>
                      
                      <motion.a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${park.coords.lat},${park.coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm group/map"
                        onClick={(e) => e.stopPropagation()}
                        title={t.viewOnMap}
                      >
                        <MapIcon className="w-5 h-5 text-white group-hover/map:text-accent transition-colors" />
                      </motion.a>
                    </div>

                    <div
                      className="overflow-hidden transition-all duration-500"
                      style={{
                        maxHeight: isHovered ? "200px" : "0",
                        opacity: isHovered ? 1 : 0,
                      }}
                    >
                      {/* Premium Sharoitlar belgilari */}
                      {(() => {
                        const available = getAvailableFacilities(park.id);
                        const facilities = getParkFacilities(park.id);
                        if (available.length === 0) return null;
                        return (
                          <div className="flex flex-wrap items-center gap-2 mt-4 mb-3">
                            {facilities && (
                              <EntryFeeBadge feeType={facilities.entry_fee} variant="card" />
                            )}
                            <div className="h-4 w-[1px] bg-white/20 mx-1" />
                            {available.slice(0, 5).map(key => (
                              <FacilityBadge key={key} facilityKey={key} variant="card" />
                            ))}
                            {available.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold">
                                +{available.length - 5}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <p className="text-secondary-foreground/80 text-sm md:text-base font-body">
                        {park.desc}
                      </p>
                      <button className="mt-4 px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-bold tracking-wide hover:scale-105 transition-transform glow-pulse">
                        {t.explorePark}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ParkSelection;
