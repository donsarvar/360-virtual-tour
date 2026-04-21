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

  return null;

};

export default LocationTracker;
