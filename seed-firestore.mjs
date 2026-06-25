/**
 * seed-firestore.mjs
 * Bu skript mavjud 3 ta park ma'lumotlarini Firestore-ga import qiladi.
 * Faqat bir marta ishlatiladi.
 * Ishlatish: node seed-firestore.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFIXD5f25gG4ApcDFfQ6hVHV2edFD02so",
  authDomain: "auth.tashkentparks.uz",
  projectId: "tashkent-parks-360-65150",
  storageBucket: "tashkent-parks-360-65150.firebasestorage.app",
  messagingSenderId: "536996258261",
  appId: "1:536996258261:web:b12b4a8db46399b97a5d5c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const parks = [
  {
    id: "botanika",
    name_uz: "Botanika Bog'i",
    name_ru: "Ботанический сад",
    name_en: "Botanical Garden",
    desc_uz: "O'zbekistonning eng katta va go'zal botanika bog'i. 1924-yilda tashkil etilgan, 65 gektar maydonda 4500 dan ortiq o'simlik turlari mavjud.",
    desc_ru: "Крупнейший и красивейший ботанический сад Узбекистана. Основан в 1924 году, на площади 65 гектаров произрастает более 4500 видов растений.",
    desc_en: "The largest and most beautiful botanical garden in Uzbekistan. Founded in 1924, it spans 65 hectares with over 4500 plant species.",
    coverUrl: "/assets/park-botanika.jpg",
    audioUrl: "/audio/Botanika bogi.m4a",
    mapUrl: "/maps/botanika.png",
    totalScenes: 16,
    order: 1,
    isPublished: true,
  },
  {
    id: "ecopark",
    name_uz: "Eko Park",
    name_ru: "Эко Парк",
    name_en: "Eco Park",
    desc_uz: "Toshkentning zamonaviy va ekologik bog'i. Tashrif buyuruvchilar uchun yam-yashil tabiiy muhit va dam olish imkoniyatlarini taqdim etadi.",
    desc_ru: "Современный экологический парк Ташкента. Предлагает посетителям зелёную природную среду и возможности для отдыха.",
    desc_en: "Tashkent's modern ecological park. Offers visitors a lush natural environment and relaxation opportunities.",
    coverUrl: "/assets/park-ecopark.png",
    audioUrl: "/audio/Eko park.mp3",
    mapUrl: "/maps/ecopark.png",
    totalScenes: 16,
    order: 2,
    isPublished: true,
  },
  {
    id: "islamic-center",
    name_uz: "Islom Sivilizatsiyasi Markazi",
    name_ru: "Центр Исламской Цивилизации",
    name_en: "Islamic Civilization Center",
    desc_uz: "O'rta Osiyodagi eng yirik islom madaniyati va ilm-fan markazi. Noyob me'moriy uslubi va boy tarixi bilan ajralib turadi.",
    desc_ru: "Крупнейший центр исламской культуры и науки в Центральной Азии. Отличается уникальным архитектурным стилем и богатой историей.",
    desc_en: "The largest Islamic culture and science center in Central Asia. Distinguished by its unique architectural style and rich history.",
    coverUrl: "/assets/park-islamic-center.png",
    audioUrl: "/audio/Islom sivilizatsiya markazi.mp3",
    mapUrl: "/maps/islamic-center.png",
    totalScenes: 15,
    order: 3,
    isPublished: true,
  },
];

async function seedData() {
  console.log("Firestore-ga ma'lumotlar yozilmoqda...\n");

  for (const park of parks) {
    const { id, totalScenes, ...parkData } = park;

    // Park hujjatini yozish
    await setDoc(doc(db, "parks", id), {
      ...parkData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Park yozildi: ${id}`);

    // Park sahnalarini (scenes) yozish
    for (let i = 1; i <= totalScenes; i++) {
      const sceneData = {
        url: `/${id}/${i}.webp`,
        order: i,
        createdAt: new Date(),
      };
      await setDoc(doc(collection(db, "parks", id, "scenes"), i.toString()), sceneData);
    }
    console.log(`   ${totalScenes} ta sahna yozildi: ${id}\n`);
  }

  console.log("Barcha ma'lumotlar muvaffaqiyatli yozildi!");
  process.exit(0);
}

seedData().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
