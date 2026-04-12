import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

import parkBotanika from "@/assets/park-botanika.jpg";
import parkMagicCity from "@/assets/park-magic-city.jpg";
import parkTashkentCity from "@/assets/park-tashkent-city.jpg";

const ParkSelection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const parks = [
    {
      id: "botanika",
      name: t.botanika,
      desc: t.botanikaDesc,
      image: parkBotanika,
    },
    {
      id: "magic-city",
      name: t.magicCity,
      desc: t.magicCityDesc,
      image: parkMagicCity,
    },
    {
      id: "tashkent-city",
      name: t.tashkentCity,
      desc: t.tashkentCityDesc,
      image: parkTashkentCity,
    },
  ];

  return (
    <section id="parks" className="py-24 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            {t.parks}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-body">
            {t.parksSubtitle}
          </p>
        </motion.div>

        {/* Expanding Cards */}
        <div className="flex flex-col md:flex-row gap-4 h-[500px] md:h-[600px]">
          {parks.map((park, index) => {
            const isHovered = hoveredIndex === index;
            const hasHover = hoveredIndex !== null;

            return (
              <motion.div
                key={park.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  flex: isHovered ? 3 : hasHover ? 0.8 : 1,
                  transition: "flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => navigate(`/tour/${park.id}`)}
              >
                {/* Image */}
                <img
                  src={park.image}
                  alt={park.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-background/60 transition-all duration-500 group-hover:bg-background/40" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                  <h3
                    className="text-xl md:text-3xl font-display font-bold transition-all duration-500"
                    style={{
                      transform: isHovered ? "translateY(0)" : "translateY(0)",
                    }}
                  >
                    {park.name}
                  </h3>

                  <div
                    className="overflow-hidden transition-all duration-500"
                    style={{
                      maxHeight: isHovered ? "200px" : "0",
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    <p className="text-secondary-foreground/80 mt-3 text-sm md:text-base font-body">
                      {park.desc}
                    </p>
                    <button className="mt-4 px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-bold tracking-wide hover:scale-105 transition-transform glow-pulse">
                      {t.explorePark}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ParkSelection;
