import { useState, useRef, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Volume2, VolumeX, MapPin, X, Info, ArrowUp } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Sphere, OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import LocationTracker from "@/components/LocationTracker";

import parkBotanika from "@/assets/park-botanika.jpg";
import parkIslamicCenter from "@/assets/park-islamic-center.png";
import parkEcoPark from "@/assets/park-ecopark.png";

// Optimized Sphere that doesn't trigger Suspense
const PanoramaSphere = ({ texture, opacity = 1, scale = 1 }: { texture: THREE.Texture | null; opacity?: number; scale?: number }) => {
  if (!texture) return null;

  return (
    <Sphere args={[500, 64, 32]} scale={[-scale, scale, scale]}>
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
          <div className="glass px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent">{label}</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg animate-pulse" />
            <div className="relative glass-strong p-3 rounded-2xl border-2 border-white/20 group-hover:border-accent/50 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]">
              <ArrowUp className="text-white w-8 h-8" />
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
  
  // Double Buffer Textures
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

  // Load Initial Texture
  useEffect(() => {
    const initialUrl = getScenes()["1"].url;
    textureLoader.current.load(initialUrl, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      setTextureA(tex);
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

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [soundOn, parkId]);

  const getScenes = () => {
    if (parkId === "botanika") {
      const botanikaScenes: Record<string, any> = {};
      for (let i = 1; i <= 17; i++) {
        botanikaScenes[i.toString()] = {
          url: `/botanika/${i}.webp?v=4`,
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
  const currentSceneData = scenes[currentSceneId] || scenes["1"];

  const handleSceneChange = (targetId: string, direction: "Oldinga" | "Ortga") => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    const nextUrl = scenes[targetId]?.url;
    if (!nextUrl) { setIsTransitioning(false); return; }

    // Start FOV Zoom instantly
    gsap.to(cameraRef.current, {
      fov: 35,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => cameraRef.current.updateProjectionMatrix()
    });

    // Preload next texture
    textureLoader.current.load(nextUrl, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;

      if (activeBuffer === "A") setTextureB(tex);
      else setTextureA(tex);

      // Perform Cross-fade
      gsap.to({ opA: opacityA, opB: opacityB, scale: 1 }, {
        opA: activeBuffer === "A" ? 0 : 1,
        opB: activeBuffer === "A" ? 1 : 0,
        scale: direction === "Oldinga" ? 1.4 : 0.7,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: function() {
          const t = this.targets()[0];
          setOpacityA(t.opA);
          setOpacityB(t.opB);
          setSphereScale(t.scale);
        },
        onComplete: () => {
          setActiveBuffer(activeBuffer === "A" ? "B" : "A");
          setCurrentSceneId(targetId);
          
          gsap.to(cameraRef.current, {
            fov: 75,
            duration: 1.0,
            ease: "power2.out",
            onUpdate: () => cameraRef.current.updateProjectionMatrix()
          });

          gsap.to({ scale: sphereScale }, {
            scale: 1,
            duration: 1.0,
            ease: "power2.out",
            onUpdate: function() {
              setSphereScale(this.targets()[0].scale);
            },
            onComplete: () => setIsTransitioning(false)
          });
        }
      });
    });
  };

  const [yaw, setYaw] = useState(0);

  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} ref={cameraRef} />
          <group>
            <PanoramaSphere 
              texture={textureA} 
              opacity={opacityA} 
              scale={activeBuffer === "A" ? sphereScale : 1}
            />
            <PanoramaSphere 
              texture={textureB} 
              opacity={opacityB} 
              scale={activeBuffer === "B" ? sphereScale : 1}
            />
            
            {!isTransitioning && currentSceneData?.navPoints?.map((pt: any, idx: number) => (
              <NavPoint 
                key={`${currentSceneId}-${idx}`} 
                pos={pt.pos} 
                label={pt.label}
                onClick={() => handleSceneChange(pt.to, pt.label as any)} 
              />
            ))}
          </group>
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={-0.4} 
            onChange={(e) => {
              if (e?.target?.object) setYaw(e.target.object.rotation.y * (180 / Math.PI));
            }}
          />
        </Canvas>
      </div>

      {/* UI Elements */}
      <div className="absolute inset-0 pointer-events-none z-10 font-display">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-30 glass rounded-full px-5 py-2.5 flex items-center gap-2 text-white pointer-events-auto shadow-lg"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wider">{t.back}</span>
        </motion.button>

        <div className="absolute top-6 right-6 z-30 flex items-center gap-3 pointer-events-auto">
          <motion.button className="glass rounded-full p-3 shadow-lg" onClick={() => setShowInfo(!showInfo)}>
            <Info className="w-5 h-5 text-accent" />
          </motion.button>
          <motion.button className="glass rounded-full p-3 shadow-lg" onClick={() => setSoundOn(!soundOn)}>
            {soundOn ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white" />}
          </motion.button>
        </div>

        <motion.div className="absolute bottom-8 right-8 z-30 glass-strong rounded-2xl overflow-hidden w-48 h-36 border border-white/10 shadow-2xl">
          <div className="w-full h-full flex items-center justify-center relative bg-black/40">
            <div className="w-28 h-28 rounded-full border border-dashed border-accent/30 absolute animate-spin-slow" />
            <motion.div style={{ rotate: yaw }} className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <div className="absolute -top-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-accent drop-shadow-glow" />
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl px-2 py-2 border-t border-white/5 text-center uppercase tracking-[0.2em] text-[9px] text-accent font-bold">
            {parkId === "botanika" ? "Botanika Bog'i" : "Park"}
          </div>
        </motion.div>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 glass-strong z-50 pointer-events-auto flex flex-col p-10 border-l border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-white tracking-tight">{t.infoTitle}</h2>
                <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6 text-white/50" />
                </button>
              </div>
              <div className="prose prose-invert prose-sm overflow-y-auto custom-scrollbar pr-2">
                <p className="text-white/70 leading-relaxed text-lg font-body">
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
