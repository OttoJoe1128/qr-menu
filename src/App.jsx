import { useEffect, useState } from "react";
import { initCore } from "./core/init";
import { db } from "./db";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("cat-kahvalti");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // Modal state'i

  useEffect(() => {
    async function loadApp() {
      await initCore();
      const cats = await db.categories.toArray();
      const rawItems = await db.menuItems.toArray();
      const recipes = await db.recipes.toArray();

      const mergedItems = rawItems.map(item => {
        const recipe = recipes.find(r => r.id === item.recipeId);
        return {
          ...item,
          image: item.id.includes("humus") 
            ? "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=600&q=80" 
            : "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
          description: recipe ? recipe.description : "",
        };
      });

      setCategories(cats.sort((a, b) => a.sortOrder - b.sortOrder));
      setItems(mergedItems);
      setLoading(false);
    }
    loadApp();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const filteredItems = items.filter(item => item.categoryId === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans relative">
      
      {/* HEADER & KATEGORİLER */}
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

      {/* MENÜ LİSTESİ */}
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {categories.find(c => c.id === activeCategory)?.nameTR}
        </h2>

        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)} // Tıklanınca modali aç
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
                {/* DİNAMİK FİYAT */}
                <span className="font-bold text-orange-600 text-lg whitespace-nowrap">{item.price} ₺</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 flex justify-between items-center z-40">
        <button className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl mr-2">
          🔔 Garson Çağır
        </button>
        <button className="flex-1 bg-black text-white font-bold py-3 px-4 rounded-xl ml-2">
          Hesap İste
        </button>
      </div>

      {/* ÜRÜN DETAY MODALI (BOTTOM SHEET) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto hide-scrollbar">
            
            {/* Modal Görsel & Kapat Butonu */}
            <div className="relative h-64">
              <img src={selectedItem.image} alt={selectedItem.nameTR} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal İçerik */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 pr-4">{selectedItem.nameTR}</h2>
                <span className="text-2xl font-bold text-orange-600 whitespace-nowrap">{selectedItem.price} ₺</span>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">{selectedItem.description}</p>

              {/* Besin Değerleri (Yeni Özellik) */}
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

              {/* Alerjen Uyarıları */}
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

              {/* Aksiyon Butonu */}
              <button className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-lg">
                Sepete Ekle - {selectedItem.price} ₺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animasyonları */}
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
