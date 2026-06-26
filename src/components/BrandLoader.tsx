import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "@/assets/park-botanika.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const BrandLoader = ({ onComplete, progress: customProgress }: { onComplete?: () => void; progress?: number }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (customProgress !== undefined) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete, customProgress]);

  useEffect(() => {
    if (customProgress !== undefined && customProgress >= 100) {
      if (onComplete) setTimeout(onComplete, 400);
    }
  }, [customProgress, onComplete]);

  const displayProgress = customProgress !== undefined ? customProgress : progress;

  return (
    <AnimatePresence>
      {displayProgress <= 100 && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Blurred Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={backgroundImage} 
              alt="Background" 
              className="w-full h-full object-cover blur-2xl scale-110 brightness-[0.3]"
            />
            <div className="absolute inset-0 bg-background/40" />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 relative z-10"
          >
            <div className="flex flex-col items-center">
              <img src="/logo.svg" alt="Tashkent360 Logo" className="h-24 md:h-32 w-auto animate-pulse-slow" />
            </div>
            <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            <p className="text-muted-foreground text-sm font-body tracking-widest uppercase">
              {displayProgress < 100 ? `${t.tourStartMessage} (${displayProgress}%)` : t.tayyor}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandLoader;
