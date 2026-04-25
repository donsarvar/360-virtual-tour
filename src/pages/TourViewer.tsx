import { useState, useRef, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Volume2, VolumeX, MapPin, X, Info, ArrowUpRight } from "lucide-react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Sphere, OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import LocationTracker from "@/components/LocationTracker";

import parkBotanika from "@/assets/park-botanika.jpg";
import parkIslamicCenter from "@/assets/park-islamic-center.png";
import parkEcoPark from "@/assets/park-ecopark.png";

const PanoramaSphere = ({ url, opacity = 1 }: { url: string; opacity?: number }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  
  // Large texture optimization
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return (
    <Sphere args={[500, 128, 64]} scale={[-1, 1, 1]}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} transparent opacity={opacity} />
    </Sphere>
  );
};

const NavPoint = ({ pos, onClick, label }: { pos: [number, number, number]; onClick: () => void; label: string }) => (
  <group position={pos}>
    <Html center>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="cursor-pointer group flex flex-col items-center gap-2"
      >
        {/* Direction Label - Now permanently visible */}
        <div className="glass px-4 py-1.5 rounded-full transition-all duration-300 transform -translate-y-2 border border-white/20">
          <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent">{label}</span>
        </div>

        {/* Professional Ground Arrow */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Ground shadow/glow effect */}
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
          
          {/* Stylized Arrow Icon */}
          <div className="relative glass-strong p-4 rounded-2xl border-2 border-white/20 group-hover:border-accent/50 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]">
            <ArrowUpRight 
              className={`text-white w-10 h-10 transition-transform duration-300 ${label === "Ortga" ? "rotate-[135deg]" : "-rotate-[45deg]"}`} 
            />
          </div>
        </div>
      </motion.div>
    </Html>
  </group>
);

const TourViewer = () => {
  const { parkId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [soundOn, setSoundOn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [currentScene, setCurrentScene] = useState("1");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio handling
  useEffect(() => {
    const audioUrls: Record<string, string> = {
      "botanika": "/audio/Botanika bogi.m4a",
      "islamic-center": "/audio/Islom sivilizatsiya markazi.mp3",
      "ecopark": "/audio/Eko park.mp3",
    };

    if (soundOn && parkId && audioUrls[parkId]) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrls[parkId]);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5; // Set volume to 50%
      }
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser", e));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundOn, parkId]);

  const getParkName = (id: string | undefined) => {
    switch (id) {
      case "botanika": return "Botanika Bog'i";
      case "islamic-center": return "Islom Sivilizatsiyasi Markazi";
      case "ecopark": return "Eko Park";
      default: return "Park";
    }
  };

  const parkName = getParkName(parkId);

  const getParkFullDesc = (id: string | undefined) => {
    switch (id) {
      case "botanika": return t.botanikaFullDesc;
      case "islamic-center": return t.islamicCenterFullDesc;
      case "ecopark": return t.ecoParkFullDesc;
      default: return "";
    }
  };

  const parkFullDesc = getParkFullDesc(parkId);

  const getParkImage = (id: string | undefined) => {
    switch (id) {
      case "botanika": return parkBotanika;
      case "islamic-center": return parkIslamicCenter;
      case "ecopark": return parkEcoPark;
      default: return "";
    }
  };

  const parkImage = getParkImage(parkId);

  // Dynamic Scene Generation for Botanika (1-19)
  const getScenes = () => {
    if (parkId === "botanika") {
      const botanikaScenes: Record<string, any> = {};
      for (let i = 1; i <= 19; i++) {
        botanikaScenes[i.toString()] = {
          url: `/botanika/${i}.jpg`,
          navPoints: [
            ...(i < 19 ? [{ to: (i + 1).toString(), pos: [100, -60, 0] as [number, number, number], label: "Oldinga" }] : []),
            ...(i > 1 ? [{ to: (i - 1).toString(), pos: [-100, -60, 0] as [number, number, number], label: "Ortga" }] : []),
          ]
        };
      }
      return botanikaScenes;
    }

    // Default scenes for other parks
    return {
      "1": {
        url: `/${parkId}/image1.jpg`,
        navPoints: []
      },
    };
  };

  const scenes = getScenes();
  const currentSceneData = scenes[currentScene] || scenes["1"];

  const handleSceneChange = (targetId: string) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    // Fade out
    gsap.to({ val: 1 }, {
      val: 0,
      duration: 0.5,
      onUpdate: function() { setOpacity(this.targets()[0].val); },
      onComplete: () => {
        setCurrentScene(targetId);
        // Fade in
        gsap.to({ val: 0 }, {
          val: 1,
          duration: 0.5,
          delay: 0.1,
          onUpdate: function() { setOpacity(this.targets()[0].val); },
          onComplete: () => setIsTransitioning(false)
        });
      }
    });
  };

  const [yaw, setYaw] = useState(0);

  return (
    <div className="fixed inset-0 bg-background">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} ref={cameraRef} />
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-accent font-display tracking-[0.3em] uppercase text-xs">{parkName} {t.loadingTour}</p>
                <p className="text-white/30 text-[10px]">{t.highQualityImage}</p>
              </div>
            </Html>
          }>
            <PanoramaSphere url={currentSceneData.url} opacity={opacity} />
            
            {/* Render Navigation Points */}
            {!isTransitioning && currentSceneData.navPoints?.map((pt: any, idx: number) => (
              <NavPoint 
                key={idx} 
                pos={pt.pos} 
                label={pt.label}
                onClick={() => handleSceneChange(pt.to)} 
              />
            ))}
          </Suspense>
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={-0.4} 
            onChange={(e) => {
              if (e?.target?.object) {
                // Get horizontal rotation in degrees
                const rotation = e.target.object.rotation.y * (180 / Math.PI);
                setYaw(rotation);
              }
            }}
          />
        </Canvas>
      </div>

      {/* Original UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />

        {/* UI Overlay content remains but hotspots are removed */}


        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-30 glass rounded-full px-5 py-2.5 flex items-center gap-2 text-foreground hover:bg-glass-border/30 transition-colors pointer-events-auto"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">{t.back}</span>
        </motion.button>

        {/* Top Right Buttons */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3 pointer-events-auto">
          {/* Info toggle */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-full p-3 text-foreground hover:bg-glass-border/30 transition-colors"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-5 h-5 text-accent" />
          </motion.button>

          {/* Sound toggle */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-full p-3 text-foreground hover:bg-glass-border/30 transition-colors"
            onClick={() => setSoundOn(!soundOn)}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Mini-map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 right-6 z-30 glass-strong rounded-xl overflow-hidden w-44 h-32 border border-white/10"
        >
          {/* Stylized Map Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1)_0%,transparent_70%)] opacity-50" />
          
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Compass Circle */}
            <div className="w-24 h-24 rounded-full border border-dashed border-white/20 absolute" />
            
            {/* Rotating Direction Marker */}
            <motion.div 
              style={{ rotate: yaw }}
              className="relative flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              {/* Sight cone indicator */}
              <div className="absolute -top-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-accent" />
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md px-2 py-1 border-t border-white/5">
            <p className="text-[9px] text-accent font-display font-medium text-center uppercase tracking-widest">{parkName}</p>
          </div>
        </motion.div>

        {/* Info Sidebar Overlay */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 glass-strong z-50 pointer-events-auto flex flex-col"
            >
              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold text-white">{t.infoTitle}</h2>
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white/50" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                    <img 
                      src={parkImage} 
                      alt={parkName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <h3 className="text-xl font-display font-semibold text-accent">{parkName}</h3>
                  
                  <div className="prose prose-invert prose-sm">
                    <p className="text-white/80 leading-relaxed font-body text-base">
                      {parkFullDesc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-display">© 2026 Tashkent360</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      <LocationTracker />
    </div>
  );
};

export default TourViewer;

