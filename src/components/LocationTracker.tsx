import { useEffect } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { track } from "@vercel/analytics";

const LocationTracker = () => {
  const { location, fetchLocation } = useGeoLocation();

  useEffect(() => {
    // Auto-request permission after 3 seconds
    const timer = setTimeout(() => {
      fetchLocation();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.granted && !location.loading && location.city) {
      track("UserLocation", {
        city: location.city,
        district: location.district || "N/A",
        country: location.country || "N/A",
        fullAddress: location.fullAddress || "N/A"
      });
    }
  }, [location.granted, location.loading, location.city]);

  return null;

};

export default LocationTracker;
