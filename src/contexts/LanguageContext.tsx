import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "uz" | "ru" | "en";

const translations = {
  uz: {
    heroTitle: "Virtual sayohatga xush kelibsiz",
    heroSub: "Toshkentning eng go'zal bog'larini 360° formatda kashf eting.",
    startJourney: "Sayohatni boshlash",
    explorePark: "360° Turga kirish",
    parks: "Bog'larni kashf eting",
    parksSubtitle: "Toshkentning eng mashhur bog'lari va dam olish maskanlarini virtual tarzda ziyorat qiling",
    botanika: "Botanika Bog'i",
    botanikaDesc: "Minglab noyob o'simliklar va tropik gullar olamiga sho'ng'ing.",
    islamicCenter: "Islom sivilizatsiyasi markazi",
    islamicCenterDesc: "Boy madaniy merosimiz va buyuk allomalarimiz xazinasini kashf eting.",
    tashkentCity: "Tashkent City Park",
    tashkentCityDesc: "Zamonaviy me'morchilik va fontanlar bilan bezatilgan dam olish maskani.",
    back: "Orqaga",
    soundOn: "Ovoz yoqilgan",
    soundOff: "Ovoz o'chirilgan",
    loading: "Yuklanmoqda...",
  },
  ru: {
    heroTitle: "Добро пожаловать в виртуальное путешествие",
    heroSub: "Откройте для себя красивейшие сады Ташкента в формате 360°.",
    startJourney: "Начать путешествие",
    explorePark: "Войти в 360° тур",
    parks: "Исследуйте парки",
    parksSubtitle: "Виртуально посетите самые известные парки и зоны отдыха Ташкента",
    botanika: "Ботанический сад",
    botanikaDesc: "Погрузитесь в мир тысяч уникальных растений и тропических цветов.",
    islamicCenter: "Центр исламской цивилизации",
    islamicCenterDesc: "Откройте для себя богатство нашего культурного наследия и сокровищницу великих ученых.",
    tashkentCity: "Ташкент Сити Парк",
    tashkentCityDesc: "Зона отдыха с современной архитектурой и фонтанами.",
    back: "Назад",
    soundOn: "Звук включен",
    soundOff: "Звук выключен",
    loading: "Загрузка...",
  },
  en: {
    heroTitle: "Welcome to the Virtual Journey",
    heroSub: "Discover Tashkent's most beautiful gardens in immersive 360° format.",
    startJourney: "Start Journey",
    explorePark: "Enter 360° Tour",
    parks: "Explore the Parks",
    parksSubtitle: "Virtually visit Tashkent's most iconic parks and recreation destinations",
    botanika: "Botanical Garden",
    botanikaDesc: "Dive into a world of thousands of rare plants and tropical flowers.",
    islamicCenter: "Center of Islamic Civilization",
    islamicCenterDesc: "Discover the richness of our cultural heritage and the treasury of great scholars.",
    tashkentCity: "Tashkent City Park",
    tashkentCityDesc: "A modern retreat adorned with contemporary architecture and fountains.",
    back: "Back",
    soundOn: "Sound on",
    soundOff: "Sound off",
    loading: "Loading...",
  },
};

type Translations = typeof translations.uz;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "uz",
  setLang: () => {},
  t: translations.uz,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("uz");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
