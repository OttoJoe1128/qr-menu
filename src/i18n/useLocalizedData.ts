import { useTranslation } from "react-i18next";

export function useLocalizedData() {
  const { t, i18n } = useTranslation();

  const getLoc = (obj: any, key: string): string => {
    if (!obj) return "";

    // 1. Kategori Çözümleme (İsim bazlı akıllı eşleşme)
    if (key === "name" && !obj.price) {
      const rawName = (obj.nameTR || obj.name || "").toLowerCase();
      let catKey = "";
      
      if (rawName.includes("kahvalti") || rawName.includes("deneyim")) catKey = "cat-kahvalti";
      else if (rawName.includes("meze") || rawName.includes("baslangic") || rawName.includes("başlangıç")) catKey = "cat-meze";
      else if (rawName.includes("ana") || rawName.includes("yemek")) catKey = "cat-ana";
      else if (rawName.includes("yesil") || rawName.includes("yeşil") || rawName.includes("vegan")) catKey = "cat-yesil";
      else if (rawName.includes("tatli") || rawName.includes("tatlı")) catKey = "cat-tatli";
      else if (obj.id && obj.id.startsWith("cat-")) catKey = obj.id;

      if (catKey) {
        const translatedCat = t("categories." + catKey);
        if (translatedCat && !translatedCat.startsWith("categories.")) {
          return translatedCat;
        }
      }
    }

    // 2. Ürün Çözümleme (Demo Eşleşmeleri)
    let prodKey = "p1";
    if (obj.id === "m-2" || (obj.nameTR && obj.nameTR.includes("Serpme")) || (obj.name && obj.name.includes("Spread"))) prodKey = "p2";
    if (obj.id === "m-3" || (obj.nameTR && obj.nameTR.includes("Osmanlı")) || (obj.name && obj.name.includes("Ottoman"))) prodKey = "p3";

    const jsonKey = key === "description" ? "description" : key;
    const translated = t("products." + prodKey + "." + jsonKey);
    if (translated && !translated.startsWith("products.")) {
      return translated;
    }

    // 3. Veritabanı Alanı Geri Dönüşü (Fallback)
    // Eğer o anki dil TR ise nameTR'yi ver, değilse (EN, ES, AR) nameEN varsa onu ver, yoksa nameTR'ye düş.
    const isTurkish = i18n.language === 'tr';
    const langSuffix = isTurkish ? 'TR' : 'EN';
    
    return obj[`${key}${langSuffix}`] || obj[`${key}TR`] || obj[key] || "";
  };

  return { 
    getLoc, 
    currentLang: i18n.language,
    changeLanguage: i18n.changeLanguage
  };
}
