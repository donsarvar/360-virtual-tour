import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-tashkent.jpg";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const { t } = useLanguage();

  const scrollToParks = () => {
    document.getElementById("parks")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Tashkent aerial view"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black leading-tight max-w-5xl"
        >
          {t.heroTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-body"
        >
          {t.heroSub}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={scrollToParks}
          className="mt-10 px-8 py-4 rounded-full bg-accent text-accent-foreground font-display font-bold text-lg tracking-wide glow-pulse transition-transform hover:scale-105"
        >
          {t.startJourney}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10"
        >
          <ChevronDown
            className="w-8 h-8 text-muted-foreground animate-bounce cursor-pointer"
            onClick={scrollToParks}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
