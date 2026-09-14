import { useState, useEffect, useCallback } from "react";
import { db, MenuCategory, MenuItem, MenuRating, Recipe } from "../../../db";

export function useMenuData() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);

  // B2B SaaS: Gösterilecek Restoran (Tenant) ID'si (Gelecekte URL Subdomain'inden veya Parametreden alınacak)
  const currentTenantId = "local_demo_tenant";

  const fetchData = useCallback(async () => {
    setIsYukleniyor(true);
    try {
      // SADECE aktif kiracının verilerini çek
      const [allItems, allCats, allRatings, allRcp] = await Promise.all([
        db.menuItems.where("tenantId").equals(currentTenantId).toArray(),
        db.categories.where("tenantId").equals(currentTenantId).sortBy("sortOrder"),
        db.ratings.where("tenantId").equals(currentTenantId).toArray(),
        db.recipes.where("tenantId").equals(currentTenantId).toArray(),
      ]);

      // Müşteri Arayüzü İş Kuralları: Pasifleri gösterme
      setMenuItems(allItems.filter(item => item.available !== false));
      setKategoriler(allCats.filter(cat => cat.active !== false));
      setPuanlar(allRatings);
      setRecipes(allRcp);
    } catch (error) {
      console.error("Müşteri menüsü verileri yüklenirken kritik hata:", error);
    } finally {
      setIsYukleniyor(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { menuItems, kategoriler, puanlar, recipes, isYukleniyor, refreshData: fetchData };
}
