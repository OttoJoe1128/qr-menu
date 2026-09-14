const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

const oldFunctionRegex = /const getLoc = \(obj, key\) => \{[\s\S]*?return obj\[key \+ "TR"\] \|\| obj\[key\] \|\| "";\n  \};/;

const newFunction = `const getLoc = (obj, key) => {
  if (!obj) return "";

  if (key === "name" && !obj.price) {
    const rawName = (obj.nameTR || obj.name || "").toLowerCase();
    let catKey = "";
    
    if (rawName.includes("kahvalti") || rawName.includes("deneyim")) catKey = "cat-kahvalti";
    else if (rawName.includes("meze") || rawName.includes("başlangıç") || rawName.includes("baslangic")) catKey = "cat-meze";
    else if (rawName.includes("ana") || rawName.includes("yemek")) catKey = "cat-ana";
    else if (rawName.includes("yeşil") || rawName.includes("yesil") || rawName.includes("vegan")) catKey = "cat-yesil";
    else if (rawName.includes("tatlı") || rawName.includes("tatli")) catKey = "cat-tatli";
    else if (obj.id && obj.id.startsWith("cat-")) catKey = obj.id;

    if (catKey) {
      const translatedCat = t("categories." + catKey);
      if (translatedCat && !translatedCat.startsWith("categories.")) {
        return translatedCat;
      }
    }
  }

  let prodKey = "p1";
  if (obj.id === "m-2" || (obj.nameTR && obj.nameTR.includes("Serpme")) || (obj.name && obj.name.includes("Spread"))) prodKey = "p2";
  if (obj.id === "m-3" || (obj.nameTR && obj.nameTR.includes("Osmanlı")) || (obj.name && obj.name.includes("Ottoman"))) prodKey = "p3";

  const jsonKey = key === "description" ? "description" : key;
  const translated = t("products." + prodKey + "." + jsonKey);
  if (translated && !translated.startsWith("products.")) {
    return translated;
  }

  return obj[key + "TR"] || obj[key] || "";
};`;

if (code.match(oldFunctionRegex)) {
    code = code.replace(oldFunctionRegex, newFunction);
    fs.writeFileSync('src/App.jsx', code);
    console.log("✅ getLoc motoru basariyla guncellendi!");
} else {
    console.log("⚠️ Eski getLoc fonksiyonu bulunamadi. App.jsx dosyasina dokunulmadi.");
}

const catsMap = {
  tr: { "cat-kahvalti": "Kahvaltı Deneyimi", "cat-meze": "Meze & Başlangıçlar", "cat-ana": "Ana Yemekler", "cat-yesil": "Yeşil Menü", "cat-tatli": "Tatlılar" },
  en: { "cat-kahvalti": "Breakfast Experience", "cat-meze": "Meze & Starters", "cat-ana": "Main Courses", "cat-yesil": "Green Menu", "cat-tatli": "Desserts" },
  es: { "cat-kahvalti": "Experiencia de Desayuno", "cat-meze": "Aperitivos y Entrantes", "cat-ana": "Platos Principales", "cat-yesil": "Menú Verde", "cat-tatli": "Postres" },
  ar: { "cat-kahvalti": "تجربة الإفطار", "cat-meze": "المقبلات", "cat-ana": "الأطباق الرئيسية", "cat-yesil": "القائمة الخضراء", "cat-tatli": "الحلويات" }
};

['tr', 'en', 'es', 'ar'].forEach(lang => {
  const filePath = 'src/i18n/locales/' + lang + '.json';
  if (fs.existsSync(filePath)) {
    let json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    json.categories = catsMap[lang];
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
  }
});
console.log("✅ JSON kategori sözlükleri başarıyla senkronize edildi!");
