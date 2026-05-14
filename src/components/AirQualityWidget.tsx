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

const getStatusColor = (status: AirQualityData["status"]) => {
  switch (status) {
    case "good": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "moderate": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "unhealthy": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "very-unhealthy": return "text-red-500 bg-red-500/10 border-red-500/20";
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
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded(!expanded)}
    >
      <div className={`glass rounded-2xl border ${getStatusColor(data.status)} cursor-pointer transition-all duration-300 shadow-lg overflow-hidden`}>
        {/* Main Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex items-center justify-center p-1.5 rounded-full bg-white/10">
            {getStatusIcon(data.status)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-lg leading-none">{data.aqi}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold">AQI</span>
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase opacity-90">
              {statusText[data.status][lang as "uz" | "ru" | "en"]}
            </span>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 px-4 py-3 bg-black/20 backdrop-blur-md"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/70">PM2.5:</span>
                <span className="text-xs font-bold text-white">{data.pm25} μg/m³</span>
              </div>
              <p className="text-[10px] text-white/50 leading-tight">
                Tashkent City Air Quality Index (IQAir standard). Updates in real-time.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
