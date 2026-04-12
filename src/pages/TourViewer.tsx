import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Volume2, VolumeX, MapPin, X, Info } from "lucide-react";

import parkBotanika from "@/assets/park-botanika.jpg";
import parkIslamicCenter from "@/assets/park-islamic-center.png";
import parkTashkentCity from "@/assets/park-tashkent-city.jpg";
import panoramaIslamicCenter from "@/assets/panorama-islamic-center.png";
import panoramaBotanika from "@/assets/panorama-botanika.jpg";
import panoramaTashkentCity from "@/assets/panorama-tashkent-city.jpg";

const parkImages: Record<string, string> = {
  botanika: panoramaBotanika,
  "islamic-center": panoramaIslamicCenter,
  "tashkent-city": panoramaTashkentCity,
};
const hotspots: Record<string, Array<{ x: number; y: number; title: string; desc: string }>> = {
  botanika: [
    { x: 30, y: 45, title: "Tropical Greenhouse", desc: "Home to over 300 exotic plant species from Southeast Asia and South America." },
    { x: 65, y: 35, title: "Rose Garden", desc: "A stunning collection of 150+ rose varieties blooming from April to October." },
    { x: 50, y: 70, title: "Japanese Corner", desc: "A tranquil zen garden with koi pond and traditional stone arrangements." },
  ],
  "islamic-center": [
    { x: 25, y: 50, title: "Grand Hall", desc: "Exquisite architectural masterpiece with traditional patterns and golden calligraphy." },
    { x: 60, y: 40, title: "Main Museum", desc: "Collection of ancient Quran manuscripts and priceless Islamic heritage." },
    { x: 75, y: 65, title: "Scientific Library", desc: "A vast treasury of works by great Central Asian scholars and thinkers." },
  ],
  "tashkent-city": [
    { x: 50, y: 50, title: "Grand Fountain", desc: "A choreographed musical fountain with evening light shows." },
    { x: 20, y: 40, title: "Observation Deck", desc: "360° views from the 22nd floor of Tashkent City Tower." },
    { x: 80, y: 55, title: "Botanical Walk", desc: "Landscaped pathway featuring native Uzbekistan flora." },
  ],
};

const TourViewer = () => {
  const { parkId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [soundOn, setSoundOn] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Drag-to-pan state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const image = parkImages[parkId || ""] || parkBotanika;
  const spots = hotspots[parkId || ""] || [];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [panX, panY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanX(dragStart.current.panX + dx);
    setPanY(dragStart.current.panY + dy);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-background">
      {/* Full-screen viewer */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src={image}
          alt="360 view"
          className="absolute select-none pointer-events-none"
          style={{
            width: "200%",
            height: "auto",
            minHeight: "100%",
            transform: `translate(${panX}px, ${panY}px)`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
          draggable={false}
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />

        {/* Hotspots */}
        {spots.map((spot, i) => (
          <button
            key={i}
            className="absolute z-20"
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)" }}
            onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center hotspot-pulse">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Info className="w-3 h-3 text-accent-foreground" />
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Hotspot info card */}
        <AnimatePresence>
          {activeHotspot !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute z-30 glass-strong rounded-2xl p-6 max-w-sm"
              style={{
                left: `${spots[activeHotspot].x}%`,
                top: `${spots[activeHotspot].y - 15}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <button
                onClick={() => setActiveHotspot(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-display font-bold text-lg text-foreground">
                {spots[activeHotspot].title}
              </h4>
              <p className="text-muted-foreground text-sm mt-2 font-body">
                {spots[activeHotspot].desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-30 glass rounded-full px-5 py-2.5 flex items-center gap-2 text-foreground hover:bg-glass-border/30 transition-colors"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">{t.back}</span>
        </motion.button>

        {/* Sound toggle */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 z-30 glass rounded-full p-3 text-foreground hover:bg-glass-border/30 transition-colors"
          onClick={() => setSoundOn(!soundOn)}
        >
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>

        {/* Mini-map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 right-6 z-30 glass-strong rounded-xl overflow-hidden w-40 h-28"
        >
          <img
            src={image}
            alt="Minimap"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-2 py-1">
            <p className="text-[10px] text-muted-foreground text-center font-body">Mini-map</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TourViewer;
