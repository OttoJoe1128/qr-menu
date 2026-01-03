import "fake-indexeddb/auto";
import { db } from "../db";
import { createChangeSet } from "../updates/changeSetService";
import { applyChangeSet } from "../updates/applyChangeSet";
import { createApprovedSnapshot } from "../updates/snapshotService";
async function seed() {
  console.log("Seeding database...");
  const simdi = Date.now();
  const kategorilerCs = createChangeSet([
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-kahvalti",
        nameTR: "Kahvaltı",
        nameEN: "Breakfast",
        slug: "kahvalti",
        sortOrder: 1,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-corbalar",
        nameTR: "Çorbalar",
        nameEN: "Soups",
        slug: "corbalar",
        sortOrder: 2,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-baslangiclar",
        nameTR: "Başlangıçlar & Atıştırmalıklar",
        nameEN: "Starters & Appetizers",
        slug: "baslangiclar-atistirmaliklar",
        sortOrder: 3,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-phuket-imza",
        nameTR: "Phuket İmza Yemekleri",
        nameEN: "Phuket Signature Dishes",
        slug: "phuket-imza-yemekleri",
        sortOrder: 4,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-bati-anayemekleri",
        nameTR: "Batı Anayemekleri",
        nameEN: "Western Main Courses",
        slug: "bati-anayemekleri",
        sortOrder: 5,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-comfort-food",
        nameTR: "Comfort Food",
        nameEN: "Comfort Food",
        slug: "comfort-food",
        sortOrder: 6,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-tatlilar",
        nameTR: "Tatlılar",
        nameEN: "Desserts",
        slug: "tatlilar",
        sortOrder: 7,
        active: true,
      },
    },
  ]);
  kategorilerCs.status = "approved";
  kategorilerCs.approvedAt = simdi;
  kategorilerCs.approvedBy = "seed";
  await applyChangeSet(kategorilerCs);
  console.log("✓ Kategoriler eklendi");
  const recipeCs = createChangeSet([
    {
      type: "ADD_RECIPE",
      payload: {
        id: "recipe-kahvalti-1",
        heroImage: "/images/smashed-avocado.jpg",
        description: "Kızarmış ekşi maya ekmeği üzerinde taze ezilmiş avokado, poşe yumurta ve beyaz peynir ile servis edilen modern sporcu kahvaltısı.",
        ingredients: [
          "Ekşi maya ekmeği (sourdough)",
          "Taze avokado",
          "Poşe yumurta",
          "Beyaz peynir",
          "Tuz, karabiber",
          "Limon suyu",
        ],
        steps: [
          "Ekşi maya ekmeğini kızartın",
          "Avokadoyu ezin ve limon suyu, tuz ekleyin",
          "Yumurtayı poşe yapın",
          "Kızarmış ekmek üzerine avokado, beyaz peynir ve poşe yumurtayı yerleştirin",
        ],
        pairings: ["Taze sıkılmış portakal suyu", "Filtre kahve"],
        chefNotes: "Avokadoyu ezmeyi aşırıya kaçırmayın - kaba doku daha iyi.",
      },
    },
    {
      type: "ADD_RECIPE",
      payload: {
        id: "recipe-kahvalti-2",
        heroImage: "/images/thai-roti.jpg",
        description: "Tavada taze kızartılmış Roti ekmeğinin, sahanda yumurta ve batırmalık Massaman köri sosu ile eşleştiği yerel favori.",
        ingredients: [
          "Roti hamuru",
          "Sahanda yumurta",
          "Massaman köri sosu",
          "Hindistan cevizi sütü",
          "Fıstık",
        ],
        steps: [
          "Roti hamurunu tavada kızartın",
          "Sahanda yumurta pişirin",
          "Massaman köri sosunu ısıtın",
          "Roti'yi yumurta ve köri sosu ile servis edin",
        ],
        pairings: ["Tayland çayı", "Soğuk süt"],
        chefNotes: "Roti'yi çokince açın - ince olması lezzeti artırır.",
      },
    },
    {
      type: "ADD_RECIPE",
      payload: {
        id: "recipe-kahvalti-3",
        heroImage: "/images/big-breakfast.jpg",
        description: "Yumurta, sosis, bacon, mantar ve fasulye ile hazırlanan doyurucu ve klasik İngiliz kahvaltı tabağı.",
        ingredients: [
          "Yumurta (sahanda veya haşlanmış)",
          "Domuz sosis",
          "Bacon dilimleri",
          "Mantar",
          "Fırın fasulye",
          "Kızarmış ekmek",
          "Domates",
        ],
        steps: [
          "Sosisleri ve bacon'ı pişirin",
          "Mantarları soteleyin",
          "Yumurtaları pişirin",
          "Fasulyeleri ısıtın",
          "Tümünü tabağa yerleştirin",
        ],
        pairings: ["İngiliz kahvaltı çayı", "Portakal suyu"],
        chefNotes: "Tüm bileşenleri aynı anda sıcak servis etmek önemli.",
      },
    },
    {
      type: "ADD_RECIPE",
      payload: {
        id: "recipe-kahvalti-4",
        heroImage: "/images/smoothie-bowl.jpg",
        description: "Mango ve muz tabanlı, üzeri taze tropikal meyveler ve granola ile süslenmiş ferahlatıcı vegan kase.",
        ingredients: [
          "Dondurulmuş mango",
          "Muz",
          "Hindistan cevizi sütü",
          "Granola",
          "Taze meyveler (ananas, ejder meyvesi, kivi)",
          "Chia tohumları",
          "Hindistan cevizi parçaları",
        ],
        steps: [
          "Mango, muz ve hindistan cevizi sütünü blenderdan geçirin",
          "Kaseye dökün",
          "Üzerine granola, taze meyveler ve tohumları yerleştirin",
        ],
        pairings: ["Taze limonata", "Yeşil çay"],
        chefNotes: "Smoothie'yi kalın kıvamda tutun ki üzerine süsler durabilsin.",
      },
    },
    {
      type: "ADD_RECIPE",
      payload: {
        id: "recipe-kahvalti-5",
        heroImage: "/images/eggs-benedict.jpg",
        description: "İngiliz Muffin ekmeği üzerinde poşe yumurta, dana jambon ve ev yapımı hollandez sos ile sunulan kahvaltı klasiği.",
        ingredients: [
          "İngiliz Muffin ekmeği",
          "Poşe yumurta",
          "Dana jambon dilimleri",
          "Ev yapımı hollandez sos",
          "Tereyağı",
          "Taze maydanoz",
        ],
        steps: [
          "Muffin'i ikiye bölüp kızartın",
          "Jambonu kızartın",
          "Yumurtaları poşe yapın",
          "Hollandez sosunu hazırlayın",
          "Muffin üzerine jambon, poşe yumurta ve hollandez sosu yerleştirin",
        ],
        pairings: ["Mimosa kokteyni", "Cappuccino"],
        chefNotes: "Hollandez sosunun sıcaklığına dikkat edin - çok sıcak olursa kesilir.",
      },
    },
    {
      type: "ADD_RECIPE",
      payload: {
        id: "recipe-kahvalti-6",
        heroImage: "/images/pancake-stack.jpg",
        description: "Akçaağaç şurubu, taze meyveler ve pudra şekeri ile servis edilen üç katlı puf Amerikan krep kulesi.",
        ingredients: [
          "Un",
          "Yumurta",
          "Süt",
          "Kabartma tozu",
          "Vanilya",
          "Akçaağaç şurubu",
          "Taze meyveler (çilek, yaban mersini)",
          "Pudra şekeri",
          "Tereyağı",
        ],
        steps: [
          "Pancake hamurunu hazırlayın",
          "Tavada kalın pancake'leri pişirin",
          "Üç pancake'i üst üste dizin",
          "Tereyağı, akçaağaç şurubu ve meyvelerle süsleyin",
        ],
        pairings: ["Sıcak çikolata", "Filtre kahve"],
        chefNotes: "Hamuru çok karıştırmayın - hafif pürüzlü olmalı.",
      },
    },
    {
      type: "ADD_RECIPE",
      payload: {
        id: "recipe-kahvalti-7",
        heroImage: "/images/continental-breakfast.jpg",
        description: "Kruvasan, fırın ürünleri, mevsim meyveleri, yoğurt ve reçel çeşitlerinden oluşan hafif başlangıç tabağı.",
        ingredients: [
          "Kruvasan",
          "Çeşitli fırın ürünleri (pain au chocolat, muffin)",
          "Mevsim meyveleri",
          "Yoğurt",
          "Reçel çeşitleri",
          "Tereyağı",
          "Bal",
        ],
        steps: [
          "Kruvasanı ısıtın",
          "Meyveleri yıkayıp dilimleyin",
          "Tüm bileşenleri tabağa yerleştirin",
        ],
        pairings: ["Espresso", "Taze portakal suyu"],
        chefNotes: "Taze fırınlanmış kruvasan bu kahvaltının anahtarı.",
      },
    },
  ]);
  recipeCs.status = "approved";
  recipeCs.approvedAt = simdi;
  recipeCs.approvedBy = "seed";
  await applyChangeSet(recipeCs);
  console.log("✓ Recipe'ler eklendi");
  const menuItemsCs = createChangeSet([
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-1",
        nameTR: "Smashed Avocado on Sourdough",
        nameEN: "Smashed Avocado on Sourdough",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: "recipe-kahvalti-1",
        tags: ["avocado", "healthy", "vegetarian"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-2",
        nameTR: "Southern Thai Roti Set",
        nameEN: "Southern Thai Roti Set",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: "recipe-kahvalti-2",
        tags: ["thai", "local", "roti"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-3",
        nameTR: "The Brook Big Breakfast",
        nameEN: "The Brook Big Breakfast",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: "recipe-kahvalti-3",
        tags: ["english", "classic", "hearty"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-4",
        nameTR: "Tropical Smoothie Bowl",
        nameEN: "Tropical Smoothie Bowl",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: "recipe-kahvalti-4",
        tags: ["smoothie", "vegan", "healthy", "tropical"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-5",
        nameTR: "Royal Eggs Benedict",
        nameEN: "Royal Eggs Benedict",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: "recipe-kahvalti-5",
        tags: ["eggs", "classic", "benedict"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-6",
        nameTR: "American Pancake Stack",
        nameEN: "American Pancake Stack",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: "recipe-kahvalti-6",
        tags: ["pancake", "american", "sweet"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-7",
        nameTR: "Continental Breakfast",
        nameEN: "Continental Breakfast",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: "recipe-kahvalti-7",
        tags: ["continental", "light", "classic"],
        available: true,
      },
    },
  ]);
  menuItemsCs.status = "approved";
  menuItemsCs.approvedAt = simdi;
  menuItemsCs.approvedBy = "seed";
  await applyChangeSet(menuItemsCs);
  console.log("✓ Menu items eklendi");
  const snapshot = await createApprovedSnapshot("seed");
  console.log("✓ Snapshot:", snapshot);
  const kategoriler = await db.categories.toArray();
  const menuItems = await db.menuItems.toArray();
  const recipes = await db.recipes.toArray();
  console.log(`✓ ${kategoriler.length} kategori eklendi`);
  console.log(`✓ ${recipes.length} recipe eklendi`);
  console.log(`✓ ${menuItems.length} menü öğesi eklendi`);
  console.log("✓ Seed completed");
}
seed().catch((err) => {
  console.error("Seed failed:", err);
});
