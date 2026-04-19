import { useState, useRef, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Volume2, VolumeX, MapPin, X, Info, ArrowUpRight } from "lucide-react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Sphere, OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import LocationTracker from "@/components/LocationTracker";
import LocationTracker from "@/components/LocationTracker";

const PanoramaSphere = ({ url, opacity = 1 }: { url: string; opacity?: number }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return (
    <Sphere args={[500, 64, 32]} scale={[-1, 1, 1]}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} transparent opacity={opacity} />
    </Sphere>
  );
};

const NavPoint = ({ pos, onClick }: { pos: [number, number, number]; onClick: () => void }) => (
  <group position={pos}>
    <Html center>
      <div
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="cursor-pointer w-12 h-12 rounded-full border-4 border-white bg-accent/20 backdrop-blur-sm flex items-center justify-center animate-pulse hover:scale-125 transition-transform"
      >
        <ArrowUpRight className="text-white w-6 h-6" />
      </div>
    </Html>
  </group>
);

const TourViewer = () => {
  const { parkId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [soundOn, setSoundOn] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [currentScene, setCurrentScene] = useState<"image1" | "image2">("image1");
  const [nextScene, setNextScene] = useState<"image1" | "image2" | null>(null);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  const scenes = {
    image1: {
      url: "/botanika/image1.jpg",
      navPoints: [{ id: "image2" as const, pos: [450, -50, 0] as [number, number, number] }],
      infoSpots: [
        { x: 45, y: 55, title: "Asosiy Yo'lak", desc: "Botanika bog'ining markaziy qismiga olib boruvchi yo'l." },
        { x: 30, y: 45, title: "Tropical Greenhouse", desc: "Home to over 300 exotic plant species from Southeast Asia and South America." },
        { x: 65, y: 35, title: "Rose Garden", desc: "A stunning collection of 150+ rose varieties blooming from April to October." },
      ],
    },
    image2: {
      url: "/botanika/image2.jpg",
      navPoints: [{ id: "image1" as const, pos: [-450, -50, 0] as [number, number, number] }],
      infoSpots: [
        { x: 50, y: 50, title: "50m Masofa", desc: "Birinchi nuqtadan 50 metr uzoqlikdagi ikkinchi lokatsiya." },
      ],
    },
  };

  const handleWalk = (targetId: "image1" | "image2") => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveHotspot(null);
    setNextScene(targetId);
    
    // Zoom-in walking effect
    const tl = gsap.timeline();
    tl.to(cameraRef.current, {
      fov: 25, 
      duration: 1.5, 
      ease: "power2.inOut",
      onUpdate: () => cameraRef.current.updateProjectionMatrix(),
    });

    tl.to({ val: 0 }, {
      val: 1, 
      duration: 1.0,
      ease: "none",
      onUpdate: function () { 
        setFadeProgress(this.targets()[0].val); 
      },
      onComplete: () => {
        setCurrentScene(targetId);
        setNextScene(null);
        setFadeProgress(0);
        
        // Return to normal FOV
        gsap.fromTo(cameraRef.current,
          { fov: 110 },
          { 
            fov: 75, 
            duration: 1.8, 
            ease: "power2.out",
            onUpdate: () => cameraRef.current.updateProjectionMatrix(),
            onComplete: () => setIsTransitioning(false),
          }
        );
      },
    }, "-=0.5");
  };

  const spots = scenes[currentScene].infoSpots;

  return (
    <div className="fixed inset-0 bg-background">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} ref={cameraRef} />
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-accent font-display tracking-[0.3em] uppercase text-xs">Botanika 360 Yuklanmoqda...</p>
                <p className="text-white/30 text-[10px]">Katta hajmli tasvir (26MB)</p>
              </div>
            </Html>
          }>
            <PanoramaSphere url={scenes[currentScene].url} opacity={1 - fadeProgress} />
            {nextScene && <PanoramaSphere url={scenes[nextScene].url} opacity={fadeProgress} />}
            {!isTransitioning && scenes[currentScene].navPoints.map((np) => (
              <NavPoint key={np.id} pos={np.pos} onClick={() => handleWalk(np.id)} />
            ))}
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.05} rotateSpeed={-0.4} />
        </Canvas>
      </div>

      {/* Original UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />

        {/* Hotspots */}
        {!isTransitioning && spots.map((spot, i) => (
          <button key={i} className="absolute z-20 pointer-events-auto"
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)" }}
            onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center hotspot-pulse">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Info className="w-3 h-3 text-accent-foreground" />
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Hotspot info card */}
        <AnimatePresence>
          {activeHotspot !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute z-30 glass-strong rounded-2xl p-6 max-w-sm pointer-events-auto"
              style={{
                left: `${spots[activeHotspot].x}%`,
                top: `${spots[activeHotspot].y - 15}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <button onClick={() => setActiveHotspot(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-display font-bold text-lg text-foreground">{spots[activeHotspot].title}</h4>
              <p className="text-muted-foreground text-sm mt-2 font-body">{spots[activeHotspot].desc}</p>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Sound toggle */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 z-30 glass rounded-full p-3 text-foreground hover:bg-glass-border/30 transition-colors pointer-events-auto"
          onClick={() => setSoundOn(!soundOn)}
        >
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>

        {/* Mini-map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 right-6 z-30 glass-strong rounded-xl overflow-hidden w-40 h-28"
        >
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-2 py-1">
            <p className="text-[10px] text-muted-foreground text-center font-body">Mini-map</p>
          </div>
        </motion.div>
      </div>

      {/* Location Tracker - feature/location test */}
      <LocationTracker />
    </div>
  );
};

export default TourViewer;

