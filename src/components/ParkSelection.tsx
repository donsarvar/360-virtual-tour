import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { MapPin, Map as MapIcon, ExternalLink } from "lucide-react";

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

  const parks = [
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

        {/* Expanding Cards */}
        <div className="flex flex-col md:flex-row gap-4 h-[500px] md:h-[600px]">
          {parks.map((park, index) => {
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
                    <p className="text-secondary-foreground/80 mt-3 text-sm md:text-base font-body">
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
      </div>
    </section>
  );
};

export default ParkSelection;
