import { useState, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ParkSelection from "@/components/ParkSelection";
import BrandLoader from "@/components/BrandLoader";

const Index = () => {
  const [loading, setLoading] = useState(true);

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
        <footer className="py-12 text-center border-t border-border">
          <p className="text-muted-foreground text-sm font-body">
            © 2026 Tashkent360. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
};

export default Index;
