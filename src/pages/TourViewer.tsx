import { useState, useRef, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Volume2, VolumeX, MapPin, X, Info, ChevronUp, ChevronDown, Map as MapIcon } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Sphere, OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import LocationTracker from "@/components/LocationTracker";
import BrandLoader from "@/components/BrandLoader";

import parkBotanika from "@/assets/park-botanika.jpg";
import parkIslamicCenter from "@/assets/park-islamic-center.png";
import parkEcoPark from "@/assets/park-ecopark.png";

const PanoramaSphere = ({ texture, opacity = 1, scale = 1 }: { texture: THREE.Texture | null; opacity?: number; scale?: number }) => {
  if (!texture) return null;
  return (
    <Sphere args={[500, 64, 32]} scale={[-scale, scale, scale]}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} transparent opacity={opacity} depthTest={false} />
    </Sphere>
  );
};

const TourViewer = () => {
  const { parkId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [soundOn, setSoundOn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [textureA, setTextureA] = useState<THREE.Texture | null>(null);
  const [textureB, setTextureB] = useState<THREE.Texture | null>(null);
  const [activeBuffer, setActiveBuffer] = useState<"A" | "B">("A");
  
  const [currentSceneId, setCurrentSceneId] = useState("1");
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);
  const [sphereScale, setSphereScale] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textureLoader = useRef(new THREE.TextureLoader());

  useEffect(() => {
    const initialUrl = getScenes()["1"].url;
    textureLoader.current.load(initialUrl, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      setTextureA(tex);
      setTimeout(() => setIsInitialLoading(false), 500);
    });
  }, [parkId]);

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
        audioRef.current.volume = 0.5;
      }
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) audioRef.current.pause();

    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [soundOn, parkId]);

  const getParkName = () => {
    switch (parkId) {
      case "botanika": return "Botanika Bog'i";
      case "islamic-center": return "Islom Sivilizatsiyasi Markazi";
      case "ecopark": return "Eko Park";
      default: return "Park";
    }
  };

  const getScenes = () => {
    if (parkId === "botanika") {
      const botanikaScenes: Record<string, any> = {};
      for (let i = 1; i <= 17; i++) {
        botanikaScenes[i.toString()] = {
          url: `/botanika/${i}.webp?v=4`,
          navPoints: [
            ...(i < 17 ? [{ to: (i + 1).toString(), label: "OLDINGA" }] : []),
            ...(i > 1 ? [{ to: (i - 1).toString(), label: "ORTGA" }] : []),
          ]
        };
      }
      return botanikaScenes;
    }
    return { "1": { url: `/${parkId}/image1.jpg`, navPoints: [] } };
  };

  const scenes = getScenes();
  const currentSceneData = scenes[currentSceneId] || scenes["1"];

  const handleSceneChange = (targetId: string, direction: "OLDINGA" | "ORTGA") => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    const nextUrl = scenes[targetId]?.url;
    if (!nextUrl) { setIsTransitioning(false); return; }

    gsap.to(cameraRef.current, { fov: 35, duration: 1.2, ease: "power2.inOut", onUpdate: () => cameraRef.current.updateProjectionMatrix() });

    textureLoader.current.load(nextUrl, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      if (activeBuffer === "A") setTextureB(tex); else setTextureA(tex);

      gsap.to({ opA: opacityA, opB: opacityB, scale: 1 }, {
        opA: activeBuffer === "A" ? 0 : 1,
        opB: activeBuffer === "A" ? 1 : 0,
        scale: direction === "OLDINGA" ? 1.4 : 0.7,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: function() {
          const t = this.targets()[0];
          setOpacityA(t.opA); setOpacityB(t.opB); setSphereScale(t.scale);
        },
        onComplete: () => {
          setActiveBuffer(activeBuffer === "A" ? "B" : "A");
          setCurrentSceneId(targetId);
          gsap.to(cameraRef.current, { fov: 75, duration: 1.0, ease: "power2.out", onUpdate: () => cameraRef.current.updateProjectionMatrix() });
          gsap.to({ scale: sphereScale }, {
            scale: 1, duration: 1.0, ease: "power2.out",
            onUpdate: function() { setSphereScale(this.targets()[0].scale); },
            onComplete: () => setIsTransitioning(false)
          });
        }
      });
    });
  };

  const [yaw, setYaw] = useState(0);

  if (isInitialLoading) { return <BrandLoader />; }

  const forwardPoint = currentSceneData?.navPoints?.find((p: any) => p.label === "OLDINGA");
  const backwardPoint = currentSceneData?.navPoints?.find((p: any) => p.label === "ORTGA");

  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} ref={cameraRef} />
          <group>
            <PanoramaSphere texture={textureA} opacity={opacityA} scale={activeBuffer === "A" ? sphereScale : 1} />
            <PanoramaSphere texture={textureB} opacity={opacityB} scale={activeBuffer === "B" ? sphereScale : 1} />
          </group>
          <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.05} rotateSpeed={-0.4} onChange={(e) => {
            if (e?.target?.object) setYaw(e.target.object.rotation.y * (180 / Math.PI));
          }} />
        </Canvas>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10 font-display">
        {/* Top Controls */}
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 left-6 z-30 glass rounded-full px-5 py-2.5 flex items-center gap-2 text-white pointer-events-auto shadow-lg" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wider">{t.back}</span>
        </motion.button>
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3 pointer-events-auto">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className={`glass rounded-full p-3 shadow-lg transition-colors ${showMap ? 'bg-accent/40 border-accent/50' : ''}`} 
            onClick={() => setShowMap(!showMap)}
          >
            <MapIcon className={`w-5 h-5 ${showMap ? 'text-white' : 'text-white/80'}`} />
          </motion.button>
          <motion.button className="glass rounded-full p-3 shadow-lg" onClick={() => setShowInfo(!showInfo)}><Info className="w-5 h-5 text-accent" /></motion.button>
          <motion.button className="glass rounded-full p-3 shadow-lg" onClick={() => setSoundOn(!soundOn)}>{soundOn ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white" />}</motion.button>
        </div>

        {/* Navigation Hub - Hidden when Map is open on Mobile */}
        <AnimatePresence>
          {!showMap && (
            <div className="absolute bottom-10 left-0 right-0 z-40 pointer-events-auto flex justify-center px-6">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="glass-strong rounded-3xl p-2 flex items-center gap-2 border border-white/10 shadow-2xl"
              >
                <button disabled={!backwardPoint || isTransitioning} onClick={() => backwardPoint && handleSceneChange(backwardPoint.to, "ORTGA")} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${!backwardPoint ? 'opacity-30' : 'hover:bg-white/10 active:scale-95'}`}>
                  <ChevronDown className="w-6 h-6 text-white" /><span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{t.backward}</span>
                </button>
                <div className="w-[1px] h-10 bg-white/10" />
                <button disabled={!forwardPoint || isTransitioning} onClick={() => forwardPoint && handleSceneChange(forwardPoint.to, "OLDINGA")} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${!forwardPoint ? 'opacity-30' : 'hover:bg-white/10 active:scale-95'}`}>
                  <ChevronUp className="w-6 h-6 text-accent animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.forward}</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Animated Real-Map - Adaptive for Mobile/Desktop */}
        <AnimatePresence>
          {showMap && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`absolute z-50 pointer-events-auto flex flex-col shadow-2xl overflow-hidden
                ${window.innerWidth < 768 
                  ? 'inset-x-6 top-24 bottom-24 rounded-[40px]' // Mobile: Large centered modal
                  : 'bottom-8 right-8 w-80 h-60 rounded-3xl' // Desktop: Corner element
                } glass-strong border border-white/20`}
            >
              <div className="w-full h-full relative bg-black/60 overflow-hidden">
                <img src={`/maps/${parkId}.png`} alt="Park Map" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen" />
                
                {/* Compass on Map */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div style={{ rotate: yaw }} className={`relative flex items-center justify-center ${window.innerWidth < 768 ? 'scale-150' : 'scale-125'}`}>
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center border border-accent/50 shadow-[0_0_20px_rgba(20,184,166,0.6)]">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div className="absolute -top-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-accent drop-shadow-[0_0_8px_rgba(20,184,166,1)]" />
                  </motion.div>
                </div>

                {/* Big Close Button for Mobile */}
                <button 
                  onClick={() => setShowMap(false)} 
                  className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all active:scale-90"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                
                {/* Bottom Label */}
                <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl px-4 py-3 border-t border-white/5 text-center uppercase tracking-[0.2em] text-[10px] text-accent font-bold">
                  {getParkName()} — {t.infoTitle}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Sidebar */}
        <AnimatePresence>{showInfo && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 glass-strong z-50 pointer-events-auto flex flex-col p-10 border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-10"><h2 className="text-2xl font-bold text-white tracking-tight">{t.infoTitle}</h2><button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-6 h-6 text-white/50" /></button></div>
            <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
              <img src={parkId === "botanika" ? parkBotanika : parkId === "islamic-center" ? parkIslamicCenter : parkEcoPark} alt={getParkName()} className="w-full h-56 object-cover rounded-2xl shadow-xl border border-white/10" />
              <div className="prose prose-invert prose-sm">
                <p className="text-white/70 leading-relaxed text-lg font-body">{parkId === "botanika" ? t.botanikaFullDesc : parkId === "islamic-center" ? t.islamicCenterFullDesc : t.ecoParkFullDesc}</p>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>
      </div>
      <LocationTracker />
    </div>
  );
};

export default TourViewer;
