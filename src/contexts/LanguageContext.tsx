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
    ecoPark: "Eco Park",
    ecoParkDesc: "Zahiriddin Muhammad Bobur nomidagi Toshkent markaziy eko bog'i.",
    back: "Orqaga",
    soundOn: "Ovoz yoqilgan",
    soundOff: "Ovoz o'chirilgan",
    loading: "Yuklanmoqda...",
    loadingTour: "360 yuklanmoqda...",
    highQualityImage: "Yuqori sifatli tasvir (12MB)",
    tourStartMessage: "Sayohat yuklanmoqda...",
    tayyor: "Tayyor",
    allRightsReserved: "Barcha huquqlar himoyalangan.",
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
    ecoPark: "Эко Парк",
    ecoParkDesc: "Центральный эко-парк Ташкента имени Захириддина Мухаммада Бабура.",
    back: "Назад",
    soundOn: "Звук включен",
    soundOff: "Звук выключен",
    loading: "Загрузка...",
    loadingTour: "360 загружается...",
    highQualityImage: "Высококачественное изображение (12МБ)",
    tourStartMessage: "Путешествие загружается...",
    tayyor: "Готово",
    allRightsReserved: "Все права защищены.",
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
    ecoPark: "Eco Park",
    ecoParkDesc: "Tashkent Central Eco Park named after Zahiriddin Muhammad Babur.",
    back: "Back",
    soundOn: "Sound on",
    soundOff: "Sound off",
    loading: "Loading...",
    loadingTour: "360 is loading...",
    highQualityImage: "High quality image (12MB)",
    tourStartMessage: "Loading journey...",
    tayyor: "Ready",
    allRightsReserved: "All rights reserved.",
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
