import { useState } from "react";

export interface LocationInfo {
  country?: string;
  city?: string;
  district?: string;
  fullAddress?: string;
  lat?: number;
  lon?: number;
  error?: string;
  loading: boolean;
  granted: boolean;
}

export const useGeoLocation = () => {
  const [location, setLocation] = useState<LocationInfo>({
    loading: false,
    granted: false,
  });

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: "Brauzeringiz geolokatsiyani qollab-quvvatlamaydi.", loading: false }));
      return;
    }
    setLocation(prev => ({ ...prev, loading: true, error: undefined }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "uz,ru,en", "User-Agent": "360VirtualTourApp" } }
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const district = addr.suburb || addr.city_district || addr.neighbourhood || addr.quarter || addr.district;
          const city = addr.city || addr.town || addr.village || addr.county;
          const country = addr.country;
          setLocation({ loading: false, granted: true, lat: latitude, lon: longitude, country, city, district, fullAddress: data.display_name });
          console.log("[GeoLocation]", { country, city, district, fullAddress: data.display_name });
        } catch {
          setLocation(prev => ({ ...prev, loading: false, granted: true, lat: latitude, lon: longitude, error: "Manzilni olishda xatolik." }));
        }
      },
      (err) => {
        const msgs: Record<number, string> = { 1: "Ruxsat berilmadi.", 2: "Joylashuv mavjud emas.", 3: "Muddat tugadi." };
        setLocation(prev => ({ ...prev, loading: false, granted: false, error: msgs[err.code] ?? "Noma`lum xatolik." }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  return { location, fetchLocation };
};
