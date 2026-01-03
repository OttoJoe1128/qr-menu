import "fake-indexeddb/auto";
import { db } from "../db";
import { createChangeSet } from "../updates/changeSetService";
import { applyChangeSet } from "../updates/applyChangeSet";
import { createApprovedSnapshot } from "../updates/snapshotService";

async function seedFull() {
  console.log("🌱 Tam menü seed başlıyor...");
  const simdi = Date.now();

  // KATEGORİLER
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
        id: "cat-salatalar",
        nameTR: "Salatalar",
        nameEN: "Salads",
        slug: "salatalar",
        sortOrder: 4,
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
        sortOrder: 5,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-deniz-urunleri",
        nameTR: "Deniz Ürünleri",
        nameEN: "Seafood",
        slug: "deniz-urunleri",
        sortOrder: 6,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-bati-anayemekleri",
        nameTR: "Batı Ana Yemekleri",
        nameEN: "Western Main Courses",
        slug: "bati-anayemekleri",
        sortOrder: 7,
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
        sortOrder: 8,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-makarnalar",
        nameTR: "Makarnalar",
        nameEN: "Pasta",
        slug: "makarnalar",
        sortOrder: 9,
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
        sortOrder: 10,
        active: true,
      },
    },
  ]);
  kategorilerCs.status = "approved";
  kategorilerCs.approvedAt = simdi;
  kategorilerCs.approvedBy = "seed-full";
  await applyChangeSet(kategorilerCs);
  console.log("✓ 10 kategori eklendi");

  // TOPLAM: 7 + 5 + 5 + 4 + 9 + 3 + 6 + 2 + 4 + 5 = 50 recipe
  console.log("📝 Recipe'ler ekleniyor... (bu biraz zaman alabilir)");
  
  await seedKahvaltiRecipes(simdi);
  await seedCorbalarRecipes(simdi);
  await seedBaslangiclarRecipes(simdi);
  await seedSalatalarRecipes(simdi);
  await seedPhuketImzaRecipes(simdi);
  await seedDenizUrunleriRecipes(simdi);
  await seedBatiAnaYemekleriRecipes(simdi);
  await seedComfortFoodRecipes(simdi);
  await seedMakarnalarRecipes(simdi);
  await seedTatlilarRecipes(simdi);

  const snapshot = await createApprovedSnapshot("seed-full");
  console.log("✓ Snapshot oluşturuldu:", snapshot.id);

  const kategoriler = await db.categories.toArray();
  const menuItems = await db.menuItems.toArray();
  const recipes = await db.recipes.toArray();
  console.log(`\n🎉 Seed tamamlandı!`);
  console.log(`  ├─ ${kategoriler.length} kategori`);
  console.log(`  ├─ ${recipes.length} recipe`);
  console.log(`  └─ ${menuItems.length} menü öğesi`);
}

// KAHVALTI
async function seedKahvaltiRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-kahvalti-1",
      heroImage: "/images/breakfast/smashed-avocado.jpg",
      description: "Kızarmış ekşi maya ekmeği üzerinde taze ezilmiş avokado, poşe yumurta ve beyaz peynir ile servis edilen modern sporcu kahvaltısı.",
      ingredients: ["Ekşi maya ekmeği", "Taze avokado", "Poşe yumurta", "Beyaz peynir", "Tuz, karabiber", "Limon suyu"],
      steps: ["Ekşi maya ekmeğini kızartın", "Avokadoyu ezin ve limon suyu, tuz ekleyin", "Yumurtayı poşe yapın", "Kızarmış ekmek üzerine avokado, beyaz peynir ve poşe yumurtayı yerleştirin"],
      pairings: ["Taze portakal suyu", "Filtre kahve"],
      chefNotes: "Avokadoyu ezmeyi aşırıya kaçırmayın - kaba doku daha iyi.",
    },
    {
      id: "recipe-kahvalti-2",
      heroImage: "/images/breakfast/thai-roti.jpg",
      description: "Tavada taze kızartılmış Roti ekmeğinin, sahanda yumurta ve batırmalık Massaman köri sosu ile eşleştiği yerel favori.",
      ingredients: ["Roti hamuru", "Sahanda yumurta", "Massaman köri sosu", "Hindistan cevizi sütü", "Fıstık"],
      steps: ["Roti hamurunu tavada kızartın", "Sahanda yumurta pişirin", "Massaman köri sosunu ısıtın", "Roti'yi yumurta ve köri sosu ile servis edin"],
      pairings: ["Thai çayı", "Soğuk süt"],
      chefNotes: "Roti'yi çok ince açın - ince olması lezzeti artırır.",
    },
    {
      id: "recipe-kahvalti-3",
      heroImage: "/images/breakfast/big-breakfast.jpg",
      description: "Yumurta, sosis, bacon, mantar ve fasulye ile hazırlanan doyurucu ve klasik İngiliz kahvaltı tabağı.",
      ingredients: ["Yumurta", "Domuz sosis", "Bacon", "Mantar", "Fırın fasulye", "Kızarmış ekmek", "Domates"],
      steps: ["Sosisleri ve bacon'ı pişirin", "Mantarları soteleyin", "Yumurtaları pişirin", "Fasulyeleri ısıtın", "Tümünü tabağa yerleştirin"],
      pairings: ["İngiliz çayı", "Portakal suyu"],
      chefNotes: "Tüm bileşenleri aynı anda sıcak servis etmek önemli.",
    },
    {
      id: "recipe-kahvalti-4",
      heroImage: "/images/breakfast/smoothie-bowl.jpg",
      description: "Mango ve muz tabanlı, üzeri taze tropikal meyveler ve granola ile süslenmiş ferahlatıcı vegan kase.",
      ingredients: ["Dondurulmuş mango", "Muz", "Hindistan cevizi sütü", "Granola", "Taze meyveler", "Chia tohumları", "Hindistan cevizi parçaları"],
      steps: ["Mango, muz ve hindistan cevizi sütünü blenderdan geçirin", "Kaseye dökün", "Üzerine granola, taze meyveler ve tohumları yerleştirin"],
      pairings: ["Taze limonata", "Yeşil çay"],
      chefNotes: "Smoothie'yi kalın kıvamda tutun ki üzerine süsler durabilsin.",
    },
    {
      id: "recipe-kahvalti-5",
      heroImage: "/images/breakfast/eggs-benedict.jpg",
      description: "İngiliz Muffin ekmeği üzerinde poşe yumurta, dana jambon ve ev yapımı hollandez sos ile sunulan kahvaltı klasiği.",
      ingredients: ["İngiliz Muffin", "Poşe yumurta", "Dana jambon", "Hollandez sos", "Tereyağı", "Maydanoz"],
      steps: ["Muffin'i kızartın", "Jambonu kızartın", "Yumurtaları poşe yapın", "Hollandez sosunu hazırlayın", "Tümünü birleştirin"],
      pairings: ["Mimosa", "Cappuccino"],
      chefNotes: "Hollandez sosunun sıcaklığına dikkat edin.",
    },
    {
      id: "recipe-kahvalti-6",
      heroImage: "/images/breakfast/pancake-stack.jpg",
      description: "Akçaağaç şurubu, taze meyveler ve pudra şekeri ile servis edilen üç katlı puf Amerikan krep kulesi.",
      ingredients: ["Un", "Yumurta", "Süt", "Kabartma tozu", "Vanilya", "Akçaağaç şurubu", "Taze meyveler", "Pudra şekeri"],
      steps: ["Hamuru hazırlayın", "Pancake'leri pişirin", "Üst üste dizin", "Tereyağı ve şurupla süsleyin"],
      pairings: ["Sıcak çikolata", "Filtre kahve"],
      chefNotes: "Hamuru çok karıştırmayın - hafif pürüzlü olmalı.",
    },
    {
      id: "recipe-kahvalti-7",
      heroImage: "/images/breakfast/continental.jpg",
      description: "Kruvasan, fırın ürünleri, mevsim meyveleri, yoğurt ve reçel çeşitlerinden oluşan hafif başlangıç tabağı.",
      ingredients: ["Kruvasan", "Fırın ürünleri", "Mevsim meyveleri", "Yoğurt", "Reçel", "Tereyağı", "Bal"],
      steps: ["Kruvasanı ısıtın", "Meyveleri dilimleyin", "Tüm bileşenleri tabağa yerleştirin"],
      pairings: ["Espresso", "Portakal suyu"],
      chefNotes: "Taze fırınlanmış kruvasan bu kahvaltının anahtarı.",
    },
  ];

  const menuItems = [
    { id: "menu-kahvalti-1", nameTR: "Smashed Avocado on Sourdough", nameEN: "Smashed Avocado on Sourdough", recipeId: "recipe-kahvalti-1", tags: ["avocado", "healthy", "vegetarian"] },
    { id: "menu-kahvalti-2", nameTR: "Southern Thai Roti Set", nameEN: "Southern Thai Roti Set", recipeId: "recipe-kahvalti-2", tags: ["thai", "local", "roti"] },
    { id: "menu-kahvalti-3", nameTR: "The Brook Big Breakfast", nameEN: "The Brook Big Breakfast", recipeId: "recipe-kahvalti-3", tags: ["english", "classic", "hearty"] },
    { id: "menu-kahvalti-4", nameTR: "Tropical Smoothie Bowl", nameEN: "Tropical Smoothie Bowl", recipeId: "recipe-kahvalti-4", tags: ["smoothie", "vegan", "healthy"] },
    { id: "menu-kahvalti-5", nameTR: "Royal Eggs Benedict", nameEN: "Royal Eggs Benedict", recipeId: "recipe-kahvalti-5", tags: ["eggs", "classic", "benedict"] },
    { id: "menu-kahvalti-6", nameTR: "American Pancake Stack", nameEN: "American Pancake Stack", recipeId: "recipe-kahvalti-6", tags: ["pancake", "american", "sweet"] },
    { id: "menu-kahvalti-7", nameTR: "Continental Breakfast", nameEN: "Continental Breakfast", recipeId: "recipe-kahvalti-7", tags: ["continental", "light", "classic"] },
  ];

  await seedCategoryData("cat-kahvalti", recipes, menuItems, simdi);
  console.log("  ✓ Kahvaltı (7 ürün)");
}

// ÇORBALAR
async function seedCorbalarRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-corba-1",
      heroImage: "/images/soups/tom-yum.jpg",
      description: "Büyük karidesler ve aromatik otlarla hazırlanan, süt ilavesiyle yumuşatılmış dünyaca ünlü acılı ve ekşili çorba.",
      ingredients: ["Karides", "Limon otu", "Galangal", "Kaffir lime yaprağı", "Acı biber", "Hindistan cevizi sütü", "Mantar", "Balık sosu"],
      steps: ["Suyu kaynatın, aromaları ekleyin", "Karidesleri ekleyin", "Hindistan cevizi sütü ekleyin", "Mantar ve baharatlarla tamamlayın"],
      pairings: ["Yasemin pilavı", "Thai bira"],
      chefNotes: "Karidesleri fazla pişirmeyin - yumuşak kalmalı.",
    },
    {
      id: "recipe-corba-2",
      heroImage: "/images/soups/tom-kha.jpg",
      description: "Hindistan cevizi sütü, galangal kökü ve tavuk parçalarıyla yapılan, yumuşak içimli ve aromatik beyaz çorba.",
      ingredients: ["Tavuk göğsü", "Hindistan cevizi sütü", "Galangal", "Limon otu", "Kaffir lime", "Mantar", "Kişniş"],
      steps: ["Hindistan cevizi sütünü kaynatın", "Tavuğu ekleyin", "Aromaları ve mantarı ekleyin", "Misket limonu suyu ile bitirin"],
      pairings: ["Pirinç", "Fried wontons"],
      chefNotes: "Galangal'ı ince dilimleyin - yenilebilir olmalı.",
    },
    {
      id: "recipe-corba-3",
      heroImage: "/images/soups/khao-tom.jpg",
      description: "Zencefil ve sarımsak aromalı tavuk suyunda pişmiş, yasemin pirinci ve köfte parçaları içeren geleneksel çorba.",
      ingredients: ["Yasemin pirinci", "Tavuk suyu", "Kıyma köftesi", "Zencefil", "Sarımsak", "Yeşil soğan", "Kişniş"],
      steps: ["Tavuk suyunu kaynatın", "Pirinci ekleyin ve pişirin", "Köfteleri ekleyin", "Zencefil ve sarımsakla tatlandırın"],
      pairings: ["Fried garlic", "Soya sosu"],
      chefNotes: "Pilavı aşırı pişirmeyin - yumuşak ama taneli olmalı.",
    },
    {
      id: "recipe-corba-4",
      heroImage: "/images/soups/pumpkin.jpg",
      description: "Fırınlanmış yerel bal kabaklarından yapılan, krema ve kıtır ekmekle servis edilen kadifemsi çorba.",
      ingredients: ["Balkabağı", "Soğan", "Sarımsak", "Sebze suyu", "Krema", "Taze kekik", "Karabiber"],
      steps: ["Balkabağını fırınlayın", "Soğan ve sarımsakla soteleyin", "Blenderdan geçirin", "Krema ile yumuşatın"],
      pairings: ["Kızarmış ekmek", "Beyaz şarap"],
      chefNotes: "Balkabağını karamelize edinceye kadar fırınlayın.",
    },
    {
      id: "recipe-corba-5",
      heroImage: "/images/soups/glass-noodle.jpg",
      description: "Berrak tavuk suyu içerisinde şeffaf erişte, sebzeler ve kıyma topları.",
      ingredients: ["Şeffaf erişte", "Tavuk suyu", "Kıyma topları", "Lahana", "Havuç", "Yeşil soğan", "Soya sosu"],
      steps: ["Tavuk suyunu kaynatın", "Erişteyikaynatın", "Sebze ve kıyma toplarını ekleyin", "Soya sosu ile tatlandırın"],
      pairings: ["Kızartılmış sarımsak", "Chili oil"],
      chefNotes: "Erişteyisade ısıtmak yeterli - çok pişmesin.",
    },
  ];

  const menuItems = [
    { id: "menu-corba-1", nameTR: "Tom Yum Goong (Creamy)", nameEN: "Tom Yum Goong (Creamy)", recipeId: "recipe-corba-1", tags: ["thai", "spicy", "soup", "shrimp"] },
    { id: "menu-corba-2", nameTR: "Tom Kha Gai", nameEN: "Tom Kha Gai", recipeId: "recipe-corba-2", tags: ["thai", "coconut", "soup", "chicken"] },
    { id: "menu-corba-3", nameTR: "Khao Tom (Rice Soup)", nameEN: "Khao Tom (Rice Soup)", recipeId: "recipe-corba-3", tags: ["rice", "soup", "comfort"] },
    { id: "menu-corba-4", nameTR: "Roasted Pumpkin Soup", nameEN: "Roasted Pumpkin Soup", recipeId: "recipe-corba-4", tags: ["pumpkin", "creamy", "vegetarian"] },
    { id: "menu-corba-5", nameTR: "Clear Glass Noodle Soup", nameEN: "Clear Glass Noodle Soup", recipeId: "recipe-corba-5", tags: ["noodle", "clear", "light"] },
  ];

  await seedCategoryData("cat-corbalar", recipes, menuItems, simdi);
  console.log("  ✓ Çorbalar (5 ürün)");
}

// BAŞLANGIÇLAR
async function seedBaslangiclarRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-baslangic-1",
      heroImage: "/images/starters/goong-sarong.jpg",
      description: "İnce pirinç eriştesine sarılarak altın sarısı kızartılmış, erik soslu çıtır kaplan karidesler (Phuket spesiyali).",
      ingredients: ["Kaplan karidesleri", "Pirinç eriştesi", "Erik sosu", "Kızartma yağı"],
      steps: ["Karidesleri temizleyin", "Pirinç eriştesine sarın", "Derin yağda kızartın", "Erik sosu ile servis edin"],
      pairings: ["Thai sweet chili sauce", "Soğuk bira"],
      chefNotes: "Yağın sıcaklığı çok önemli - 180°C ideal.",
    },
    {
      id: "recipe-baslangic-2",
      heroImage: "/images/starters/salt-pepper-squid.jpg",
      description: "Taze karabiber, deniz tuzu ve taze soğanla wok tavada sotelenmiş çıtır kalamar parçaları.",
      ingredients: ["Kalamar", "Deniz tuzu", "Taze karabiber", "Soğan", "Yeşil biber", "Sarımsak"],
      steps: ["Kalamarı halkalar halinde kesin", "Unla karıştırıp kızartın", "Wok'ta baharatlarla soteleyin", "Soğan ve biberle servis edin"],
      pairings: ["Limon dilimleri", "Soğuk içecek"],
      chefNotes: "Kalamarı çok kısa süre pişirin - yoksa sert olur.",
    },
    {
      id: "recipe-baslangic-3",
      heroImage: "/images/starters/satay.jpg",
      description: "Zerdeçallı özel marinasyonla ızgara edilmiş tavuk ve domuz şişleri, yanında fıstık sosu ile.",
      ingredients: ["Tavuk", "Domuz", "Zerdeçal", "Limon otu", "Hindistan cevizi sütü", "Fıstık ezmesi", "Soya sosu"],
      steps: ["Etleri marine edin", "Şişlere dizin", "Izgara yapın", "Fıstık sosu ile servis edin"],
      pairings: ["Cucumber relish", "Thai bira"],
      chefNotes: "Marinasyon en az 2 saat olmalı.",
    },
    {
      id: "recipe-baslangic-4",
      heroImage: "/images/starters/combo-platter.jpg",
      description: "Tavuk kanat, soğan halkası, sigara böreği ve kalamar tavadan oluşan zengin atıştırma tabağı.",
      ingredients: ["Tavuk kanat", "Soğan", "Yufka", "Kalamar", "Kızartma malzemesi"],
      steps: ["Her bileşeni ayrı hazırlayın", "Kızartın", "Tabağa yerleştirin", "Çeşitli soslarla servis edin"],
      pairings: ["Ranch sos", "BBQ sos", "Sweet chili"],
      chefNotes: "Tüm bileşenleri aynı anda sıcak servis edin.",
    },
    {
      id: "recipe-baslangic-5",
      heroImage: "/images/starters/nachos.jpg",
      description: "Baharatlı kıyma, erimiş peynir, salsa ve jalapeno ile fırınlanmış mısır cipsi şöleni.",
      ingredients: ["Tortilla cipsi", "Kıyma", "Cheddar peyniri", "Salsa", "Jalapeno", "Ekşi krema"],
      steps: ["Kıymayı baharatla pişirin", "Cipsleri tabağa yerleştirin", "Kıyma ve peynir ekleyin", "Fırınlayın ve soslarla servis edin"],
      pairings: ["Guacamole", "Margarita"],
      chefNotes: "Peynir tamamen eriyene kadar fırınlayın.",
    },
  ];

  const menuItems = [
    { id: "menu-baslangic-1", nameTR: "Goong Sarong (Signature)", nameEN: "Goong Sarong (Signature)", recipeId: "recipe-baslangic-1", tags: ["shrimp", "fried", "signature", "phuket"] },
    { id: "menu-baslangic-2", nameTR: "Salt & Pepper Squid", nameEN: "Salt & Pepper Squid", recipeId: "recipe-baslangic-2", tags: ["squid", "wok", "crispy"] },
    { id: "menu-baslangic-3", nameTR: "Satay Mix", nameEN: "Satay Mix", recipeId: "recipe-baslangic-3", tags: ["satay", "grilled", "peanut"] },
    { id: "menu-baslangic-4", nameTR: "The Brook's Combo Platter", nameEN: "The Brook's Combo Platter", recipeId: "recipe-baslangic-4", tags: ["combo", "fried", "sharing"] },
    { id: "menu-baslangic-5", nameTR: "Loaded Nachos", nameEN: "Loaded Nachos", recipeId: "recipe-baslangic-5", tags: ["nachos", "cheese", "tex-mex"] },
  ];

  await seedCategoryData("cat-baslangiclar", recipes, menuItems, simdi);
  console.log("  ✓ Başlangıçlar (5 ürün)");
}

// SALATALAR
async function seedSalatalarRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-salata-1",
      heroImage: "/images/salads/yam-talay.jpg",
      description: "Karides, kalamar ve midyenin kereviz sapı, soğan ve acı-ekşi sosla harmanlandığı sıcak salata.",
      ingredients: ["Karides", "Kalamar", "Midye", "Kereviz sapı", "Soğan", "Misket limonu", "Acı biber", "Kişniş"],
      steps: ["Deniz ürünlerini haşlayın", "Sebzeleri doğrayın", "Acı-ekşi sos hazırlayın", "Tümünü karıştırıp servis edin"],
      pairings: ["Yasemin pilavı", "Thai bira"],
      chefNotes: "Deniz ürünlerini fazla pişirmeyin.",
    },
    {
      id: "recipe-salata-2",
      heroImage: "/images/salads/som-tum.jpg",
      description: "Yeşil papaya rendesi, domates ve fıstığın havan'da dövülerek hazırlandığı meşhur Tayland salatası.",
      ingredients: ["Yeşil papaya", "Cherry domates", "Fıstık", "Uzun fasulye", "Sarımsak", "Acı biber", "Palm şekeri", "Balık sosu"],
      steps: ["Papayayıjüliyen doğrayın", "Havanda sarımsak ve biber dövün", "Domates ve fasulye ekleyin", "Papaya ve fıstık ekleyip karıştırın"],
      pairings: ["Sticky rice", "Grilled chicken"],
      chefNotes: "Havanda dövmek geleneksel metot - daha lezzetli.",
    },
    {
      id: "recipe-salata-3",
      heroImage: "/images/salads/salmon-salad.jpg",
      description: "Sashimi kalitesinde çiğ somon küplerinin misket limonu, sarımsak ve nane sosuyla marine edildiği tabak.",
      ingredients: ["Taze somon", "Misket limonu", "Nane", "Kişniş", "Sarımsak", "Acı biber", "Balık sosu"],
      steps: ["Somonu küp küp doğrayın", "Sos hazırlayın", "Somonu sosla marine edin", "Taze otlarla süsleyin"],
      pairings: ["White wine", "Wasabi"],
      chefNotes: "Somon sashimi grade olmalı - çok taze.",
    },
    {
      id: "recipe-salata-4",
      heroImage: "/images/salads/caesar.jpg",
      description: "Romaine marulu, ızgara tavuk, parmesan, bacon ve krutonların orijinal ançuezli sosla buluşması.",
      ingredients: ["Romaine marul", "Izgara tavuk", "Parmesan", "Bacon", "Kruton", "Ançuez", "Yumurta sarısı", "Zeytinyağı"],
      steps: ["Caesar sos hazırlayın", "Tavuğu ızgara yapın", "Marulu yıkayın", "Tüm malzemeleri karıştırın"],
      pairings: ["Beyaz şarap", "Limonata"],
      chefNotes: "Sosu tam öncesinde hazırlayın - taze olmalı.",
    },
  ];

  const menuItems = [
    { id: "menu-salata-1", nameTR: "Spicy Seafood Salad (Yam Talay)", nameEN: "Spicy Seafood Salad (Yam Talay)", recipeId: "recipe-salata-1", tags: ["seafood", "spicy", "thai"] },
    { id: "menu-salata-2", nameTR: "Som Tum Thai", nameEN: "Som Tum Thai", recipeId: "recipe-salata-2", tags: ["papaya", "thai", "spicy"] },
    { id: "menu-salata-3", nameTR: "Thai Salmon Salad", nameEN: "Thai Salmon Salad", recipeId: "recipe-salata-3", tags: ["salmon", "raw", "thai"] },
    { id: "menu-salata-4", nameTR: "Classic Caesar Salad", nameEN: "Classic Caesar Salad", recipeId: "recipe-salata-4", tags: ["caesar", "chicken", "classic"] },
  ];

  await seedCategoryData("cat-salatalar", recipes, menuItems, simdi);
  console.log("  ✓ Salatalar (4 ürün)");
}

// PHUKET İMZA YEMEKLERİ
async function seedPhuketImzaRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-phuket-1",
      heroImage: "/images/phuket/crispy-pork-curry.jpg",
      description: "Wok tavada kırmızı köri macunu ve taze fasulye ile sotelenmiş çıtır domuz göbeği.",
      ingredients: ["Domuz göbeği", "Kırmızı köri macunu", "Taze fasulye", "Kaffir lime", "Thai fesleğeni", "Palm şekeri"],
      steps: ["Domuz göbeğini kızartın", "Köri macununu soteleyin", "Fasulyeleri ekleyin", "Çıtır domuzu ekleyin ve karıştırın"],
      pairings: ["Yasemin pilavı", "Thai bira"],
      chefNotes: "Domuz çok çıtır olmalı - derisini iyi kurulayın.",
    },
    {
      id: "recipe-phuket-2",
      heroImage: "/images/phuket/crab-curry.jpg",
      description: "Taze yengeç eti ve betel yapraklarıyla hazırlanan, yanında pirinç eriştesiyle sunulan Chalong spesiyali sarı köri.",
      ingredients: ["Yengeç", "Sarı köri macunu", "Betel yaprakları", "Hindistan cevizi sütü", "Pirinç eriştesi", "Yumurta"],
      steps: ["Yengeç etini çıkarın", "Köri sosunu hazırlayın", "Yengeç ve betel ekleyin", "Pirinç eriştesiyle servis edin"],
      pairings: ["Taze sebzeler", "Thai whiskey"],
      chefNotes: "Yengeç çok taze olmalı - aynı gün.",
    },
    {
      id: "recipe-phuket-3",
      heroImage: "/images/phuket/mee-hokkien.jpg",
      description: "Sarı yumurtalı kalın eriştenin deniz ürünleri ve yumurta ile wok tavada sulu kıvamda sotelendiği yerel lezzet.",
      ingredients: ["Hokkien eriştesi", "Karides", "Kalamar", "Yumurta", "Lahana", "Soya sosu", "Istiridye sosu"],
      steps: ["Erişteyihaşlayın", "Deniz ürünlerini soteleyin", "Erişteve sosları ekleyin", "Yumurta ekleyip karıştırın"],
      pairings: ["Pickled chili", "Thai bira"],
      chefNotes: "Wok çok sıcak olmalı - yüksek ateş önemli.",
    },
    {
      id: "recipe-phuket-4",
      heroImage: "/images/phuket/massaman-chicken.jpg",
      description: "Patates, soğan ve fıstık ile pişmiş yumuşak tavuk butları.",
      ingredients: ["Tavuk butu", "Massaman köri macunu", "Patates", "Soğan", "Fıstık", "Hindistan cevizi sütü", "Tamarind"],
      steps: ["Tavuğu marine edin", "Köri sosunu hazırlayın", "Patates ve soğan ekleyin", "Düşük ateşte pişirin"],
      pairings: ["Roti", "Thai bira"],
      chefNotes: "Uzun süre pişirin - tavuk çok yumuşak olmalı.",
    },
    {
      id: "recipe-phuket-5",
      heroImage: "/images/phuket/duck-curry.jpg",
      description: "Fırınlanmış ördek göğsü, ananas ve üzüm tanelerinin kırmızı köri sosundaki egzotik uyumu.",
      ingredients: ["Ördek göğsü", "Kırmızı köri macunu", "Ananas", "Üzüm", "Hindistan cevizi sütü", "Thai fesleğeni"],
      steps: ["Ördeği fırınlayın", "Köri sosunu hazırlayın", "Ananas ve üzüm ekleyin", "Ördek dilimlerini ekleyin"],
      pairings: ["Yasemin pilavı", "Red wine"],
      chefNotes: "Ördek orta pişmiş olmalı - pembe kalabilir.",
    },
    {
      id: "recipe-phuket-6",
      heroImage: "/images/phuket/beef-red-curry.jpg",
      description: "Tender slices of beef simmered in red curry with bamboo shoots, Thai eggplant, and sweet basil.",
      ingredients: ["Sığır eti", "Kırmızı köri macunu", "Bambu filizi", "Thai patlıcanı", "Thai fesleğeni", "Kırmızı biber", "Balık sosu"],
      steps: ["Eti dilimleyin", "Köri macununu soteleyin", "Bambu ve patlıcanı ekleyin", "Eti ekleyip pişirin"],
      pairings: ["Yasemin pilavı", "Thai bira"],
      chefNotes: "Bambu filizi çok önemli - otantik tat için şart.",
    },
    {
      id: "recipe-phuket-7",
      heroImage: "/images/phuket/pineapple-prawn-curry.jpg",
      description: "Phuket style red curry with prawns and fresh pineapple.",
      ingredients: ["Karides", "Kırmızı köri macunu", "Taze ananas", "Hindistan cevizi sütü", "Thai fesleğeni", "Kaffir lime"],
      steps: ["Karidesleri temizleyin", "Köri sosunu hazırlayın", "Ananası ekleyin", "Karidesleri son anda ekleyin"],
      pairings: ["Yasemin pilavı", "White wine"],
      chefNotes: "Ananas asidi deniz ürünü kokusunu nötrler.",
    },
    {
      id: "recipe-phuket-8",
      heroImage: "/images/phuket/seafood-red-curry.jpg",
      description: "Mixed seafood in rich red curry sauce with kaffir lime leaves and basil.",
      ingredients: ["Karışık deniz ürünleri", "Kırmızı köri macunu", "Kaffir lime yaprağı", "Thai fesleğeni", "Uzun fasulye", "Hindistan cevizi sütü"],
      steps: ["Köri sosunu hazırlayın", "Deniz ürünlerini ekleyin", "Kaffir lime ve fesleğen ekleyin", "Kısa süre pişirin"],
      pairings: ["Yasemin pilavı", "Thai bira"],
      chefNotes: "Deniz ürünlerini fazla pişirmeyin - sert olur.",
    },
    {
      id: "recipe-phuket-9",
      heroImage: "/images/phuket/pad-krapao-wagyu.jpg",
      description: "Wagyu etinin taze fesleğen ve acı biberle wok tavada sotelenip, üzerine sahanda yumurta konulduğu premium sokak lezzeti.",
      ingredients: ["Wagyu dana", "Thai fesleğeni", "Acı biber", "Sarımsak", "Soya sosu", "Istiridye sosu", "Sahanda yumurta"],
      steps: ["Wok'u çok ısıtın", "Sarımsak ve biberi soteleyin", "Wagyu'yu ekleyin", "Fesleğen ekleyin", "Sahanda yumurta ile servis edin"],
      pairings: ["Yasemin pilavı", "Thai bira"],
      chefNotes: "Wok çok sıcak olmalı - hızlı pişirme önemli.",
    },
  ];

  const menuItems = [
    { id: "menu-phuket-1", nameTR: "Crispy Pork Red Curry", nameEN: "Pad Prik Gaeng Moo Krob", recipeId: "recipe-phuket-1", tags: ["pork", "curry", "crispy", "signature"] },
    { id: "menu-phuket-2", nameTR: "Gaeng Poo (Crab Curry)", nameEN: "Gaeng Poo (Crab Curry)", recipeId: "recipe-phuket-2", tags: ["crab", "curry", "chalong", "signature"] },
    { id: "menu-phuket-3", nameTR: "Mee Hokkien", nameEN: "Mee Hokkien", recipeId: "recipe-phuket-3", tags: ["noodles", "seafood", "wok"] },
    { id: "menu-phuket-4", nameTR: "Massaman Curry Chicken", nameEN: "Massaman Curry Chicken", recipeId: "recipe-phuket-4", tags: ["chicken", "massaman", "curry"] },
    { id: "menu-phuket-5", nameTR: "Duck Red Curry", nameEN: "Duck Red Curry", recipeId: "recipe-phuket-5", tags: ["duck", "curry", "pineapple"] },
    { id: "menu-phuket-6", nameTR: "Gaeng Phed Nua (Beef Red Curry)", nameEN: "Gaeng Phed Nua", recipeId: "recipe-phuket-6", tags: ["beef", "curry", "bamboo"] },
    { id: "menu-phuket-7", nameTR: "Gaeng Kua Sapparot Goong", nameEN: "Pineapple Prawn Curry", recipeId: "recipe-phuket-7", tags: ["prawn", "curry", "pineapple", "signature"] },
    { id: "menu-phuket-8", nameTR: "Gaeng Phed Talay", nameEN: "Seafood Red Curry", recipeId: "recipe-phuket-8", tags: ["seafood", "curry", "mixed"] },
    { id: "menu-phuket-9", nameTR: "Pad Kra Pao Wagyu", nameEN: "Pad Kra Pao Wagyu", recipeId: "recipe-phuket-9", tags: ["wagyu", "basil", "premium", "signature"] },
  ];

  await seedCategoryData("cat-phuket-imza", recipes, menuItems, simdi);
  console.log("  ✓ Phuket İmza Yemekleri (9 ürün)");
}

// DENİZ ÜRÜNLERİ
async function seedDenizUrunleriRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-deniz-1",
      heroImage: "/images/seafood/fried-seabass.jpg",
      description: "Kelebek şeklinde açılıp kızartılmış bütün levreğin, karamelize balık sosu ve mango salatasıyla sunumu.",
      ingredients: ["Levrek", "Balık sosu", "Palm şekeri", "Mango", "Soğan", "Kişniş", "Acı biber"],
      steps: ["Levreği kelebek açın", "Derin yağda kızartın", "Balık sosunu karamelize edin", "Mango salatası hazırlayın", "Servis edin"],
      pairings: ["Yasemin pilavı", "Thai bira"],
      chefNotes: "Yağ çok sıcak olmalı - çıtır kabuk için.",
    },
    {
      id: "recipe-deniz-2",
      heroImage: "/images/seafood/steamed-seabass.jpg",
      description: "Buharda pişmiş bütün levreğin, sarımsak, acı biber ve misket limonu suyu sosuyla sıcak servis edildiği sağlıklı seçenek.",
      ingredients: ["Levrek", "Sarımsak", "Acı biber", "Misket limonu", "Soya sosu", "Zencefil", "Kişniş"],
      steps: ["Levreği temizleyin", "Buharda pişirin", "Sıcak sos hazırlayın", "Sosu balığın üzerine dökün"],
      pairings: ["Yasemin pilavı", "Beyaz şarap"],
      chefNotes: "Buhar çok sıcak olmalı - hızlı pişirme.",
    },
    {
      id: "recipe-deniz-3",
      heroImage: "/images/seafood/grilled-prawns.jpg",
      description: "Sarımsaklı tereyağı veya Thermidor sos seçeneğiyle sunulan, ızgara dev kaplan karidesleri.",
      ingredients: ["Kaplan karidesleri", "Sarımsak", "Tereyağı", "Maydanoz", "Limon", "Thermidor sos (opsiyonel)"],
      steps: ["Karidesleri temizleyin", "Marine edin", "Izgara yapın", "Sarımsaklı tereyağı ile servis edin"],
      pairings: ["Beyaz şarap", "Limon dilimleri"],
      chefNotes: "Karidesleri fazla pişirmeyin - yumuşak kalmalı.",
    },
  ];

  const menuItems = [
    { id: "menu-deniz-1", nameTR: "Fried Sea Bass (Tod Nam Pla)", nameEN: "Fried Sea Bass (Tod Nam Pla)", recipeId: "recipe-deniz-1", tags: ["seabass", "fried", "mango"] },
    { id: "menu-deniz-2", nameTR: "Steamed Sea Bass (Lime Sauce)", nameEN: "Steamed Sea Bass (Lime Sauce)", recipeId: "recipe-deniz-2", tags: ["seabass", "steamed", "healthy"] },
    { id: "menu-deniz-3", nameTR: "Grilled Tiger Prawns", nameEN: "Grilled Tiger Prawns", recipeId: "recipe-deniz-3", tags: ["prawns", "grilled", "garlic"] },
  ];

  await seedCategoryData("cat-deniz-urunleri", recipes, menuItems, simdi);
  console.log("  ✓ Deniz Ürünleri (3 ürün)");
}

// BATI ANA YEMEKLERİ
async function seedBatiAnaYemekleriRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-bati-1",
      heroImage: "/images/western/ribeye.jpg",
      description: "Mevsim sebzeleri ve patates kızartması eşliğinde sunulan, ızgara edilmiş 250 gramlık Avustralya antrikot.",
      ingredients: ["Ribeye steak (250g)", "Mevsim sebzeleri", "Patates", "Tereyağı", "Tuz", "Karabiber"],
      steps: ["Eti oda sıcaklığına getirin", "Izgara yapın", "Dinlendirin", "Sebze ve patatesle servis edin"],
      pairings: ["Red wine", "Pepper sauce"],
      chefNotes: "Et dinlendirilmeli - suyunu korumalı.",
    },
    {
      id: "recipe-bati-2",
      heroImage: "/images/western/surf-turf.jpg",
      description: "Izgara antrikot ve dev kaplan karideslerin aynı tabakta buluştuğu zengin ana yemek.",
      ingredients: ["Antrikot", "Kaplan karidesleri", "Sarımsaklı tereyağı", "Sebzeler", "Patates"],
      steps: ["Antrikotu ızgara yapın", "Karidesleri ızgara yapın", "Sarımsaklı tereyağı ile servis edin"],
      pairings: ["Red wine", "Beyaz şarap"],
      chefNotes: "Her iki proteini de aynı anda hazırlayın.",
    },
    {
      id: "recipe-bati-3",
      heroImage: "/images/western/pork-chop.jpg",
      description: "Kemikli domuz pirzola, elma püresi veya mantar sos ve patates püresi ile.",
      ingredients: ["Domuz pirzola", "Elma", "Mantar", "Patates", "Krema", "Taze kekik"],
      steps: ["Pirzolayı marine edin", "Izgara yapın", "Elma püresi veya mantar sos hazırlayın", "Patates püresi ile servis edin"],
      pairings: ["Apple cider", "White wine"],
      chefNotes: "Pirzola orta pişmiş olmalı - yumuşak.",
    },
    {
      id: "recipe-bati-4",
      heroImage: "/images/western/cordon-bleu.jpg",
      description: "Jambon ve peynir dolgulu, panelenerek kızartılmış tavuk göğsü, yanında patates püresi ile.",
      ingredients: ["Tavuk göğsü", "Jambon", "Swiss peyniri", "Galeta unu", "Yumurta", "Un"],
      steps: ["Tavuğu açıp inceletin", "Jambon ve peynir yerleştirin", "Rulo yapın", "Panele edip kızartın"],
      pairings: ["Beyaz şarap", "Dijon sos"],
      chefNotes: "Tavuk tamamen pişmiş olmalı.",
    },
    {
      id: "recipe-bati-5",
      heroImage: "/images/western/grilled-salmon.jpg",
      description: "Limonlu tereyağı sosu, kuşkonmaz ve trüflü patates püresi eşliğinde ızgara somon fileto.",
      ingredients: ["Somon fileto", "Limon", "Tereyağı", "Kuşkonmaz", "Patates", "Trüf yağı"],
      steps: ["Somonu ızgara yapın", "Limonlu tereyağı sos hazırlayın", "Kuşkonmaz soteleyin", "Trüflü püre ile servis edin"],
      pairings: ["White wine", "Champagne"],
      chefNotes: "Somon orta pişmiş olmalı - içi pembe.",
    },
    {
      id: "recipe-bati-6",
      heroImage: "/images/western/fish-chips.jpg",
      description: "Tempura hamuruyla kaplanıp kızartılmış yerel balık fileto, patates kızartması ve tartar sos.",
      ingredients: ["Balık fileto", "Tempura hamuru", "Patates", "Tartar sos", "Limon"],
      steps: ["Balığı tempura hamuruyla kaplayın", "Kızartın", "Patates kızartması hazırlayın", "Tartar sos ile servis edin"],
      pairings: ["Beer", "Limonata"],
      chefNotes: "Hamur çok çıtır olmalı - soğuk hamur kullanın.",
    },
  ];

  const menuItems = [
    { id: "menu-bati-1", nameTR: "Australian Ribeye Steak", nameEN: "Australian Ribeye Steak", recipeId: "recipe-bati-1", tags: ["beef", "steak", "grilled"] },
    { id: "menu-bati-2", nameTR: "Surf & Turf", nameEN: "Surf & Turf", recipeId: "recipe-bati-2", tags: ["steak", "prawns", "premium"] },
    { id: "menu-bati-3", nameTR: "Grilled Pork Chop", nameEN: "Grilled Pork Chop", recipeId: "recipe-bati-3", tags: ["pork", "grilled", "apple"] },
    { id: "menu-bati-4", nameTR: "Chicken Cordon Bleu", nameEN: "Chicken Cordon Bleu", recipeId: "recipe-bati-4", tags: ["chicken", "fried", "cheese"] },
    { id: "menu-bati-5", nameTR: "Grilled Salmon Fillet", nameEN: "Grilled Salmon Fillet", recipeId: "recipe-bati-5", tags: ["salmon", "grilled", "truffle"] },
    { id: "menu-bati-6", nameTR: "Fish & Chips", nameEN: "Fish & Chips", recipeId: "recipe-bati-6", tags: ["fish", "fried", "classic"] },
  ];

  await seedCategoryData("cat-bati-anayemekleri", recipes, menuItems, simdi);
  console.log("  ✓ Batı Ana Yemekleri (6 ürün)");
}

// COMFORT FOOD
async function seedComfortFoodRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-comfort-1",
      heroImage: "/images/comfort/burger.jpg",
      description: "Pancar turşusu, ızgara ananas, yumurta ve bacon ile hazırlanan Chalong favorisi ev yapımı burger.",
      ingredients: ["Dana kıyma", "Burger ekmeği", "Pancar turşusu", "Ananas", "Yumurta", "Bacon", "Cheddar", "Marul"],
      steps: ["Köfteyi şekillendirin", "Izgara yapın", "Ekmeği kızartın", "Tüm malzemeleri birleştirin"],
      pairings: ["Beer", "Milkshake"],
      chefNotes: "Köfte %80/20 yağ oranında olmalı.",
    },
    {
      id: "recipe-comfort-2",
      heroImage: "/images/comfort/club-sandwich.jpg",
      description: "Izgara tavuk, bacon, yumurta ve peynirle hazırlanan üç katlı klasik tost sandviç.",
      ingredients: ["Tost ekmeği", "Izgara tavuk", "Bacon", "Yumurta", "Marul", "Domates", "Mayonez"],
      steps: ["Ekmeği kızartın", "Tavuk ve bacon'ı hazırlayın", "Katmanları oluşturun", "Üçgen kesin"],
      pairings: ["Patates cipsi", "Lemonade"],
      chefNotes: "Ekmeği hafifçe kızartın - çok sert olmasın.",
    },
  ];

  const menuItems = [
    { id: "menu-comfort-1", nameTR: "Aussie Beef Burger", nameEN: "Aussie Beef Burger", recipeId: "recipe-comfort-1", tags: ["burger", "beef", "aussie"] },
    { id: "menu-comfort-2", nameTR: "Brook Club Sandwich", nameEN: "Brook Club Sandwich", recipeId: "recipe-comfort-2", tags: ["sandwich", "chicken", "club"] },
  ];

  await seedCategoryData("cat-comfort-food", recipes, menuItems, simdi);
  console.log("  ✓ Comfort Food (2 ürün)");
}

// MAKARNALAR
async function seedMakarnalarRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-makarna-1",
      heroImage: "/images/pasta/pineapple-rice.jpg",
      description: "Yarım ananas içerisinde sunulan karidesli, körili, fıstıklı ve kuru üzümlü görsel şölen.",
      ingredients: ["Pilav", "Karides", "Ananas", "Köri tozu", "Fıstık", "Kuru üzüm", "Yeşil soğan"],
      steps: ["Pilavı pişirin", "Karidesleri soteleyin", "Köri ve malzemeleri ekleyin", "Ananas içinde servis edin"],
      pairings: ["Thai bira", "White wine"],
      chefNotes: "Ananası boşaltırken dikkatli olun.",
    },
    {
      id: "recipe-makarna-2",
      heroImage: "/images/pasta/truffle-pasta.jpg",
      description: "Trüf yağı, porçini mantarı ve krema soslu Fettuccine veya Penne.",
      ingredients: ["Fettuccine", "Porçini mantarı", "Krema", "Trüf yağı", "Parmesan", "Sarımsak"],
      steps: ["Makarnayı haşlayın", "Mantarları soteleyin", "Krema ekleyin", "Trüf yağı ile bitirin"],
      pairings: ["White wine", "Parmesan"],
      chefNotes: "Trüf yağını son anda ekleyin - aromasını korur.",
    },
    {
      id: "recipe-makarna-3",
      heroImage: "/images/pasta/carbonara.jpg",
      description: "Bacon, yumurta sarısı, karabiber ve parmesan peyniriyle hazırlanan orijinal Roma usulü makarna.",
      ingredients: ["Spaghetti", "Guanciale/Bacon", "Yumurta sarısı", "Parmesan", "Karabiber"],
      steps: ["Makarnayı haşlayın", "Bacon'ı kızartın", "Yumurta ve peynir karışımı hazırlayın", "Tümünü birleştirin"],
      pairings: ["White wine", "Garlic bread"],
      chefNotes: "Yumurta pişmemeli - kremamsı olmalı.",
    },
    {
      id: "recipe-makarna-4",
      heroImage: "/images/pasta/seafood-spaghetti.jpg",
      description: "Zeytinyağı, sarımsak, acı biber ve taze deniz ürünleriyle sotelenmiş spagetti.",
      ingredients: ["Spaghetti", "Karides", "Kalamar", "Midye", "Sarımsak", "Acı biber", "Beyaz şarap"],
      steps: ["Makarnayı haşlayın", "Deniz ürünlerini soteleyin", "Makarnayı ekleyin", "Beyaz şarap ile deglaze edin"],
      pairings: ["White wine", "Garlic bread"],
      chefNotes: "Deniz ürünlerini fazla pişirmeyin.",
    },
  ];

  const menuItems = [
    { id: "menu-makarna-1", nameTR: "Pineapple Fried Rice", nameEN: "Pineapple Fried Rice", recipeId: "recipe-makarna-1", tags: ["rice", "pineapple", "curry", "shrimp"] },
    { id: "menu-makarna-2", nameTR: "Creamy Truffle Mushroom Pasta", nameEN: "Creamy Truffle Mushroom Pasta", recipeId: "recipe-makarna-2", tags: ["pasta", "truffle", "mushroom"] },
    { id: "menu-makarna-3", nameTR: "Spaghetti Carbonara", nameEN: "Spaghetti Carbonara", recipeId: "recipe-makarna-3", tags: ["pasta", "carbonara", "classic"] },
    { id: "menu-makarna-4", nameTR: "Spicy Seafood Spaghetti", nameEN: "Spicy Seafood Spaghetti", recipeId: "recipe-makarna-4", tags: ["pasta", "seafood", "spicy"] },
  ];

  await seedCategoryData("cat-makarnalar", recipes, menuItems, simdi);
  console.log("  ✓ Makarnalar (4 ürün)");
}

// TATLILAR
async function seedTatlilarRecipes(simdi: number) {
  const recipes = [
    {
      id: "recipe-tatli-1",
      heroImage: "/images/desserts/oh-aew.jpg",
      description: "Muz jölesi, kırmızı fasulye ve şuruplu buz rendesinden oluşan sadece Phuket'e özgü serinletici tatlı.",
      ingredients: ["Buz rendesi", "Muz jölesi", "Kırmızı fasulye", "Palm şekeri şurubu", "Hindistan cevizi sütü"],
      steps: ["Buzu rendeleyin", "Malzemeleri yerleştirin", "Şurup ve hindistan cevizi sütü dökün"],
      pairings: ["Thai çayı"],
      chefNotes: "Çok soğuk servis edin.",
    },
    {
      id: "recipe-tatli-2",
      heroImage: "/images/desserts/mango-sticky-rice.jpg",
      description: "Taze sarı mango dilimleri ve tatlı hindistan cevizi sütüyle pişmiş yapışkan pirinç.",
      ingredients: ["Sticky rice", "Taze mango", "Hindistan cevizi sütü", "Şeker", "Tuz"],
      steps: ["Pirinçleri ıslatın", "Pişirin", "Hindistan cevizi sütü ile karıştırın", "Mango ile servis edin"],
      pairings: ["Thai çayı"],
      chefNotes: "Mango çok olgun ve tatlı olmalı.",
    },
    {
      id: "recipe-tatli-3",
      heroImage: "/images/desserts/coconut-icecream.jpg",
      description: "Hindistan cevizi kabuğu içinde, fıstık ve jöle parçalarıyla sunulan ev yapımı dondurma.",
      ingredients: ["Hindistan cevizi sütü", "Şeker", "Fıstık", "Jöle", "Mısır taneleri"],
      steps: ["Dondurma karışımı hazırlayın", "Dondurucuda bekletin", "Hindistan cevizi kabuğunda servis edin"],
      pairings: ["Wafer"],
      chefNotes: "Taze hindistan cevizi kullanın.",
    },
    {
      id: "recipe-tatli-4",
      heroImage: "/images/desserts/brownie.jpg",
      description: "Sıcak servis edilen çikolatalı brownie ve yanında bir top vanilyalı dondurma.",
      ingredients: ["Çikolata", "Tereyağı", "Şeker", "Yumurta", "Un", "Vanilya dondurması"],
      steps: ["Brownie hamuru hazırlayın", "Fırınlayın", "Sıcak servis edin", "Dondurma ile birleştirin"],
      pairings: ["Espresso", "Süt"],
      chefNotes: "Brownie içi ıslak kalmalı.",
    },
    {
      id: "recipe-tatli-5",
      heroImage: "/images/desserts/banana-boat.jpg",
      description: "Kabuğuyla ızgara edilmiş muz, ortası yarılıp içine eritilmiş çikolata ve fıstık parçaları, yanında dondurma ile.",
      ingredients: ["Muz", "Çikolata parçaları", "Fıstık", "Vanilya dondurması", "Bal"],
      steps: ["Muzun ortasını kesin", "Çikolata ve fıstık yerleştirin", "Izgara yapın", "Dondurma ile servis edin"],
      pairings: ["Vanilla ice cream"],
      chefNotes: "Muz yumuşak ama formunu korumalı.",
    },
  ];

  const menuItems = [
    { id: "menu-tatli-1", nameTR: "Oh Aew (Phuket Shaved Ice)", nameEN: "Oh Aew (Phuket Shaved Ice)", recipeId: "recipe-tatli-1", tags: ["ice", "phuket", "local", "dessert"] },
    { id: "menu-tatli-2", nameTR: "Mango Sticky Rice", nameEN: "Mango Sticky Rice", recipeId: "recipe-tatli-2", tags: ["mango", "thai", "dessert"] },
    { id: "menu-tatli-3", nameTR: "Coconut Ice Cream", nameEN: "Coconut Ice Cream", recipeId: "recipe-tatli-3", tags: ["coconut", "ice-cream", "dessert"] },
    { id: "menu-tatli-4", nameTR: "Warm Brownie", nameEN: "Warm Brownie", recipeId: "recipe-tatli-4", tags: ["chocolate", "brownie", "dessert"] },
    { id: "menu-tatli-5", nameTR: "Grilled Banana Boat", nameEN: "Grilled Banana Boat", recipeId: "recipe-tatli-5", tags: ["banana", "grilled", "dessert"] },
  ];

  await seedCategoryData("cat-tatlilar", recipes, menuItems, simdi);
  console.log("  ✓ Tatlılar (5 ürün)");
}

// HELPER FUNCTION
async function seedCategoryData(categoryId: string, recipes: any[], menuItems: any[], simdi: number) {
  // Recipes
  const recipePatches = recipes.map((r) => ({
    type: "ADD_RECIPE",
    payload: r,
  }));
  const recipeCs = createChangeSet(recipePatches);
  recipeCs.status = "approved";
  recipeCs.approvedAt = simdi;
  recipeCs.approvedBy = "seed-full";
  await applyChangeSet(recipeCs);

  // Menu Items
  const menuItemPatches = menuItems.map((m) => ({
    type: "ADD_MENU_ITEM",
    payload: {
      ...m,
      templateId: "food_detail_v1",
      categoryId,
      available: true,
    },
  }));
  const menuItemCs = createChangeSet(menuItemPatches);
  menuItemCs.status = "approved";
  menuItemCs.approvedAt = simdi;
  menuItemCs.approvedBy = "seed-full";
  await applyChangeSet(menuItemCs);
}

seedFull().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
