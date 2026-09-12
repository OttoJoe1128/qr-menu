import "fake-indexeddb/auto";
import { db } from "../db";
import { createChangeSet } from "../updates/changeSetService";
import { applyChangeSet } from "../updates/applyChangeSet";
import { createApprovedSnapshot } from "../updates/snapshotService";

export async function seedDatabase() {
  console.log("Checking database status...");
  
  const count = await db.categories.count();
  if (count > 0) {
    console.log("✓ Database is already seeded. Skipping seed process.");
    return; 
  }

  console.log("Seeding Full The Brook Menu...");
  const simdi = Date.now();

  // ==========================================
  // 1. KATEGORİLER
  // ==========================================
  const kategorilerCs = createChangeSet([
    { type: "ADD_CATEGORY", payload: { id: "cat-kahvalti", nameTR: "Kahvaltı Deneyimi", nameEN: "Breakfast", slug: "kahvalti", sortOrder: 1, active: true } },
    { type: "ADD_CATEGORY", payload: { id: "cat-meze", nameTR: "Meze & Başlangıçlar", nameEN: "Meze & Starters", slug: "meze", sortOrder: 2, active: true } },
    { type: "ADD_CATEGORY", payload: { id: "cat-anayemek", nameTR: "Ana Yemekler", nameEN: "Main Courses", slug: "ana-yemek", sortOrder: 3, active: true } },
    { type: "ADD_CATEGORY", payload: { id: "cat-vegan", nameTR: "Vejetaryen & Vegan", nameEN: "Green Menu", slug: "vegan", sortOrder: 4, active: true } },
    { type: "ADD_CATEGORY", payload: { id: "cat-tatli", nameTR: "Tatlılar & Final", nameEN: "Desserts", slug: "tatli", sortOrder: 5, active: true } }
  ]);
  kategorilerCs.status = "approved"; kategorilerCs.approvedAt = simdi; await applyChangeSet(kategorilerCs);

  // ==========================================
  // 2. REÇETELER (Görsel ve Detaylar)
  // ==========================================
  const recipeCs = createChangeSet([
    // KAHVALTI
    { type: "ADD_RECIPE", payload: { id: "r-serpme", heroImage: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80", description: "2 Kişilik Paylaşımlı Deneyim. Peynir tabağı, söğüş, zeytin, bal & kaymak, menemen, sigara böreği ve ızgara sucuk.", ingredients: ["Beyaz Peynir", "Zeytin", "Menemen", "Sucuk"], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-tabak", heroImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80", description: "Hızlı, doyurucu ve dengeli. Sahanda yumurta, peynir çeşitleri, sigara böreği ve bal tereyağı.", ingredients: [], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-cilbir", heroImage: "https://images.unsplash.com/photo-1625938146369-adc83368bda2?w=600&q=80", description: "Sarımsaklı yoğurt üzerinde poşe yumurta ve acı biberli tereyağı sosu.", ingredients: [], steps: [] } },
    // MEZE
    { type: "ADD_RECIPE", payload: { id: "r-platter", heroImage: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&q=80", description: "Menüdeki en popüler 4 soğuk mezenin (Humus, Ezme, Haydari, Babagannuş) sıcak Roti ile tadımlık sunumu.", ingredients: [], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-humus", heroImage: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=600&q=80", description: "Pürüzsüz nohut püresi, tahin, sarımsak ve sızma zeytinyağı.", ingredients: [], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-karides", heroImage: "https://images.unsplash.com/photo-1625937712144-ddc9d5e3cb98?w=600&q=80", description: "Chalong karidesi, sarımsaklı tereyağı ve pul biber ile cızırdayarak servis edilir.", ingredients: [], steps: [] } },
    // ANA YEMEK
    { type: "ADD_RECIPE", payload: { id: "r-alinazik", heroImage: "https://images.unsplash.com/photo-1651763087839-42218080f4f7?w=600&q=80", description: "Ilık köz patlıcan ve sarımsaklı yoğurt püresi üzerinde ızgara dana bonfile küpleri.", ingredients: [], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-beyti", heroImage: "https://images.unsplash.com/photo-1628268909376-e8c558e80ae4?w=600&q=80", description: "Tortilla ekmeğine sarılı ızgara köfte, domates sosu ve süzme yoğurt ile.", ingredients: [], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-manti", heroImage: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&q=80", description: "Wonton hamurunda kızarmış çıtır mantı, yoğurt ve acı yağ ile.", ingredients: [], steps: [] } },
    // VEGAN
    { type: "ADD_RECIPE", payload: { id: "r-imambayildi", heroImage: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80", description: "Karamelize soğan, sarımsak ve domates ile doldurulmuş, zeytinyağlı soğuk patlıcan.", ingredients: [], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-chickpea", heroImage: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&q=80", description: "Sarımsaklı yoğurt yatağında sıcak baharatlı nohut ve çıtır krutonlar.", ingredients: [], steps: [] } },
    // TATLI
    { type: "ADD_RECIPE", payload: { id: "r-katmer", heroImage: "https://images.unsplash.com/photo-1551024506-0cb4a1e07a06?w=600&q=80", description: "Fıstık ve Mascarpone kaymağı ile doldurulup çıtır kızartılmış ince Roti hamuru.", ingredients: [], steps: [] } },
    { type: "ADD_RECIPE", payload: { id: "r-sutlac", heroImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80", description: "Fırında üzeri yakılmış, ferahlatıcı geleneksel sütlaç.", ingredients: [], steps: [] } }
  ]);
  recipeCs.status = "approved"; recipeCs.approvedAt = simdi; await applyChangeSet(recipeCs);

  // ==========================================
  // 3. ÜRÜNLER (MenuItems - Fiyat & Makrolar)
  // ==========================================
  const menuItemsCs = createChangeSet([
    // KAHVALTI
    { type: "ADD_MENU_ITEM", payload: { id: "m-serpme", nameTR: "Serpme Kahvaltı", categoryId: "cat-kahvalti", recipeId: "r-serpme", templateId: "food_detail_v1", tags: ["Paylaşımlı", "İmza"], available: true, price: 850, calories: 1250, protein: "45g", allergens: ["Süt", "Gluten", "Yumurta"] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-tabak", nameTR: "Osmanlı Kahvaltı Tabağı", categoryId: "cat-kahvalti", recipeId: "r-tabak", templateId: "food_detail_v1", tags: ["Tek Kişilik"], available: true, price: 350, calories: 650, protein: "28g", allergens: ["Süt", "Gluten", "Yumurta"] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-cilbir", nameTR: "Çılbır (Turkish Poached Eggs)", categoryId: "cat-kahvalti", recipeId: "r-cilbir", templateId: "food_detail_v1", tags: ["Yüksek Protein"], available: true, price: 220, calories: 340, protein: "18g", allergens: ["Süt", "Yumurta"] } },
    
    // MEZE
    { type: "ADD_MENU_ITEM", payload: { id: "m-platter", nameTR: "The Ottoman Meze Platter", categoryId: "cat-meze", recipeId: "r-platter", templateId: "food_detail_v1", tags: ["Paylaşımlı", "İmza"], available: true, price: 420, calories: 850, protein: "22g", allergens: ["Süt", "Gluten", "Susam"] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-humus", nameTR: "Klasik Humus", categoryId: "cat-meze", recipeId: "r-humus", templateId: "food_detail_v1", tags: ["Vegan", "Glutensiz"], available: true, price: 180, calories: 320, protein: "12g", allergens: ["Susam"] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-karides", nameTR: "Sizzling Karides Güveç", categoryId: "cat-meze", recipeId: "r-karides", templateId: "food_detail_v1", tags: ["Deniz Ürünü", "Sıcak"], available: true, price: 480, calories: 410, protein: "32g", allergens: ["Kabuklular", "Süt"] } },
    
    // ANA YEMEK
    { type: "ADD_MENU_ITEM", payload: { id: "m-alinazik", nameTR: "Ali Nazik Kebap", categoryId: "cat-anayemek", recipeId: "r-alinazik", templateId: "food_detail_v1", tags: ["İmza", "Köz Tadı"], available: true, price: 550, calories: 680, protein: "42g", allergens: ["Süt"] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-beyti", nameTR: "Beyti Kebap Rolls", categoryId: "cat-anayemek", recipeId: "r-beyti", templateId: "food_detail_v1", tags: ["Fusion"], available: true, price: 490, calories: 720, protein: "38g", allergens: ["Gluten", "Süt"] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-manti", nameTR: "Crispy Turkish Ravioli", categoryId: "cat-anayemek", recipeId: "r-manti", templateId: "food_detail_v1", tags: ["Fusion", "Paylaşımlı"], available: true, price: 380, calories: 550, protein: "24g", allergens: ["Gluten", "Süt", "Yumurta"] } },

    // VEGAN
    { type: "ADD_MENU_ITEM", payload: { id: "m-imambayildi", nameTR: "İmam Bayıldı", categoryId: "cat-vegan", recipeId: "r-imambayildi", templateId: "food_detail_v1", tags: ["Vegan", "Soğuk Servis"], available: true, price: 280, calories: 210, protein: "4g", allergens: [] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-chickpea", nameTR: "Crispy Chickpea Bowl", categoryId: "cat-vegan", recipeId: "r-chickpea", templateId: "food_detail_v1", tags: ["Vejetaryen", "Doyurucu"], available: true, price: 260, calories: 420, protein: "16g", allergens: ["Süt", "Gluten"] } },

    // TATLI
    { type: "ADD_MENU_ITEM", payload: { id: "m-katmer", nameTR: "Phuket Style Katmer", categoryId: "cat-tatli", recipeId: "r-katmer", templateId: "food_detail_v1", tags: ["İmza", "Sıcak"], available: true, price: 320, calories: 580, protein: "8g", allergens: ["Gluten", "Süt", "Kuruyemiş"] } },
    { type: "ADD_MENU_ITEM", payload: { id: "m-sutlac", nameTR: "Fırın Sütlaç", categoryId: "cat-tatli", recipeId: "r-sutlac", templateId: "food_detail_v1", tags: ["Klasik", "Soğuk"], available: true, price: 180, calories: 290, protein: "6g", allergens: ["Süt"] } }
  ]);
  menuItemsCs.status = "approved"; menuItemsCs.approvedAt = simdi; await applyChangeSet(menuItemsCs);

  const snapshot = await createApprovedSnapshot("seed");
  console.log("✓ Full Menu Snapshot alındı:", snapshot.id);
  console.log("✓ SEED COMPLETED - Dükkan ağzına kadar dolu!");
}
