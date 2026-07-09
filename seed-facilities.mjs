/**
 * seed-facilities.mjs
 * Bu skript mavjud 3 ta parkga sharoitlar (facilities) ma'lumotlarini qo'shadi.
 * Mavjud ma'lumotlarni o'zgartirmaydi, faqat yangi maydonlarni qo'shadi.
 * Ishlatish: node seed-facilities.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

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

// Har bir parkga taxminiy (demo) sharoitlar ma'lumotlari
const facilitiesData = {
  "botanika": {
    // Botanika Bog'i — katta, eski, tabiatga boy park
    has_ramp: true,           // Asosiy yo'laklarda rampa bor
    has_parking: true,         // Katta avtoturargoh mavjud
    has_playground: true,      // Bolalar maydonchasi bor
    has_cafe: true,            // Kafe/bufet mavjud
    has_nursing_room: false,   // Emizish xonasi yo'q
    has_clean_restroom: true,  // Hojatxona mavjud
    has_wifi: false,           // Wi-Fi yo'q
    has_bike_rental: false,    // Velosiped ijarasi yo'q
    shade_level: "high",       // Ko'p daraxt — juda soyali
    noise_level: "low",        // Tinch, tabiat ichida
    child_friendly: true,      // Bolalar uchun xavfsiz
    entry_fee: "paid",         // Kirish pullik
    working_hours: "06:00-22:00"
  },
  "ecopark": {
    // Eko Park — zamonaviy, yaxshi infratuzilmali
    has_ramp: true,            // Zamonaviy — rampa bor
    has_parking: true,         // Katta parking
    has_playground: true,      // Zamonaviy bolalar maydonchasi
    has_cafe: true,            // Ko'p kafe va restoran
    has_nursing_room: true,    // Zamonaviy park — emizish xonasi bor
    has_clean_restroom: true,  // Toza hojatxonalar
    has_wifi: true,            // Bepul Wi-Fi mavjud
    has_bike_rental: true,     // Velosiped ijarasi bor
    shade_level: "medium",     // O'rtacha soya
    noise_level: "medium",     // O'rtacha shovqin (oila joyi)
    child_friendly: true,      // Bolalar uchun juda qulay
    entry_fee: "free",         // Kirish bepul
    working_hours: "07:00-23:00"
  },
  "islamic-center": {
    // Islom Sivilizatsiyasi Markazi — madaniy, rasmiy joy
    has_ramp: true,            // Zamonaviy bino — rampa bor
    has_parking: true,         // Katta avtoturargoh
    has_playground: false,     // Bolalar maydonchasi yo'q
    has_cafe: true,            // Kafe mavjud
    has_nursing_room: false,   // Emizish xonasi yo'q
    has_clean_restroom: true,  // Hojatxona mavjud
    has_wifi: true,            // Wi-Fi mavjud
    has_bike_rental: false,    // Velosiped ijarasi yo'q
    shade_level: "low",        // Ochiq maydon, kam daraxt
    noise_level: "low",        // Juda tinch, rasmiy muhit
    child_friendly: false,     // Katta yoshli mehmonlar uchun
    entry_fee: "free",         // Kirish bepul
    working_hours: "09:00-18:00"
  }
};

async function seedFacilities() {
  console.log("Parklarga sharoitlar ma'lumotlari qo'shilmoqda...\n");

  for (const [parkId, facilities] of Object.entries(facilitiesData)) {
    try {
      const parkRef = doc(db, "parks", parkId);
      await updateDoc(parkRef, {
        ...facilities,
        updatedAt: new Date()
      });
      console.log(`✅ ${parkId} — sharoitlar qo'shildi`);
      
      // Qo'shilgan sharoitlarni ko'rsatish
      const trueItems = Object.entries(facilities)
        .filter(([_, val]) => val === true)
        .map(([key]) => key.replace("has_", "").replace("_", " "));
      console.log(`   Mavjud: ${trueItems.join(", ")}`);
      
      const falseItems = Object.entries(facilities)
        .filter(([_, val]) => val === false)
        .map(([key]) => key.replace("has_", "").replace("_", " "));
      console.log(`   Yo'q:   ${falseItems.join(", ")}\n`);
    } catch (err) {
      console.error(`❌ ${parkId} — xatolik:`, err.message);
    }
  }

  console.log("Barcha sharoitlar muvaffaqiyatli qo'shildi!");
  process.exit(0);
}

seedFacilities().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
