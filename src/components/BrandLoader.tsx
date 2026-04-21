import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import backgroundImage from "@/assets/park-botanika.jpg";

const BrandLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {progress <= 100 && (
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
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-muted-foreground text-sm font-body tracking-widest uppercase">
              {progress < 100 ? "Sayohat yuklanmoqda..." : "Tayyor"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandLoader;
