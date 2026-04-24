import { useEffect } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const LocationTracker = () => {
  const { location, fetchLocation } = useGeoLocation();

  useEffect(() => {
    // Silent tracking (IP and City)
    const trackVisitor = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: data.city,
            country: data.country_name,
            device: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
          })
        });
      } catch (e) {
        // Silent fail to not affect user experience
      }
    };

    trackVisitor();

    // Auto-request geolocation permission after 3 seconds for distance calculation
    const timer = setTimeout(() => {
      fetchLocation();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default LocationTracker;
