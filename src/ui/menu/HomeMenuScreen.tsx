import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./HomeMenuScreen.css";
import { db, MenuCategory, MenuItem, MenuRating, Recipe } from "../../db";
import {
  buildMenuKategoriOzetleri,
  buildMenuKategoriOzetleriFromKategoriler,
  MenuKategoriSiralamaModu,
  sortMenuKategoriOzetleri,
} from "./menuKategoriUtils";

export default function HomeMenuScreen() {
  const navigate = useNavigate();
  const [aramaParametreleri] = useSearchParams();
  const adminKisayoluAnahtari: string = "qr_menu_admin_kisayolu";
  const masaNumarasiAnahtari: string = "qr_menu_table_number";
  const [aramaMetni, setAramaMetni] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);
  const [siralamaModu, setSiralamaModu] = useState<MenuKategoriSiralamaModu>("sayim_azalan");

  const isAdminKisayoluGorunur: boolean = useMemo((): boolean => {
    const isAdmin: string | null = aramaParametreleri.get("admin");
    if (isAdmin === "1") {
      return true;
    }
    const kayitli: string | null = localStorage.getItem(adminKisayoluAnahtari);
    return kayitli === "1";
  }, [aramaParametreleri, adminKisayoluAnahtari]);

  useEffect((): (() => void) => {
    let isIptalEdildi: boolean = false;
    async function yukleMenuItems(): Promise<void> {
      try {
        const [items, cats, ratings, rcp]: [MenuItem[], MenuCategory[], MenuRating[], Recipe[]] = await Promise.all([
          db.menuItems.toArray(),
          db.categories.toArray(),
          db.ratings.toArray(),
          db.recipes.toArray(),
        ]);
        if (isIptalEdildi) {
          return;
        }
        setMenuItems(items);
        setKategoriler(cats);
        setPuanlar(ratings);
        setRecipes(rcp);
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

  const masaNumarasi: string | null = useMemo((): string | null => {
    const kayitli: string | null = localStorage.getItem(masaNumarasiAnahtari);
    if (!kayitli) {
      return null;
    }
    const temiz: string = kayitli.trim();
    return temiz.length > 0 ? temiz : null;
  }, [masaNumarasiAnahtari]);

  const recipeMap = useMemo((): Map<string, Recipe> => {
    const map: Map<string, Recipe> = new Map();
    for (const r of recipes) {
      map.set(r.id, r);
    }
    return map;
  }, [recipes]);

  const puanOzetMap = useMemo((): Map<string, { ortalama: number; adet: number }> => {
    const map: Map<string, { toplam: number; adet: number }> = new Map();
    for (const p of puanlar) {
      const mevcut = map.get(p.menuItemId) ?? { toplam: 0, adet: 0 };
      map.set(p.menuItemId, { toplam: mevcut.toplam + p.score, adet: mevcut.adet + 1 });
    }
    const sonuc: Map<string, { ortalama: number; adet: number }> = new Map();
    for (const [menuItemId, v] of map.entries()) {
      sonuc.set(menuItemId, { ortalama: v.adet > 0 ? v.toplam / v.adet : 0, adet: v.adet });
    }
    return sonuc;
  }, [puanlar]);

  const oneCikanUrunler = useMemo((): Array<{ item: MenuItem; recipe: Recipe | null; puan: number; adet: number }> => {
    const adaylar: Array<{ item: MenuItem; recipe: Recipe | null; puan: number; adet: number }> = menuItems
      .filter((m) => m.available)
      .map((m) => {
        const ozet = puanOzetMap.get(m.id) ?? { ortalama: 0, adet: 0 };
        const recipe: Recipe | null = m.recipeId ? recipeMap.get(m.recipeId) ?? null : null;
        return { item: m, recipe, puan: ozet.ortalama, adet: ozet.adet };
      });
    const sirali = [...adaylar].sort((a, b) => {
      const aSkor: number = a.puan * Math.min(10, a.adet);
      const bSkor: number = b.puan * Math.min(10, b.adet);
      return bSkor - aSkor || b.puan - a.puan || b.adet - a.adet || a.item.nameTR.localeCompare(b.item.nameTR);
    });
    return sirali.slice(0, 8);
  }, [menuItems, puanOzetMap, recipeMap]);

  const filtreliKategoriOzetleri = useMemo(() => {
    const arama: string = aramaMetni.trim().toLocaleLowerCase("tr-TR");
    if (arama.length === 0) {
      return kategoriOzetleri;
    }
    return kategoriOzetleri.filter((o) => {
      const baslik: string = o.baslik.toLocaleLowerCase("tr-TR");
      const anahtar: string = o.anahtar.toLocaleLowerCase("tr-TR");
      return baslik.includes(arama) || anahtar.includes(arama);
    });
  }, [kategoriOzetleri, aramaMetni]);

  return (
    <div className="home-menu">
      <div className="menu-header">
        <div className="menu-title-row">
          <h1 className="menu-title">Menü</h1>
          <div className="menu-actions">
            {masaNumarasi ? <div className="menu-pill">Masa {masaNumarasi}</div> : null}
            {isAdminKisayoluGorunur ? (
              <button className="menu-secondary" onClick={() => navigate("/?sayfa=admin")}>
                Admin Paneli
              </button>
            ) : null}
            <button className="menu-secondary" onClick={() => navigate("/")}>
              Ana Ekran
            </button>
          </div>
        </div>
        <div className="menu-controls">
          <label className="menu-control menu-control--grow">
            <span className="menu-control-label">Ara</span>
            <input
              className="menu-input"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Kategori ara (örn: içecek, tatlı...)"
            />
          </label>
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
      ) : filtreliKategoriOzetleri.length === 0 ? (
        <div className="menu-empty">Aramaya uygun kategori bulunamadı.</div>
      ) : (
        <>
          {oneCikanUrunler.length > 0 ? (
            <section className="menu-featured">
              <div className="menu-featuredTitleRow">
                <div className="menu-featuredTitle">Öne Çıkanlar</div>
                <div className="menu-featuredHint">Puanlara göre seçildi</div>
              </div>
              <div className="menu-featuredList" role="list">
                {oneCikanUrunler.map(({ item, recipe, puan, adet }) => (
                  <button
                    key={item.id}
                    className="menu-featuredCard"
                    role="listitem"
                    onClick={() => navigate(`/menu/item/${encodeURIComponent(item.id)}`)}
                  >
                    {recipe?.heroImage ? (
                      <img className="menu-featuredImg" src={recipe.heroImage} alt={item.nameTR} />
                    ) : (
                      <div className="menu-featuredImgPlaceholder">Görsel yok</div>
                    )}
                    <div className="menu-featuredBody">
                      <div className="menu-featuredName">{item.nameTR}</div>
                      <div className="menu-featuredMeta">
                        <span className="menu-featuredBadge">{puan.toFixed(1)} / 5</span>
                        <span className="menu-featuredSub">{adet} oy</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="menu-list" role="list">
            {filtreliKategoriOzetleri.map((ozet) => (
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

          <nav className="alt-nav" aria-label="Alt Menü">
            <button className="alt-nav__btn" onClick={() => navigate("/")}>
              Ana Ekran
            </button>
            <button className="alt-nav__btn alt-nav__btn--active" onClick={() => navigate("/menu")}>
              Menü
            </button>
            <button
              className="alt-nav__btn"
              onClick={() => {
                const kategori: string | null = localStorage.getItem("qr_menu_day_category");
                if (kategori) {
                  navigate(`/menu/day?category=${encodeURIComponent(kategori)}`);
                  return;
                }
                navigate("/menu/day");
              }}
            >
              Günün Menüsü
            </button>
          </nav>
        </>
      )}
    </div>
  );
}