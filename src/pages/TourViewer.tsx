import { useState, useRef, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Volume2, VolumeX, MapPin, X, Info, ChevronUp, ChevronDown, Map as MapIcon } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Sphere, OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import LocationTracker from "@/components/LocationTracker";
import BrandLoader from "@/components/BrandLoader";
import { AirQualityWidget } from "@/components/AirQualityWidget";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";

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

const authWallTranslations = {
  uz: {
    title: "Sayohatni davom ettiring",
    desc: "Toshkent bog'larini 360° formatda to'liq kezish va barcha hududlarga o'tish uchun Google orqali tizimga kiring.",
    loginBtn: "Google orqali kirish",
    backHome: "Bosh sahifaga qaytish",
    loading: "Kirilmoqda..."
  },
  ru: {
    title: "Продолжить путешествие",
    desc: "Войдите через Google, чтобы продолжить виртуальное путешествие по паркам Ташкента в формате 360°.",
    loginBtn: "Войти через Google",
    backHome: "На главную",
    loading: "Вход..."
  },
  en: {
    title: "Continue Your Journey",
    desc: "Log in with Google to continue exploring Tashkent parks in full 360° virtual tour.",
    loginBtn: "Sign in with Google",
    backHome: "Back to Home",
    loading: "Signing in..."
  }
};

const TourViewer = () => {
  const { parkId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user, loading: authSessionLoading, loginWithGoogle } = useAuth();
  const [soundOn, setSoundOn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const authTr = authWallTranslations[lang] || authWallTranslations.uz;
  const [textureA, setTextureA] = useState<THREE.Texture | null>(null);
  const [textureB, setTextureB] = useState<THREE.Texture | null>(null);
  const [activeBuffer, setActiveBuffer] = useState<"A" | "B">("A");
  
  const [currentSceneId, setCurrentSceneId] = useState("1");
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);
  const [sphereScale, setSphereScale] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [parkData, setParkData] = useState<any>(null);
  const [scenesList, setScenesList] = useState<Record<string, any>>({});
  
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textureLoader = useRef(new THREE.TextureLoader());

  useEffect(() => {
    if (!authSessionLoading) {
      if (!user) {
        setShowAuthWall(true);
      } else {
        setShowAuthWall(false);
      }
    }
  }, [user, authSessionLoading]);

  useEffect(() => {
    if (!parkId) return;
    async function loadTourData() {
      try {
        setIsInitialLoading(true);
        const parkDocRef = doc(db, "parks", parkId!);
        const parkSnap = await getDoc(parkDocRef);
        
        if (parkSnap.exists()) {
          const pData = parkSnap.data();
          setParkData(pData);
          
          const scenesSnap = await getDocs(query(collection(db, "parks", parkId!, "scenes"), orderBy("order", "asc")));
          const loadedScenes: Record<string, any> = {};
          const scenesArray: any[] = [];
          
          scenesSnap.forEach((doc) => {
            const data = doc.data();
            scenesArray.push({
              id: doc.id,
              url: data.url,
              order: data.order
            });
          });

          if (scenesArray.length === 0) {
            const mockCount = pData.totalScenes || 15;
            for (let i = 1; i <= mockCount; i++) {
              scenesArray.push({
                id: i.toString(),
                url: `/${parkId}/${i}.webp`,
                order: i
              });
            }
          }

          scenesArray.forEach((scene, index) => {
            const navPoints = [];
            if (index < scenesArray.length - 1) {
              navPoints.push({
                to: scenesArray[index + 1].id,
                label: "OLDINGA"
              });
            }
            if (index > 0) {
              navPoints.push({
                to: scenesArray[index - 1].id,
                label: "ORTGA"
              });
            }

            loadedScenes[scene.id] = {
              url: scene.url,
              navPoints
            };
          });

          setScenesList(loadedScenes);
          
          const firstSceneId = scenesArray[0]?.id || "1";
          const firstSceneUrl = loadedScenes[firstSceneId]?.url || `/${parkId}/1.webp`;
          
          setCurrentSceneId(firstSceneId);
          
          textureLoader.current.load(firstSceneUrl, (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            setTextureA(tex);
            setTimeout(() => {
              setIsInitialLoading(false);
            }, 500);
          });
        } else {
          toast.error("Park topilmadi.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading tour viewer data:", error);
        toast.error("Turni yuklashda xatolik yuz berdi.");
        navigate("/");
      }
    }
    loadTourData();
  }, [parkId, navigate]);

  useEffect(() => {
    const audioUrl = parkData?.audioUrl;

    if (soundOn && audioUrl) {
      if (!audioRef.current || audioRef.current.src !== window.location.origin + audioUrl) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
      }
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [soundOn, parkData]);

  const getParkName = () => {
    if (parkData) {
      if (lang === "uz") return parkData.name_uz;
      if (lang === "ru") return parkData.name_ru;
      return parkData.name_en;
    }
    switch (parkId) {
      case "botanika": return "Botanika Bog'i";
      case "islamic-center": return "Islom Sivilizatsiyasi Markazi";
      case "ecopark": return "Eko Park";
      default: return "Park";
    }
  };

  const getLocalizedDesc = () => {
    if (parkData) {
      if (lang === "uz") return parkData.desc_uz;
      if (lang === "ru") return parkData.desc_ru;
      return parkData.desc_en;
    }
    return parkId === "botanika" ? t.botanikaFullDesc : parkId === "islamic-center" ? t.islamicCenterFullDesc : t.ecoParkFullDesc;
  };

  const currentSceneData = scenesList[currentSceneId] || scenesList["1"];

  const handleSceneChange = (targetId: string, direction: "OLDINGA" | "ORTGA") => {
    if (!user) {
      setShowAuthWall(true);
      return;
    }
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    const nextUrl = scenesList[targetId]?.url;
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

  const handleAuthWallLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      toast.success(lang === "uz" ? "Tizimga muvaffaqiyatli kirdingiz!" : lang === "ru" ? "Вы успешно вошли!" : "Successfully logged in!");
    } catch (err) {
      console.error(err);
      toast.error(lang === "uz" ? "Tizimga kirishda xatolik" : lang === "ru" ? "Ошибка при входе" : "Failed to sign in");
    } finally {
      setAuthLoading(false);
    }
  };

  const [yaw, setYaw] = useState(0);

  const forwardPoint = currentSceneData?.navPoints?.find((p: any) => p.label === "OLDINGA");
  const backwardPoint = currentSceneData?.navPoints?.find((p: any) => p.label === "ORTGA");

  const forwardUrl = forwardPoint ? scenesList[forwardPoint.to]?.url : null;
  const backwardUrl = backwardPoint ? scenesList[backwardPoint.to]?.url : null;

  useEffect(() => {
    if (forwardUrl) {
      const img1 = new Image();
      img1.src = forwardUrl;
    }
    if (backwardUrl) {
      const img2 = new Image();
      img2.src = backwardUrl;
    }
  }, [forwardUrl, backwardUrl]);

  if (isInitialLoading) { return <BrandLoader onComplete={() => {}} />; }

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

        <div className="absolute top-[84px] left-6 sm:top-auto sm:bottom-10 sm:left-10 z-30 pointer-events-auto">
          <AirQualityWidget />
        </div>

        <AnimatePresence>
          {!showMap && (
            <div className="absolute bottom-10 left-0 right-0 z-40 pointer-events-none flex justify-center px-6">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="glass-strong rounded-3xl p-2 flex items-center gap-2 border border-white/10 shadow-2xl pointer-events-auto"
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

        <AnimatePresence>
          {showMap && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`absolute z-50 pointer-events-auto flex flex-col shadow-2xl overflow-hidden
                ${window.innerWidth < 768 
                  ? 'inset-x-6 top-24 bottom-24 rounded-[40px]' 
                  : 'bottom-8 right-8 w-80 h-60 rounded-3xl' 
                } glass-strong border border-white/20`}
            >
              <div className="w-full h-full relative bg-black/60 overflow-hidden">
                <img src={parkData?.mapUrl || `/maps/${parkId}.png`} alt="Park Map" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div style={{ rotate: yaw }} className={`relative flex items-center justify-center ${window.innerWidth < 768 ? 'scale-150' : 'scale-125'}`}>
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center border border-accent/50 shadow-[0_0_20px_rgba(20,184,166,0.6)]">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div className="absolute -top-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-accent drop-shadow-[0_0_8px_rgba(20,184,166,1)]" />
                  </motion.div>
                </div>

                <button 
                  onClick={() => setShowMap(false)} 
                  className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all active:scale-90"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                
                <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl px-4 py-3 border-t border-white/5 text-center uppercase tracking-[0.2em] text-[10px] text-accent font-bold">
                  {getParkName()} — {t.infoTitle}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{showInfo && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 glass-strong z-50 pointer-events-auto flex flex-col p-10 border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-10"><h2 className="text-2xl font-bold text-white tracking-tight">{t.infoTitle}</h2><button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-6 h-6 text-white/50" /></button></div>
            <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
              <img src={parkData?.coverUrl || (parkId === "botanika" ? parkBotanika : parkId === "islamic-center" ? parkIslamicCenter : parkEcoPark)} alt={getParkName()} className="w-full h-56 object-cover rounded-2xl shadow-xl border border-white/10" />
              <div className="prose prose-invert prose-sm">
                <p className="text-white/70 leading-relaxed text-lg font-body">{getLocalizedDesc()}</p>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>

        <AnimatePresence>
          {showAuthWall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-strong border border-white/20 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative text-center overflow-hidden"
              >
                {/* Background glow inside modal */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

                <div className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-6 border border-accent/20">
                  <MapPin className="w-10 h-10 text-accent animate-bounce" />
                </div>

                <h3 className="text-2xl font-display font-bold text-white mb-3">
                  {authTr.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8 font-body max-w-xs mx-auto font-medium">
                  {authTr.desc}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleAuthWallLogin}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-accent text-accent-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none glow-pulse"
                  >
                    {authLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-accent-foreground" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {authTr.loading}
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{authTr.loginBtn}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {authTr.backHome}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <LocationTracker />
    </div>
  );
};

export default TourViewer;
