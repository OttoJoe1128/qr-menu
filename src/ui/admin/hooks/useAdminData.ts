import { useState, useEffect, useCallback } from "react";
import { db, MenuCategory, MenuItem, MenuRating, Recipe } from "../../../db";

export function useAdminData() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);

  // B2B SaaS: Aktif Kiracı ID'si (Şimdilik lokal simülasyon)
  const currentTenantId = "local_demo_tenant"; 

  const fetchData = useCallback(async () => {
    setIsYukleniyor(true);
    try {
      // Sadece giriş yapan kiracının (tenant) verileri çekilir
      const [items, cats, ratings, rcp] = await Promise.all([
        db.menuItems.where("tenantId").equals(currentTenantId).reverse().sortBy("updatedAt"),
        db.categories.where("tenantId").equals(currentTenantId).sortBy("sortOrder"),
        db.ratings.where("tenantId").equals(currentTenantId).toArray(),
        db.recipes.where("tenantId").equals(currentTenantId).reverse().sortBy("updatedAt"),
      ]);
      setMenuItems(items);
      setKategoriler(cats);
      setPuanlar(ratings);
      setRecipes(rcp);
    } catch (error) {
      console.error("Admin verileri yüklenirken kritik bir hata oluştu:", error);
    } finally {
      setIsYukleniyor(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { 
    menuItems, 
    kategoriler, 
    puanlar, 
    recipes, 
    isYukleniyor, 
    refreshData: fetchData 
  };
}
