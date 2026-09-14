import { useState, useEffect, useCallback } from "react";
import { db, MenuCategory, MenuItem, MenuRating, Recipe } from "../../../db";

export function useAdminData() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setIsYukleniyor(true);
    try {
      const [items, cats, ratings, rcp] = await Promise.all([
        db.menuItems.orderBy("updatedAt").reverse().toArray(),
        db.categories.orderBy("sortOrder").toArray(),
        db.ratings.toArray(),
        db.recipes.orderBy("updatedAt").reverse().toArray(),
      ]);
      setMenuItems(items);
      setKategoriler(cats);
      setPuanlar(ratings);
      setRecipes(rcp);
    } catch (error) {
      console.error("Veri yüklenirken kritik bir hata oluştu:", error);
    } finally {
      setIsYukleniyor(false);
    }
  }, []);

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
