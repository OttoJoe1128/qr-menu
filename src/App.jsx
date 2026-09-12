import { useEffect, useState } from "react";
import { initCore } from "./core/init";
import { db } from "./db";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState("cat-kahvalti");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Admin Paneli Modu ve Alt Sekmeleri
  const [isAdmin, setIsAdmin] = useState(window.location.search.includes("admin=true"));
  const [adminTab, setAdminTab] = useState("items"); // "items" veya "categories"
  
  // Düzenleme / Ekleme Form State'leri
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemData, setNewItemData] = useState({
    id: "",
    nameTR: "",
    categoryId: "cat-kahvalti",
    price: 0,
    calories: 0,
    protein: "",
    tags: "",
    description: "",
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
        image: recipe?.heroImage || "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
        description: recipe ? recipe.description : "",
        ingredients: recipe ? recipe.ingredients : [],
      };
    });

    setCategories(cats.sort((a, b) => a.sortOrder - b.sortOrder));
    setItems(mergedItems);
    setRecipes(recs);
    setLoading(false);
  }

  // Admin: Ürün Güncelleme
  async function handleSaveItem(e) {
    e.preventDefault();
    if (!editingItem) return;

    await db.menuItems.update(editingItem.id, {
      nameTR: editingItem.nameTR,
      price: Number(editingItem.price),
      categoryId: editingItem.categoryId,
      tags: typeof editingItem.tags === 'string' ? editingItem.tags.split(',').map(t => t.trim()) : editingItem.tags,
      updatedAt: Date.now()
    });

    if (editingItem.recipeId) {
      await db.recipes.update(editingItem.recipeId, {
        description: editingItem.description,
        updatedAt: Date.now()
      });
    }

    alert("Ürün ve reçete başarıyla güncellendi!");
    setEditingItem(null);
    loadAppData();
  }

  // Admin: Yeni Ürün Ekleme
  async function handleCreateItem(e) {
    e.preventDefault();
    const newId = "m-" + Date.now();
    const newRecipeId = "r-" + Date.now();

    // Önce reçeteyi oluştur
    await db.recipes.put({
      id: newRecipeId,
      heroImage: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&q=80",
      description: newItemData.description || "Yeni eklenen lezzetli ürün açıklaması.",
      ingredients: newItemData.tags ? newItemData.tags.split(',') : [],
      steps: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Sonra menü öğesini ekle
    await db.menuItems.put({
      id: newId,
      nameTR: newItemData.nameTR,
      categoryId: newItemData.categoryId,
      recipeId: newRecipeId,
      templateId: "food_detail_v1",
      price: Number(newItemData.price),
      calories: Number(newItemData.calories) || 300,
      protein: newItemData.protein || "15g",
      allergens: newItemData.allergens ? newItemData.allergens.split(',').map(a => a.trim()) : [],
      tags: newItemData.tags ? newItemData.tags.split(',').map(t => t.trim()) : ["Yeni"],
      available: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    alert("Yeni menü öğesi başarıyla eklendi!");
    setIsAddingNew(false);
    setNewItemData({ id: "", nameTR: "", categoryId: "cat-kahvalti", price: 0, calories: 0, protein: "", tags: "", description: "", allergens: "" });
    loadAppData();
  }

  // Admin: Ürün Silme
  async function handleDeleteItem(itemId) {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      await db.menuItems.delete(itemId);
      loadAppData();
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // ==========================================
  // PROFESYONEL YÖNETİCİ PANELI (ADMIN DASHBOARD)
  // ==========================================
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-800 pb-4 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">The Brook — SaaS Admin</h1>
              <p className="text-sm text-gray-400">Restoran menü, fiyat, reçete ve kategori yönetim merkezi</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAddingNew(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
              >
                + Yeni Ürün Ekle
              </button>
              <button 
                onClick={() => { setIsAdmin(false); window.history.replaceState({}, '', window.location.pathname); }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
              >
                Müşteri Menüsüne Dön
              </button>
            </div>
          </div>

          {/* Yeni Ürün Ekleme Modalı */}
          {isAddingNew && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="bg-gray-900 border border-gray-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4 text-orange-400">Yeni Menü Öğesi Ekle</h2>
                <form onSubmit={handleCreateItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Yemek Adı (TR)</label>
                    <input type="text" required value={newItemData.nameTR} onChange={e => setNewItemData({...newItemData, nameTR: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="Örn: Adana Kebap" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kategori</label>
                      <select value={newItemData.categoryId} onChange={e => setNewItemData({...newItemData, categoryId: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nameTR}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fiyat (₺)</label>
                      <input type="number" required value={newItemData.price} onChange={e => setNewItemData({...newItemData, price: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kalori (kcal)</label>
                      <input type="number" value={newItemData.calories} onChange={e => setNewItemData({...newItemData, calories: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Protein</label>
                      <input type="text" value={newItemData.protein} onChange={e => setNewItemData({...newItemData, protein: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="Örn: 35g" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Açıklama (Reçete Notu)</label>
                    <textarea rows="3" value={newItemData.description} onChange={e => setNewItemData({...newItemData, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="Yemeğin kısa hikayesi ve içeriği..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Etiketler (Virgülle ayırın)</label>
                    <input type="text" value={newItemData.tags} onChange={e => setNewItemData({...newItemData, tags: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="İmza, Vegan, Acılı" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alerjenler (Virgülle ayırın)</label>
                    <input type="text" value={newItemData.allergens} onChange={e => setNewItemData({...newItemData, allergens: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="Süt, Gluten, Susam" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                    <button type="button" onClick={() => setIsAddingNew(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl font-bold">İptal</button>
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">Ürünü Kaydet</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Düzenleme Modalı */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="bg-gray-900 border border-gray-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4 text-orange-400">Ürün Düzenle: {editingItem.nameTR}</h2>
                <form onSubmit={handleSaveItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Yemek Adı (TR)</label>
                    <input type="text" required value={editingItem.nameTR} onChange={e => setEditingItem({...editingItem, nameTR: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kategori</label>
                      <select value={editingItem.categoryId} onChange={e => setEditingItem({...editingItem, categoryId: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nameTR}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fiyat (₺)</label>
                      <input type="number" required value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Açıklama / Reçete Detayı</label>
                    <textarea rows="3" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                    <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl font-bold">İptal</button>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">Değişiklikleri Kaydet</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Kategori Bazlı Ürün Listesi Tablosu */}
          <div className="space-y-6">
            {categories.map(cat => {
              const catItems = items.filter(i => i.categoryId === cat.id);
              return (
                <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
                    <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                      <span>📁</span> {cat.nameTR}
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{catItems.length} Ürün</span>
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-800">
                    {catItems.map(item => (
                      <div key={item.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h3 className="font-bold text-white">{item.nameTR}</h3>
                            <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-extrabold text-orange-500">{item.price} ₺</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingItem(item)}
                              className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              Düzenle
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-red-900/40 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-800/50"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {catItems.length === 0 && (
                      <p className="text-xs text-gray-500 py-2 italic">Bu kategoride henüz ürün bulunmuyor.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // MÜŞTERİ MENÜSÜ GÖRÜNÜMÜ
  // ==========================================
  const filteredItems = items.filter(item => item.categoryId === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans relative">
      
      <button 
        onClick={() => { setIsAdmin(true); window.history.replaceState({}, '', '?admin=true'); }}
        className="fixed top-4 right-4 z-50 bg-black/75 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full backdrop-blur-md shadow-xl transition-all border border-white/10"
      >
        ⚙️ Yönetici Paneli
      </button>

      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="h-40 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80')"}}>
          <div className="w-full h-full bg-black/40 flex flex-col justify-end p-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">The Brook</h1>
            <p className="text-sm text-gray-200">Phuket Yerel Malzemeleriyle Türk Mutfağı</p>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar py-4 px-4 gap-3 bg-white">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.nameTR}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {categories.find(c => c.id === activeCategory)?.nameTR}
        </h2>

        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col active:scale-95 transition-transform cursor-pointer"
          >
            <div className="h-48 w-full overflow-hidden relative">
              <img src={item.image} alt={item.nameTR} className="w-full h-full object-cover" />
              {item.tags?.includes("İmza") && (
                <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  ⭐ Signature
                </span>
              )}
            </div>

            <div className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900 leading-tight pr-4">{item.nameTR}</h3>
                <span className="font-bold text-orange-600 text-lg whitespace-nowrap">{item.price} ₺</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 flex justify-between items-center z-40">
        <button className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl mr-2">
          🔔 Garson Çağır
        </button>
        <button className="flex-1 bg-black text-white font-bold py-3 px-4 rounded-xl ml-2">
          Hesap İste
        </button>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto hide-scrollbar">
            
            <div className="relative h-64">
              <img src={selectedItem.image} alt={selectedItem.nameTR} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 pr-4">{selectedItem.nameTR}</h2>
                <span className="text-2xl font-bold text-orange-600 whitespace-nowrap">{selectedItem.price} ₺</span>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">{selectedItem.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                  <span className="block text-xs text-orange-500 font-bold uppercase mb-1">Kalori</span>
                  <span className="block text-xl font-bold text-gray-900">{selectedItem.calories || "-"} kcal</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                  <span className="block text-xs text-blue-500 font-bold uppercase mb-1">Protein</span>
                  <span className="block text-xl font-bold text-gray-900">{selectedItem.protein || "-"}</span>
                </div>
              </div>

              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="mb-8">
                  <span className="block text-xs font-bold text-gray-400 uppercase mb-3">⚠️ Alerjen Uyarısı</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.allergens.map(alerjen => (
                      <span key={alerjen} className="bg-red-50 text-red-600 border border-red-100 text-sm font-bold px-4 py-2 rounded-full">
                        {alerjen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-lg">
                Sepete Ekle - {selectedItem.price} ₺
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
