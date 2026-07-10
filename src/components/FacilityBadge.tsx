import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Wheelchair, 
  ParkingCircle, 
  Gamepad2, 
  Coffee, 
  Baby, 
  Bath, 
  Wifi, 
  Bike, 
  Smile, 
  Ticket 
} from "lucide-react";
import { FACILITY_LABELS, LEVEL_LABELS } from "@/lib/facilities";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap: Record<string, React.FC<any>> = {
  has_ramp: Wheelchair,
  has_parking: ParkingCircle,
  has_playground: Gamepad2,
  has_cafe: Coffee,
  has_nursing_room: Baby,
  has_clean_restroom: Bath,
  has_wifi: Wifi,
  has_bike_rental: Bike,
  child_friendly: Smile,
};

interface FacilityBadgeProps {
  facilityKey: string;
  variant?: "card" | "panel";
}

export const FacilityBadge: React.FC<FacilityBadgeProps> = ({ facilityKey, variant = "card" }) => {
  const { lang } = useLanguage();
  const Icon = iconMap[facilityKey];
  const langKey = lang as "uz" | "ru" | "en";
  const label = FACILITY_LABELS[facilityKey]?.[langKey];

  if (!Icon || !label) return null;

  if (variant === "card") {
    // Premium sleak badge for Park Cards (no text, just icon with tooltip)
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-help shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <Icon className="w-4 h-4 text-white/90" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-black/80 border-white/10 text-white font-medium backdrop-blur-xl">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Panel variant (with text)
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
      <div className="p-1.5 rounded-full bg-accent/20">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <span className="text-sm font-medium text-white/90">{label}</span>
    </div>
  );
};

interface EntryFeeBadgeProps {
  feeType: "free" | "paid";
  variant?: "card" | "panel";
}

export const EntryFeeBadge: React.FC<EntryFeeBadgeProps> = ({ feeType, variant = "card" }) => {
  const { lang } = useLanguage();
  const langKey = lang as "uz" | "ru" | "en";
  const label = LEVEL_LABELS.entry_fee[feeType]?.[langKey];

  if (variant === "card") {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-3 h-8 rounded-full bg-accent/15 hover:bg-accent/25 border border-accent/30 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-help shadow-[0_0_10px_rgba(20,184,166,0.2)]">
              <Ticket className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent tracking-wide uppercase">{label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-black/80 border-accent/20 text-accent font-medium backdrop-blur-xl">
            {lang === "uz" ? "Kirish narxi" : "Стоимость входа"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
      <span className="text-accent/60 block mb-0.5 text-xs flex items-center gap-1">
        <Ticket className="w-3 h-3" /> {lang === "uz" ? "Kirish" : "Вход"}
      </span>
      <span className="text-accent font-bold text-sm uppercase">{label}</span>
    </div>
  );
};
