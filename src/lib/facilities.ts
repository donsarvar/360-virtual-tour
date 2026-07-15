// Parklar uchun vaqtinchalik (local) sharoitlar ma'lumotlari
// Firebase'ga ulanmasdan, sayt shu fayldan ma'lumot o'qiydi
// Keyinchalik Firebase'dan o'qishga o'tkazamiz

export interface ParkFacilities {
  has_ramp: boolean;
  has_parking: boolean;
  has_playground: boolean;
  has_cafe: boolean;
  has_nursing_room: boolean;
  has_clean_restroom: boolean;
  has_wifi: boolean;
  has_bike_rental: boolean;
  shade_level: "low" | "medium" | "high";
  noise_level: "low" | "medium" | "high";
  child_friendly: boolean;
  entry_fee: "free" | "paid";
  working_hours: string;
}

// Sharoitlar ro'yxati — ikonkalar va nomlar bilan
export const FACILITY_LABELS: Record<string, { uz: string; ru: string; en: string; emoji: string }> = {
  has_ramp:           { uz: "Rampa",              ru: "Пандус",              en: "Wheelchair Ramp",   emoji: "♿" },
  has_parking:        { uz: "Avtoturargoh",       ru: "Парковка",            en: "Parking",           emoji: "🅿️" },
  has_playground:     { uz: "Bolalar maydoni",    ru: "Детская площадка",    en: "Playground",        emoji: "🎠" },
  has_cafe:           { uz: "Kafe",               ru: "Кафе",                en: "Café",              emoji: "☕" },
  has_nursing_room:   { uz: "Emizish xonasi",     ru: "Комната кормления",   en: "Nursing Room",      emoji: "🍼" },
  has_clean_restroom: { uz: "Hojatxona",          ru: "Туалет",              en: "Restroom",          emoji: "🚻" },
  has_wifi:           { uz: "Wi-Fi",              ru: "Wi-Fi",               en: "Wi-Fi",             emoji: "📶" },
  has_bike_rental:    { uz: "Velosiped ijarasi",  ru: "Прокат велосипедов",  en: "Bike Rental",       emoji: "🚲" },
  child_friendly:     { uz: "Bolalar uchun",      ru: "Для детей",           en: "Child Friendly",    emoji: "👶" },
};

export const LEVEL_LABELS = {
  shade_level: {
    low:    { uz: "Kam soya",     ru: "Мало тени",     en: "Low shade" },
    medium: { uz: "O'rtacha soya", ru: "Средняя тень",  en: "Medium shade" },
    high:   { uz: "Ko'p soya",    ru: "Много тени",    en: "High shade" },
  },
  noise_level: {
    low:    { uz: "Tinch",        ru: "Тихо",          en: "Quiet" },
    medium: { uz: "O'rtacha",     ru: "Средне",        en: "Moderate" },
    high:   { uz: "Shovqinli",    ru: "Шумно",         en: "Noisy" },
  },
  entry_fee: {
    free: { uz: "Bepul",   ru: "Бесплатно", en: "Free" },
    paid: { uz: "Pullik",  ru: "Платно",    en: "Paid" },
  }
};

// 3 ta parkning demo sharoitlari
export const MOCK_FACILITIES: Record<string, ParkFacilities> = {
  "botanika": {
    has_ramp: true,
    has_parking: true,
    has_playground: true,
    has_cafe: true,
    has_nursing_room: false,
    has_clean_restroom: true,
    has_wifi: false,
    has_bike_rental: false,
    shade_level: "high",
    noise_level: "low",
    child_friendly: true,
    entry_fee: "paid",
    working_hours: "06:00-22:00"
  },
  "ecopark": {
    has_ramp: true,
    has_parking: true,
    has_playground: true,
    has_cafe: true,
    has_nursing_room: true,
    has_clean_restroom: true,
    has_wifi: true,
    has_bike_rental: true,
    shade_level: "medium",
    noise_level: "medium",
    child_friendly: true,
    entry_fee: "free",
    working_hours: "07:00-23:00"
  },
  "islamic-center": {
    has_ramp: true,
    has_parking: true,
    has_playground: false,
    has_cafe: true,
    has_nursing_room: false,
    has_clean_restroom: true,
    has_wifi: true,
    has_bike_rental: false,
    shade_level: "low",
    noise_level: "low",
    child_friendly: false,
    entry_fee: "free",
    working_hours: "09:00-18:00"
  }
};

// Parkning sharoitlarini olish (hozircha local, keyinchalik Firebase'dan)
export function getParkFacilities(parkId: string): ParkFacilities | null {
  return MOCK_FACILITIES[parkId] || null;
}

// Faqat "bor" (true) bo'lgan sharoitlarni qaytaradi
export function getAvailableFacilities(parkId: string): string[] {
  const facilities = MOCK_FACILITIES[parkId];
  if (!facilities) return [];

  return Object.entries(facilities)
    .filter(([key, val]) => val === true && key in FACILITY_LABELS)
    .map(([key]) => key);
}
