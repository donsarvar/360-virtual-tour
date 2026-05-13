import { useState, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ParkSelection from "@/components/ParkSelection";
import BrandLoader from "@/components/BrandLoader";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, Instagram, MessageCircle, Code2 } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <BrandLoader onComplete={handleLoaderComplete} />}
      <div className={loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <Header />
        <HeroSection />
        <ParkSelection />
        
        {/* Footer */}
        <footer className="py-8 border-t border-white/5 relative">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-xs font-body tracking-wider uppercase">
              © 2026 Tashkent360. {t.allRightsReserved}
            </p>
            
            <button 
              onClick={() => setShowContact(true)}
              className="text-xs font-bold uppercase tracking-widest text-accent hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
            >
              <Code2 className="w-3 h-3" />
              {t.contactUs}
            </button>
          </div>
        </footer>

        {/* Contact Modal */}
        <AnimatePresence>
          {showContact && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowContact(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-[2rem] p-8 w-full max-w-md border border-white/20 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowContact(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50 hover:text-white" />
                </button>

                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent to-accent/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(20,184,166,0.3)] border border-accent/30">
                    <Code2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-1">{t.developer}</h3>
                  <p className="text-white/50 text-sm tracking-widest uppercase">{t.contactUs}</p>
                </div>

                <div className="space-y-4">
                  <a href="tel:+998000000000" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                    <div className="p-3 rounded-full bg-white/5 text-accent group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider">{t.phone}</p>
                      <p className="text-white font-medium">+998 00 000 00 00</p>
                    </div>
                  </a>

                  <a href="mailto:example@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                    <div className="p-3 rounded-full bg-white/5 text-accent group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider">{t.email}</p>
                      <p className="text-white font-medium">example@gmail.com</p>
                    </div>
                  </a>

                  <div className="flex justify-center gap-4 pt-4">
                    <a href="#" className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-[#0088cc] hover:border-[#0088cc]/50 transition-all group">
                      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="#" className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-[#E1306C] hover:border-[#E1306C]/50 transition-all group">
                      <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Index;
