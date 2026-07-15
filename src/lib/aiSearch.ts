import { ParkFacilities } from "./facilities";

export interface SearchFilters {
  has_ramp?: boolean;
  has_parking?: boolean;
  has_playground?: boolean;
  has_cafe?: boolean;
  has_nursing_room?: boolean;
  has_clean_restroom?: boolean;
  has_wifi?: boolean;
  has_bike_rental?: boolean;
  child_friendly?: boolean;
  entry_fee?: "free" | "paid";
  shade_level?: "low" | "medium" | "high";
  noise_level?: "low" | "medium" | "high";
}

/**
 * Vaqtinchalik (Mock) AI qidiruv xizmati.
 * Haqiqiy OpenAI/Gemini ulanguncha so'zlarni qarab filtr qaytaradi.
 */
export async function parseSearchQuery(query: string): Promise<SearchFilters> {
  // Haqiqiy AI da bu yerda API ga so'rov ketadi (GPT yoki Gemini)
  // Hozircha oddiy so'zlarni qidiramiz (Mock AI)
  
  const q = query.toLowerCase();
  const filters: SearchFilters = {};

  if (q.includes("bolalar") || q.includes("deti") || q.includes("children")) {
    filters.child_friendly = true;
  }
  if (q.includes("maydoncha") || q.includes("ploshadka") || q.includes("playground")) {
    filters.has_playground = true;
  }
  if (q.includes("kafe") || q.includes("cafe") || q.includes("ovqat") || q.includes("kofe")) {
    filters.has_cafe = true;
  }
  if (q.includes("bepul") || q.includes("besplatno") || q.includes("free")) {
    filters.entry_fee = "free";
  }
  if (q.includes("tinch") || q.includes("tihiy") || q.includes("quiet")) {
    filters.noise_level = "low";
  }
  if (q.includes("nogiron") || q.includes("kolyaska") || q.includes("invalid") || q.includes("rampa")) {
    filters.has_ramp = true;
  }
  if (q.includes("emizish") || q.includes("ona va bola") || q.includes("kormleniy")) {
    filters.has_nursing_room = true;
  }
  if (q.includes("parking") || q.includes("stoyanka") || q.includes("mashina")) {
    filters.has_parking = true;
  }
  if (q.includes("soya") || q.includes("daraxt") || q.includes("ten")) {
    filters.shade_level = "high";
  }

  // Biroz kutishni simulyatsiya qilamiz (AI o'ylayotgandek)
  await new Promise(resolve => setTimeout(resolve, 800));

  return filters;
}
