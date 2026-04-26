import { useState, useRef, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Volume2, VolumeX, MapPin, X, Info, ArrowUp, ArrowDown } from "lucide-react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Sphere, OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import LocationTracker from "@/components/LocationTracker";

import parkBotanika from "@/assets/park-botanika.jpg";
import parkIslamicCenter from "@/assets/park-islamic-center.png";
import parkEcoPark from "@/assets/park-ecopark.png";

// Optimization: Pre-loading textures
const PanoramaSphere = ({ url, opacity = 1, scale = 1 }: { url: string; opacity?: number; scale?: number }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return (
    <Sphere args={[500, 128, 64]} scale={[-scale, scale, scale]}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} transparent opacity={opacity} depthTest={false} />
    </Sphere>
  );
};

const NavPoint = ({ pos, onClick, label }: { pos: [number, number, number]; onClick: () => void; label: string }) => {
  return (
    <group position={pos}>
      <Html center>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="cursor-pointer group flex flex-col items-center gap-2"
        >
          <div className="glass px-4 py-1.5 rounded-full border border-white/20 transition-all">
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent">{label}</span>
          </div>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="relative glass-strong p-4 rounded-2xl border-2 border-white/20 group-hover:border-accent/50 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]">
              <ArrowUp className="text-white w-10 h-10" />
            </div>
          </div>
        </motion.div>
      </Html>
    </group>
  );
};

const TourViewer = () => {
  const { parkId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [soundOn, setSoundOn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const [sceneA, setSceneA] = useState("1");
  const [sceneB, setSceneB] = useState("");
  const [activeBuffer, setActiveBuffer] = useState<"A" | "B">("A");
  
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);
  const [sphereScale, setSphereScale] = useState(1);
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser", e));
    } else {
      if (audioRef.current) audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundOn, parkId]);

  const getParkName = () => {
    switch (parkId) {
      case "botanika": return "Botanika Bog'i";
      case "islamic-center": return "Islom Sivilizatsiyasi Markazi";
      case "ecopark": return "Eko Park";
      default: return "Park";
    }
  };

  const parkName = getParkName();

  const getScenes = () => {
    if (parkId === "botanika") {
      const botanikaScenes: Record<string, any> = {};
      for (let i = 1; i <= 17; i++) {
        botanikaScenes[i.toString()] = {
          url: `/botanika/${i}.webp?v=2`,
          navPoints: [
            ...(i < 17 ? [{ to: (i + 1).toString(), pos: [100, -60, 0] as [number, number, number], label: "Oldinga" }] : []),
            ...(i > 1 ? [{ to: (i - 1).toString(), pos: [-100, -60, 0] as [number, number, number], label: "Ortga" }] : []),
          ]
        };
      }
      return botanikaScenes;
    }
    return { "1": { url: `/${parkId}/image1.jpg`, navPoints: [] } };
  };

  const scenes = getScenes();
  const currentSceneId = activeBuffer === "A" ? sceneA : sceneB;
  const currentSceneData = scenes[currentSceneId] || scenes["1"];

  const handleSceneChange = (targetId: string, direction: "Oldinga" | "Ortga") => {
    if (isTransitioning) return;
    
    const nextUrl = scenes[targetId]?.url;
    if (!nextUrl) return;

    const loader = new THREE.TextureLoader();
    loader.load(nextUrl, () => {
      setIsTransitioning(true);
      
      if (activeBuffer === "A") {
        setSceneB(targetId);
      } else {
        setSceneA(targetId);
      }

      const timeline = gsap.timeline();

      timeline.to(cameraRef.current, {
        fov: 40,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: () => cameraRef.current.updateProjectionMatrix()
      });

      timeline.to({ opA: opacityA, opB: opacityB, scale: 1 }, {
        opA: activeBuffer === "A" ? 0 : 1,
        opB: activeBuffer === "A" ? 1 : 0,
        scale: direction === "Oldinga" ? 1.3 : 0.8,
        duration: 1.0,
        ease: "power2.inOut",
        onUpdate: function() {
          const targets = this.targets()[0];
          setOpacityA(targets.opA);
          setOpacityB(targets.opB);
          setSphereScale(targets.scale);
        },
        onComplete: () => {
          setActiveBuffer(activeBuffer === "A" ? "B" : "A");
          
          gsap.to(cameraRef.current, {
            fov: 75,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => cameraRef.current.updateProjectionMatrix()
          });

          gsap.to({ scale: sphereScale }, {
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: function() {
              setSphereScale(this.targets()[0].scale);
            },
            onComplete: () => setIsTransitioning(false)
          });
        }
      }, "-=0.4");
    });
  };

  const [yaw, setYaw] = useState(0);

  return (
    <div className="fixed inset-0 bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} ref={cameraRef} />
          <Suspense fallback={null}>
            {sceneA && (
              <PanoramaSphere 
                url={scenes[sceneA]?.url || scenes["1"].url} 
                opacity={opacityA} 
                scale={activeBuffer === "A" ? sphereScale : 1}
              />
            )}
            
            {sceneB && (
              <PanoramaSphere 
                url={scenes[sceneB]?.url || scenes["1"].url} 
                opacity={opacityB} 
                scale={activeBuffer === "B" ? sphereScale : 1}
              />
            )}
            
            {!isTransitioning && currentSceneData.navPoints?.map((pt: any, idx: number) => (
              <NavPoint 
                key={`${currentSceneId}-${idx}`} 
                pos={pt.pos} 
                label={pt.label}
                onClick={() => handleSceneChange(pt.to, pt.label as any)} 
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
                setYaw(e.target.object.rotation.y * (180 / Math.PI));
              }
            }}
          />
        </Canvas>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />
        
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-30 glass rounded-full px-5 py-2.5 flex items-center gap-2 text-foreground hover:bg-glass-border/30 transition-colors pointer-events-auto"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">{t.back}</span>
        </motion.button>

        <div className="absolute top-6 right-6 z-30 flex items-center gap-3 pointer-events-auto">
          <motion.button
            className="glass rounded-full p-3 text-foreground hover:bg-glass-border/30 transition-colors"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-5 h-5 text-accent" />
          </motion.button>
          <motion.button
            className="glass rounded-full p-3 text-foreground hover:bg-glass-border/30 transition-colors"
            onClick={() => setSoundOn(!soundOn)}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
        </div>

        <motion.div className="absolute bottom-6 right-6 z-30 glass-strong rounded-xl overflow-hidden w-44 h-32 border border-white/10">
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-24 h-24 rounded-full border border-dashed border-white/20 absolute" />
            <motion.div style={{ rotate: yaw }} className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div className="absolute -top-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-accent" />
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md px-2 py-1 border-t border-white/5">
            <p className="text-[9px] text-accent font-display font-medium text-center uppercase tracking-widest">{parkName}</p>
          </div>
        </motion.div>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 glass-strong z-50 pointer-events-auto flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-white">{t.infoTitle}</h2>
                <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white/50" />
                </button>
              </div>
              <div className="prose prose-invert prose-sm overflow-y-auto">
                <p className="text-white/80 leading-relaxed font-body text-base">
                  {parkId === "botanika" ? t.botanikaFullDesc : t.ecoParkFullDesc}
                </p>
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
