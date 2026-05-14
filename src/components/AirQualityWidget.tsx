import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, AlertCircle, CheckCircle2, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AirQualityData {
  aqi: number;
  pm25: number;
  status: "good" | "moderate" | "unhealthy" | "very-unhealthy";
}

const getAqiStatus = (aqi: number): AirQualityData["status"] => {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy";
  return "very-unhealthy";
};

const getStatusTextColor = (status: AirQualityData["status"]) => {
  switch (status) {
    case "good": return "text-emerald-400";
    case "moderate": return "text-yellow-400";
    case "unhealthy": return "text-orange-500";
    case "very-unhealthy": return "text-red-500";
  }
};

const getStatusBorderColor = (status: AirQualityData["status"]) => {
  switch (status) {
    case "good": return "border-emerald-400/40";
    case "moderate": return "border-yellow-400/40";
    case "unhealthy": return "border-orange-500/40";
    case "very-unhealthy": return "border-red-500/40";
  }
};

const getStatusIcon = (status: AirQualityData["status"]) => {
  switch (status) {
    case "good": return <Leaf className="w-4 h-4" />;
    case "moderate": return <Wind className="w-4 h-4" />;
    case "unhealthy": return <AlertCircle className="w-4 h-4" />;
    case "very-unhealthy": return <AlertCircle className="w-4 h-4" />;
  }
};

export const AirQualityWidget = ({ lat = 41.3111, lon = 69.2406, className = "" }: { lat?: number, lon?: number, className?: string }) => {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`);
        const result = await response.json();
        const aqi = result.current.us_aqi;
        const pm25 = result.current.pm2_5;
        
        setData({
          aqi,
          pm25,
          status: getAqiStatus(aqi)
        });
      } catch (error) {
        console.error("Failed to fetch AQI", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAQI();
    // Refresh every 30 minutes
    const interval = setInterval(fetchAQI, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  if (loading || !data) return null;

  const statusText = {
    "good": { uz: "Yaxshi", ru: "Хорошо", en: "Good" },
    "moderate": { uz: "O'rtacha", ru: "Средне", en: "Moderate" },
    "unhealthy": { uz: "Zararli", ru: "Вредно", en: "Unhealthy" },
    "very-unhealthy": { uz: "O'ta xavfli", ru: "Опасно", en: "Hazardous" }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative z-50 ${className}`}
    >
      <div 
        onClick={() => setExpanded(!expanded)}
        className={`glass-strong rounded-2xl border ${getStatusBorderColor(data.status)} cursor-pointer transition-all duration-300 shadow-2xl overflow-hidden bg-black/60 backdrop-blur-xl flex flex-col`}
      >
        {/* Expanded Details - Top (For desktop bottom placement) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-3 bg-black/20 backdrop-blur-md border-b border-white/10 order-first sm:block hidden"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/70">PM2.5:</span>
                <span className="text-xs font-bold text-white">{data.pm25} μg/m³</span>
              </div>
              <p className="text-[10px] text-white/50 leading-tight">
                Tashkent City Air Quality Index. Based on real-time sensor data.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className={`flex items-center justify-center p-1.5 rounded-full bg-white/10 ${getStatusTextColor(data.status)}`}>
            {getStatusIcon(data.status)}
          </div>
          <div className="flex flex-col">
            <div className={`flex items-baseline gap-1 ${getStatusTextColor(data.status)}`}>
              <span className="font-display font-bold text-lg leading-none">{data.aqi}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold">AQI</span>
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase ${getStatusTextColor(data.status)}/90`}>
              {statusText[data.status][lang as "uz" | "ru" | "en"]}
            </span>
          </div>
        </div>

        {/* Expanded Details - Bottom (For mobile top placement) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-3 bg-black/20 backdrop-blur-md border-t border-white/10 sm:hidden"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/70">PM2.5:</span>
                <span className={`text-xs font-bold text-white`}>{data.pm25} μg/m³</span>
              </div>
              <p className="text-[10px] text-white/50 leading-tight">
                Tashkent City Air Quality Index. Based on real-time sensor data.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
