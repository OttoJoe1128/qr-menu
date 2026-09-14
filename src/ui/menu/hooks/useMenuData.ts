import { useState, useEffect, useCallback } from "react";
import { db, MenuCategory, MenuItem, MenuRating, Recipe } from "../../../db";

export function useMenuData() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setIsYukleniyor(true);
    try {
      // SADECE GEREKLİ VERİLER: Tüm veriyi çeker ve iş kurallarını (Aktiflik) uygular
      const [allItems, allCats, allRatings, allRcp] = await Promise.all([
        db.menuItems.toArray(),
        db.categories.orderBy("sortOrder").toArray(),
        db.ratings.toArray(),
        db.recipes.toArray(),
      ]);

      // B2B SaaS Mantığı: Pasif olanları müşteri arayüzüne kesinlikle gönderme
      setMenuItems(allItems.filter(item => item.available !== false));
      setKategoriler(allCats.filter(cat => cat.active !== false));
      setPuanlar(allRatings);
      setRecipes(allRcp);
    } catch (error) {
      console.error("Müşteri menüsü verileri yüklenirken kritik hata:", error);
    } finally {
      setIsYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { menuItems, kategoriler, puanlar, recipes, isYukleniyor, refreshData: fetchData };
}
