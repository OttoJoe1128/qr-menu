import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./HomeMenuScreen.css";
import { db, MenuCategory, MenuItem } from "../../db";
import {
  buildMenuKategoriOzetleri,
  buildMenuKategoriOzetleriFromKategoriler,
  MenuKategoriSiralamaModu,
  sortMenuKategoriOzetleri,
} from "./menuKategoriUtils";

export default function HomeMenuScreen() {
  const navigate = useNavigate();
  const [aramaParametreleri] = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);
  const [siralamaModu, setSiralamaModu] = useState<MenuKategoriSiralamaModu>("sayim_azalan");

  useEffect((): (() => void) => {
    let isIptalEdildi: boolean = false;
    async function yukleMenuItems(): Promise<void> {
      try {
        const [items, cats]: [MenuItem[], MenuCategory[]] = await Promise.all([
          db.menuItems.toArray(),
          db.categories.toArray(),
        ]);
        if (isIptalEdildi) {
          return;
        }
        setMenuItems(items);
        setKategoriler(cats);
      } finally {
        if (isIptalEdildi) {
          return;
        }
        setIsYukleniyor(false);
      }
    }
    void yukleMenuItems();
    return (): void => {
      isIptalEdildi = true;
    };
  }, []);

  useEffect((): void => {
    const category: string | null = aramaParametreleri.get("category");
    if (!category) {
      return;
    }
    localStorage.setItem("qr_menu_day_category", category);
    navigate(`/menu/day?category=${encodeURIComponent(category)}`, { replace: true });
  }, [aramaParametreleri, navigate]);

  const kategoriOzetleri = useMemo(() => {
    const ozetler =
      kategoriler.length > 0
        ? buildMenuKategoriOzetleriFromKategoriler(menuItems, kategoriler)
        : buildMenuKategoriOzetleri(menuItems);
    return sortMenuKategoriOzetleri(ozetler, siralamaModu);
  }, [menuItems, siralamaModu]);

  return (
    <div className="home-menu">
      <div className="menu-header">
        <div className="menu-title-row">
          <h1 className="menu-title">Menü</h1>
          <button className="menu-secondary" onClick={() => navigate("/")}>
            Ana Ekran
          </button>
        </div>
        <div className="menu-controls">
          <label className="menu-control">
            <span className="menu-control-label">Sıralama</span>
            <select
              className="menu-select"
              value={siralamaModu}
              onChange={(e) => setSiralamaModu(e.target.value as MenuKategoriSiralamaModu)}
            >
              <option value="sayim_azalan">Ürün sayısı (çoktan aza)</option>
              <option value="alfabetik_artan">Etiket (A → Z)</option>
              <option value="alfabetik_azalan">Etiket (Z → A)</option>
            </select>
          </label>
        </div>
      </div>

      {isYukleniyor ? (
        <div className="menu-empty">Yükleniyor...</div>
      ) : kategoriOzetleri.length === 0 ? (
        <div className="menu-empty">
          Menü henüz hazır değil. (Veri yok) İsterseniz `src/dev/seed.ts` ile örnek veri
          oluşturabilirsiniz.
        </div>
      ) : (
        <div className="menu-list" role="list">
          {kategoriOzetleri.map((ozet) => (
            <button
              key={ozet.anahtar}
              className="menu-row"
              onClick={() => {
                localStorage.setItem("qr_menu_day_category", ozet.anahtar);
                navigate(`/menu/day?category=${encodeURIComponent(ozet.anahtar)}`);
              }}
            >
              <div className="menu-row-left">
                <div className="menu-row-title">{ozet.baslik}</div>
                <div className="menu-row-subtitle">{ozet.urunSayisi} ürün</div>
              </div>
              <div className="menu-row-right">→</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}