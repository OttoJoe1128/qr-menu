import { useEffect, useState } from "react";
import { initCore } from "./core/init";
import { db } from "./db";
import { useTranslation } from "react-i18next";
import LanguageTimeSwitcher from "./components/LanguageTimeSwitcher";

export default function App() {
  const { t, i18n } = useTranslation();

    const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState("cat-kahvalti");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [isAdmin, setIsAdmin] = useState(window.location.search.includes("admin=true"));
  const [adminTab, setAdminTab] = useState("items"); 
  
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState("TR");
// KUSURSUZ KATEGORİ VE ÜRÜN ÇÖZÜMLEME MOTORU
  
  // Dinamik Alerjen Çevirici
  const translateAllergen = (allergen) => {
    const lang = i18n.language;
    const map = {
      "Süt": { en: "Milk", es: "Leche", ar: "حليب" },
      "Yumurta": { en: "Eggs", es: "Huevos", ar: "بيضان" }
    };
    return map[allergen]?.[lang] || allergen;
  };

  const getLoc = (obj, key) => {
    if (!obj) return "";
    
    // 1. Kategori Çözümleme (id veya nameTR bazlı tam eşleşme)
    if (obj.id || (key === "name" && !obj.price)) {
      const catId = obj.id || "";
      const translatedCat = t(`categories.${catId}`);
      if (translatedCat && !translatedCat.startsWith("categories.")) {
        return translatedCat;
      }
    }

    // 2. Ürün Çözümleme
    let prodKey = "p1";
    if (obj.id === "m-2" || (obj.nameTR && obj.nameTR.includes("Serpme")) || (obj.name && obj.name.includes("Spread"))) prodKey = "p2";
    if (obj.id === "m-3" || (obj.nameTR && obj.nameTR.includes("Osmanlı")) || (obj.name && obj.name.includes("Ottoman"))) prodKey = "p3";

    const jsonKey = key === "description" ? "description" : key;
    const translated = t(`products.${prodKey}.${jsonKey}`);
    if (translated && !translated.startsWith("products.")) {
      return translated;
    }

    return obj[key + "TR"] || obj[key] || "";
  };






  // 1. ADMIN PANELİ İÇİN: SEKME GEÇİŞİNDE SESSİZ ÇEVİRİ (SILENT WORKFLOW)
  const handleTabSwitch = async (lang, isEditMode) => {
    setActiveLangTab(lang);
    if (lang === "TR") return;

    const data = isEditMode ? editingItem : newItemData;
    const setter = isEditMode ? setEditingItem : setNewItemData;
    const nameTR = data.nameTR || "";
    const descTR = data.descriptionTR || data.description || "";
    
    if (!data["name" + lang] && nameTR) {
      try {
        const translate = async (txt) => {
          if(!txt) return "";
          const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=" + lang.toLowerCase() + "&dt=t&q=" + encodeURIComponent(txt));
          const result = await res.json();
          return result[0].map(x => x[0]).join("");
        };
        
        const [transName, transDesc] = await Promise.all([
          translate(nameTR), translate(descTR)
        ]);
        
        setter(prev => ({ ...prev, ["name"+lang]: transName, ["description"+lang]: transDesc }));
      } catch (e) {
        console.error("Admin Çeviri Hatası:", e);
      }
    }
  };

  // 2. MÜŞTERİ MENÜSÜ İÇİN: DİL DEĞİŞİMİNDE JIT GLOBAL SENKRONİZASYON
  useEffect(() => {
    const syncCustomerMenu = async () => {
      const lang = i18n.language.toUpperCase();
      if (lang === "TR") return;

      let needsReload = false;
      const translate = async (txt) => {
        if(!txt) return "";
        try {
          const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=" + lang.toLowerCase() + "&dt=t&q=" + encodeURIComponent(txt));
          const result = await res.json();
          return result[0].map(x => x[0]).join("");
        } catch(e) { return txt; }
      };

      // Ürünleri Senkronize Et
      const allItems = await db.menuItems.toArray();
      for (let item of allItems) {
        if (!item["name" + lang] && item.nameTR) {
          const transName = await translate(item.nameTR);
          const transDesc = await translate(item.descriptionTR || item.description);
          await db.menuItems.update(item.id, { 
            ["name" + lang]: transName, 
            ["description" + lang]: transDesc 
          });
          needsReload = true;
        }
      }

      // Kategorileri Senkronize Et
      const allCats = await db.categories.toArray();
      for (let cat of allCats) {
        if (!cat["name" + lang] && cat.nameTR) {
          const transCatName = await translate(cat.nameTR);
          await db.categories.update(cat.id, { ["name" + lang]: transCatName });
          needsReload = true;
        }
      }

      if (needsReload) {
        loadAppData();
      }
    };

    syncCustomerMenu();
  }, [i18n.language]);

  const [newItemData, setNewItemData] = useState({
    nameTR: "",
    nameEN: "",
    nameES: "",
    nameAR: "",
    descriptionTR: "",
    descriptionEN: "",
    descriptionES: "",
    descriptionAR: "",
    categoryId: "cat-kahvalti",
    price: 0,
    calories: 0,
    protein: "",
    image: "",
    description: "",
    ingredients: "",
    steps: "",
    allergens: ""
  });

  useEffect(() => {
    loadAppData();
  }, []);

  async function loadAppData() {
    setLoading(true);
    await initCore();
    const cats = await db.categories.toArray();
    const rawItems = await db.menuItems.toArray();
    const recs = await db.recipes.toArray();

    const mergedItems = rawItems.map(item => {
      const recipe = recs.find(r => r.id === item.recipeId);
      return {
        ...item,
        image: recipe?.heroImage || item.image || "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
        description: recipe ? recipe.description : "",
        ingredients: recipe ? recipe.ingredients : [],
        steps: recipe ? recipe.steps : [],
      };
    });

    setCategories(cats.sort((a, b) => a.sortOrder - b.sortOrder));
    setItems(mergedItems);
    setRecipes(recs);
    setLoading(false);
  }

  async function handleSaveItem(e) {
    e.preventDefault();
    if (!editingItem) return;

    await db.menuItems.update(editingItem.id, {
      nameTR: editingItem.nameTR,
      nameEN: editingItem.nameEN,
      nameES: editingItem.nameES,
      nameAR: editingItem.nameAR,
      price: Number(editingItem.price),
      categoryId: editingItem.categoryId,
      updatedAt: Date.now()
    });

    if (editingItem.recipeId) {
      await db.recipes.update(editingItem.recipeId, {
        heroImage: editingItem.image,
        description: editingItem.description,
        descriptionTR: editingItem.descriptionTR,
        descriptionEN: editingItem.descriptionEN,
        descriptionES: editingItem.descriptionES,
        descriptionAR: editingItem.descriptionAR,
        ingredients: typeof editingItem.ingredients === 'string' ? editingItem.ingredients.split(',').map(i => i.trim()) : editingItem.ingredients,
        steps: typeof editingItem.steps === 'string' ? editingItem.steps.split('\n').filter(s => s.trim() !== '') : editingItem.steps,
        updatedAt: Date.now()
      });
    }

    setEditingItem(null);
    loadAppData();
  }

  async function handleCreateItem(e) {
    e.preventDefault();
    const newId = "m-" + Date.now();
    const newRecipeId = "r-" + Date.now();

    await db.recipes.put({
      id: newRecipeId,
      heroImage: newItemData.image || "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&q=80",
      description: newItemData.descriptionTR || newItemData.description || "",
      descriptionTR: newItemData.descriptionTR,
      descriptionEN: newItemData.descriptionEN,
      descriptionES: newItemData.descriptionES,
      descriptionAR: newItemData.descriptionAR,
      ingredients: newItemData.ingredients ? newItemData.ingredients.split(',').map(i => i.trim()) : [],
      steps: newItemData.steps ? newItemData.steps.split('\n').filter(s => s.trim() !== '') : [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await db.menuItems.put({
      id: newId,
      nameTR: newItemData.nameTR,
      nameEN: newItemData.nameEN,
      nameES: newItemData.nameES,
      nameAR: newItemData.nameAR,
      categoryId: newItemData.categoryId,
      recipeId: newRecipeId,
      templateId: "food_detail_v1",
      price: Number(newItemData.price),
      calories: Number(newItemData.calories) || 350,
      protein: newItemData.protein || "20g",
      allergens: newItemData.allergens ? newItemData.allergens.split(',').map(a => a.trim()) : [],
      tags: ["Özel"],
      available: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    setIsAddingNew(false);
    setNewItemData({ nameTR: "", categoryId: "cat-kahvalti", price: 0, calories: 0, protein: "", image: "", description: "", ingredients: "", steps: "", allergens: "" });
    loadAppData();
  }

  async function handleDeleteItem(itemId, recipeId) {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      await db.menuItems.delete(itemId);
      if (recipeId) await db.recipes.delete(recipeId);
      loadAppData();
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="relative flex items-center justify-center">
          <div className="animate-ping absolute h-16 w-16 rounded-full bg-amber-500 opacity-20"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODERN ADMIN & MUTFAK PANELİ (GLASSMORPHISM)
  // ==========================================
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans antialiased selection:bg-amber-500 selection:text-black">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-2xl gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">SaaS Enterprise Node</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">The Brook — Command Center</h1>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <LanguageTimeSwitcher />
              <button 
                onClick={() => setIsAddingNew(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                + Yeni Ürün Ekle
              </button>
              <button 
                onClick={() => { setIsAdmin(false); window.history.replaceState({}, '', window.location.pathname); }}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3 rounded-2xl text-sm transition-all border border-slate-700"
              >
                Menüye Dön
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-3 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/50 w-fit">
            <button 
              onClick={() => setAdminTab("items")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${adminTab === 'items' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}
            >
              🍽️ {t("admin.catalog")}
            </button>
            <button 
              onClick={() => setAdminTab("kitchen")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${adminTab === 'kitchen' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}
            >
              👨‍🍳 {t("admin.kitchen")}
            </button>
          </div>

          {/* Modal: New Item */}
          {isAddingNew && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-black mb-6 text-amber-400 tracking-tight">Yeni Ürün & Operasyonel Reçete</h2>
                <form onSubmit={handleCreateItem} className="space-y-5">
                  
                  {/* ÇOKLU DİL SEKMELERİ */}
                  <div className="flex gap-2 mb-4 p-1.5 bg-slate-950/50 rounded-2xl w-fit border border-slate-800 shadow-inner">
                    {["TR", "EN", "ES", "AR"].map(lang => (
                      <button type="button" key={lang} onClick={() => handleTabSwitch(lang, !!editingItem)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeLangTab === lang ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20" : "text-slate-500 hover:text-white"}`}>
                        {lang === "TR" ? "🇹🇷 TR" : lang === "EN" ? "🇬🇧 EN" : lang === "ES" ? "🇪🇸 ES" : "🇦🇪 AR"}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yemek Adı ({activeLangTab})</label>
                    <input type="text" required={activeLangTab === "TR"} value={newItemData["name"+activeLangTab] || ""} onChange={e => setNewItemData({...newItemData, ["name"+activeLangTab]: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" placeholder={`Ürün adı (${activeLangTab})...`} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                      <select value={newItemData.categoryId} onChange={e => setNewItemData({...newItemData, categoryId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nameTR}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fiyat (₺)</label>
                      <input type="number" required value={newItemData.price} onChange={e => setNewItemData({...newItemData, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Görsel URL</label>
                    <input type="text" value={newItemData.image} onChange={e => setNewItemData({...newItemData, image: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" placeholder="https://images.unsplash.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Açıklama ({activeLangTab})</label>
                    <textarea rows="2" value={newItemData["description"+activeLangTab] || (activeLangTab === "TR" ? newItemData.description : "") || ""} onChange={e => setNewItemData({...newItemData, ["description"+activeLangTab]: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium resize-none" placeholder={`Menüde görünecek açıklama (${activeLangTab})...`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">🥩 Mutfak Malzemeleri & Gramajlar (Virgülle ayırın)</label>
                    <input type="text" value={newItemData.ingredients} onChange={e => setNewItemData({...newItemData, ingredients: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" placeholder="180g Arborio Pirinci, 40g Parmesan, 10ml Truf Yağı" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">👨‍🍳 Hazırlık Adımları (Her satıra bir adım)</label>
                    <textarea rows="3" value={newItemData.steps} onChange={e => setNewItemData({...newItemData, steps: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium resize-none" placeholder="1. Pirinci zeytinyağında soteleyin&#10;2. Sıcak et suyu ekleyerek yedirin" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button type="button" onClick={() => setIsAddingNew(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-2xl font-bold transition-all">İptal</button>
                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-500/10 transition-all">Kaydet</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Item */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-black mb-6 text-amber-400 tracking-tight">Ürün & Reçete Düzenle</h2>
                <form onSubmit={handleSaveItem} className="space-y-5">
                  
                  {/* ÇOKLU DİL SEKMELERİ */}
                  <div className="flex gap-2 mb-4 p-1.5 bg-slate-950/50 rounded-2xl w-fit border border-slate-800 shadow-inner">
                    {["TR", "EN", "ES", "AR"].map(lang => (
                      <button type="button" key={lang} onClick={() => handleTabSwitch(lang, !!editingItem)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeLangTab === lang ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20" : "text-slate-500 hover:text-white"}`}>
                        {lang === "TR" ? "🇹🇷 TR" : lang === "EN" ? "🇬🇧 EN" : lang === "ES" ? "🇪🇸 ES" : "🇦🇪 AR"}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yemek Adı ({activeLangTab})</label>
                    <input type="text" required={activeLangTab === "TR"} value={editingItem["name"+activeLangTab] || ""} onChange={e => setEditingItem({...editingItem, ["name"+activeLangTab]: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                      <select value={editingItem.categoryId} onChange={e => setEditingItem({...editingItem, categoryId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nameTR}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fiyat (₺)</label>
                      <input type="number" required value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Görsel URL</label>
                    <input type="text" value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Açıklama ({activeLangTab})</label>
                    <textarea rows="2" value={editingItem["description"+activeLangTab] || (activeLangTab === "TR" ? editingItem.description : "") || ""} onChange={e => setEditingItem({...editingItem, ["description"+activeLangTab]: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">🥩 Mutfak Malzemeleri & Gramajlar</label>
                    <input type="text" value={Array.isArray(editingItem.ingredients) ? editingItem.ingredients.join(', ') : editingItem.ingredients} onChange={e => setEditingItem({...editingItem, ingredients: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">👨‍🍳 Hazırlık Adımları</label>
                    <textarea rows="3" value={Array.isArray(editingItem.steps) ? editingItem.steps.join('\n') : editingItem.steps} onChange={e => setEditingItem({...editingItem, steps: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-all font-medium resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button type="button" onClick={() => setEditingItem(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-2xl font-bold transition-all">İptal</button>
                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-500/10 transition-all">Güncellemeyi Kaydet</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 1: ITEMS */}
          {adminTab === 'items' && (
            <div className="space-y-6">
              {categories.map(cat => {
                const catItems = items.filter(i => i.categoryId === cat.id);
                return (
                  <div key={cat.id} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl">
                    <div className="flex justify-between items-center mb-5 border-b border-slate-800/80 pb-4">
                      <h2 className="text-lg font-black tracking-tight text-amber-400 flex items-center gap-3">
                        <span className="p-2 bg-slate-800/80 rounded-xl text-sm">📁</span> {getLoc(cat, "name")}
                      </h2>
                      <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">{catItems.length} {t("menu.options") || "Seçenek"}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {catItems.map(item => (
                        <div key={item.id} className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-all">
                          <div className="flex items-center gap-4">
                            <img src={item.image} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shadow-md" />
                            <div>
                              <h3 className="font-bold text-white text-base">{getLoc(item, "name")}</h3>
                              <span className="text-amber-400 font-black text-sm">{item.price} ₺</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingItem(item)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all">Düzenle</button>
                            <button onClick={() => handleDeleteItem(item.id, item.recipeId)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all">Sil</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: KITCHEN */}
          {adminTab === 'kitchen' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-3xl text-amber-300 text-sm flex items-center gap-4 shadow-lg">
                <span className="text-2xl">⚡</span>
                <div>
                  <strong className="block text-white font-black mb-0.5">Mutfak Operasyon Terminali</strong>
                  Bu bölüm şefler ve mutfak personeli için porsiyon gramajlarını, reçete içeriklerini ve adım akışlarını optimize etmek üzere tasarlanmıştır.
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map(item => (
                  <div key={item.id} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-black text-white tracking-tight">{getLoc(item, "name")}</h3>
                        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-bold">Standard Prep</span>
                      </div>
                      
                      <div className="mb-5">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">🥩 Gramaj ve Bileşenler:</span>
                        <div className="flex flex-wrap gap-2">
                          {item.ingredients && item.ingredients.length > 0 ? (
                            item.ingredients.map((ing, idx) => (
                              <span key={idx} className="bg-slate-950 text-slate-300 text-xs px-3 py-1.5 rounded-xl border border-slate-800 font-medium">
                                {ing}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 italic">Malzeme bilgisi tanımlanmamış.</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-5">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">👨‍🍳 İstasyon Adımları:</span>
                        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 font-medium">
                          {item.steps && item.steps.length > 0 ? (
                            item.steps.map((step, idx) => <li key={idx} className="leading-relaxed">{step}</li>)
                          ) : (
                            <span className="text-xs text-slate-600 italic">Hazırlık adımı eklenmemiş.</span>
                          )}
                        </ol>
                      </div>
                    </div>

                    <button 
                      onClick={() => setEditingItem(item)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-black py-3 rounded-2xl text-xs transition-all border border-slate-700 shadow-md"
                    >
                      Reçeteyi Güncelle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // MODERN MÜŞTERİ MENÜSÜ (LUXURY GLASSMORPHISM)
  // ==========================================
  const filteredItems = items.filter(item => item.categoryId === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 pb-28 font-sans antialiased selection:bg-amber-500 selection:text-black">
      
      <div className="fixed top-16 right-4 sm:top-4 sm:left-4 z-[60] scale-90 sm:scale-100 origin-top-right sm:origin-top-left">
        <LanguageTimeSwitcher />
      </div>

      {/* Admin Quick Entry Button */}
      <button 
        onClick={() => { setIsAdmin(true); window.history.replaceState({}, '', '?admin=true'); }}
        className="fixed top-4 right-4 z-50 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-black px-4 py-2.5 rounded-full backdrop-blur-xl shadow-2xl transition-all border border-slate-700/80 flex items-center gap-2 active:scale-95"
      >
        <span>⚙️</span> {t("admin.panel")}
      </button>

      {/* HEADER & HERO */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-center scale-105 filter brightness-75 transition-transform duration-700" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80')"}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full w-fit backdrop-blur-md">
            Phuket • Fine Dining & Fusion
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">The Brook</h1>
          <p className="text-sm text-slate-300 font-medium">{t("hero.description")}</p>
        </div>
      </div>

      {/* STICKY CATEGORY PILLS */}
      <div className="sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-slate-900 py-3 px-4 overflow-x-auto hide-scrollbar flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 ${
              activeCategory === cat.id
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800/50"
            }`}
          >
            {getLoc(cat, "name")}
          </button>
        ))}
      </div>

      {/* MENU FEED */}
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-white tracking-tight">
            {getLoc(categories.find(c => c.id === activeCategory), "name")}
          </h2>
          <span className="text-xs text-slate-500 font-bold">{filteredItems.length} {t("menu.options")}</span>
        </div>

        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="group bg-slate-900/50 border border-slate-800/80 rounded-3xl p-4 flex gap-4 backdrop-blur-md shadow-lg active:scale-98 transition-all duration-300 cursor-pointer hover:border-amber-500/50 hover:bg-slate-900"
          >
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden relative shrink-0 shadow-md">
              <img src={item.image} alt={getLoc(item, "name")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {item.tags?.includes("İmza") && (
                <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  ⭐ Signature
                </span>
              )}
            </div>

            <div className="flex flex-col justify-between flex-1 py-1">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors leading-tight mb-1">{getLoc(item, "name")}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{getLoc(item, "description")}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-black text-amber-400 text-lg tracking-tight">{item.price} ₺</span>
                <span className="text-[11px] bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 font-bold px-3 py-1.5 rounded-xl transition-all">
                  {t("actions.inspect")} →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/90 backdrop-blur-2xl border-t border-slate-900 p-4 flex justify-between items-center z-40 max-w-2xl mx-auto">
        <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-black py-3.5 px-4 rounded-2xl mr-2 text-xs sm:text-sm transition-all shadow-md">
          🔔 {t("actions.callWaiter")}
        </button>
        <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black py-3.5 px-4 rounded-2xl ml-2 text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20">
          {t("actions.requestBill")}
        </button>
      </div>

      {/* LUXURY ITEM MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-xl p-0 sm:p-4">
          <div className="bg-[#121216] border border-slate-800 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] overflow-y-auto hide-scrollbar">
            
            <div className="relative h-72 w-full">
              <img src={selectedItem.image} alt={getLoc(selectedItem, "name")} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent"></div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md font-black shadow-lg border border-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">{getLoc(selectedItem, "name")}</h2>
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">{t("menu.specialRecipe")}</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 whitespace-nowrap">{selectedItem.price} ₺</span>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed">{getLoc(selectedItem, "description")}</p>

              {/* Macro Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl text-center shadow-inner">
                  <span className="block text-[10px] text-amber-400 font-black uppercase tracking-wider mb-1">{t("menu.energy")}</span>
                  <span className="block text-xl font-black text-white">{selectedItem.calories || "-"} <span className="text-xs text-slate-400">kcal</span></span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl text-center shadow-inner">
                  <span className="block text-[10px] text-blue-400 font-black uppercase tracking-wider mb-1">{t("menu.protein")}</span>
                  <span className="block text-xl font-black text-white">{selectedItem.protein || "-"}</span>
                </div>
              </div>

              {/* Allergens */}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">{t("menu.allergens")}</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.allergens.map(alerjen => (
                      <span key={alerjen} className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3.5 py-1.5 rounded-xl">
                        {translateAllergen(alerjen)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-98 transition-all text-base">
                {t("menu.addToOrder")} — {selectedItem.price} ₺
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
