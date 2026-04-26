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
    distance: "Sizdan",
    away: "uzoqda",
    viewOnMap: "Xaritada ko'rish",
    infoTitle: "Bog' haqida ma'lumot",
    botanikaFullDesc: "Toshkent Botanika bog'i — Markaziy Osiyodagi eng yirik va eng qadimiy botanika bog'laridan biridir. 1943-yilda tashkil etilgan ushbu bog' 65 gektardan ortiq maydonni egallaydi. Bu yerda dunyoning turli burchaklaridan keltirilgan 4500 dan ortiq o'simlik turlari mavjud. Bog' bir necha zonalarga bo'lingan: Evropa, Markaziy Osiyo, Sharqiy Osiyo va Shimoliy Amerika florasi.",
    islamicCenterFullDesc: "O'zbekistondagi Islom sivilizatsiyasi markazi — uchinchi Renessans poydevori sifatida bunyod etilmoqda. Ushbu mahobatli majmua islom madaniyati va ilm-fani tarixini, buyuk allomalarimiz merosini o'rganish va dunyoga tanitish maqsadida tashkil etilgan. Markaz kutubxonasida noyob qo'lyozmalar, jumladan, mashhur Usmon Qur'oni saqlanadi. Bino me'morchiligi o'zbek milliy an'analari va islom san'atining eng yuksak namunalarini o'zida mujassam etgan.",
    ecoParkFullDesc: "Zahiriddin Muhammad Bobur nomidagi Toshkent markaziy eko-bog'i (Eko bog') — shahrimizning qoq markazidagi zamonaviy dam olish maskanidir. 2017-yilda ochilgan ushbu bog' ekologik toza materiallardan foydalangan holda barpo etilgan. Bu yerda sun'iy ko'l, sayr qilish yo'laklari, sport maydonchalari va bolalar uchun o'yin zonalari mavjud.",
    forward: "OLDINGA",
    backward: "ORTGA",
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
    distance: "От вас",
    away: "от вас",
    viewOnMap: "На карте",
    infoTitle: "Информация о парке",
    botanikaFullDesc: "Ташкентский Ботанический сад — один из крупнейших и старейших ботанических садов в Средней Азии. Основанный в 1943 году, сад занимает площадь более 65 гектаров. Здесь представлено более 4500 видов растений со всего мира. Сад разделен на несколько флористических зон: Европа, Средняя Азия, Восточная Азия и Северная Америка.",
    islamicCenterFullDesc: "Центр исламской цивилизации в Узбекистане строится как фундамент третьего Ренессанса. Этот величественный комплекс был создан для изучения и популяризации истории исламской культуры и науки, а также наследия наших великих ученых. В библиотеке центра хранятся редкие рукописи, в том числе знаменитый Коран Османа.",
    ecoParkFullDesc: "Центральный эко-парк Ташкента имени Захириддина Мухаммада Бабура (Эко-парк) — современное место отдыха в самом центре города. Открытый в 2017 году, парк был построен с использованием экологически чистых материалов. Здесь есть искусственное озеро, прогулочные дорожки и спортивные площадки.",
    forward: "ВПЕРЕД",
    backward: "НАЗАД",
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
    distance: "Distance",
    away: "away",
    viewOnMap: "View on Map",
    infoTitle: "Park Information",
    botanikaFullDesc: "The Tashkent Botanical Garden is one of the largest and oldest botanical gardens in Central Asia. Established in 1943, the garden covers more than 65 hectares. It is home to over 4,500 species of plants from all over the world. The garden is divided into several floristic zones: Europe, Central Asia, East Asia, and North America.",
    islamicCenterFullDesc: "The Center of Islamic Civilization in Uzbekistan is being built as the foundation of the third Renaissance. This majestic complex was established to study and promote the history of Islamic culture and science, as well as the heritage of our great scholars. The center's library houses rare manuscripts, including the famous Quran of Usman.",
    ecoParkFullDesc: "The Tashkent Central Eco Park named after Zahiriddin Muhammad Babur (Eco Park) is a modern recreation destination in the heart of the city. Opened in 2017, the park was built using environmentally friendly materials. It features an artificial lake, walking paths, and sports fields.",
    forward: "FORWARD",
    backward: "BACKWARD",
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
