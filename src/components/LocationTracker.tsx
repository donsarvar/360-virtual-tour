import { useEffect } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const LocationTracker = () => {
  const { location, fetchLocation } = useGeoLocation();

  useEffect(() => {
    // Auto-request permission after 3 seconds
    const timer = setTimeout(() => {
      fetchLocation();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {(location.loading || location.granted || location.error) && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-24 left-6 z-50 rounded-2xl p-4 max-w-xs shadow-2xl"
          style={{
            background: "rgba(15,15,25,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {location.loading && (
            <div className="flex items-center gap-3 text-white">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm">Joylashuvingiz aniqlanmoqda...</span>
            </div>
          )}

          {location.granted && !location.loading && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Sizning joylashuvingiz
                </span>
              </div>
              {location.country && (
                <p className="text-white text-sm">
                  ?? <span className="font-medium">{location.country}</span>
                </p>
              )}
              {location.city && (
                <p className="text-white/80 text-sm">
                  ??? <span>{location.city}</span>
                </p>
              )}
              {location.district && (
                <p className="text-white/60 text-xs">
                  ?? <span>{location.district}</span>
                </p>
              )}
              {!location.district && !location.city && location.fullAddress && (
                <p className="text-white/50 text-xs leading-snug line-clamp-2">{location.fullAddress}</p>
              )}
            </div>
          )}

          {location.error && !location.loading && (
            <div className="flex items-start gap-2">
              <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-xs">{location.error}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationTracker;
