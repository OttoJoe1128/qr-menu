import "./DayMenuScreen.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db, MenuCategory, MenuItem, MenuRating } from "../../db";
import {
  buildMenuKategoriOzetleri,
  buildMenuKategoriOzetleriFromKategoriler,
  resolveSeciliKategori,
} from "./menuKategoriUtils";

type MenuUrunSiralamaModu = "guncellenme_azalan" | "isim_artan";

export default function DayMenuScreen() {
  const navigate = useNavigate();
  const [aramaParametreleri, setAramaParametreleri] = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);
  const [seciliKategori, setSeciliKategori] = useState<string | null>(null);
  const [urunSiralamaModu, setUrunSiralamaModu] = useState<MenuUrunSiralamaModu>("guncellenme_azalan");

  useEffect((): (() => void) => {
    let isIptalEdildi: boolean = false;
    async function yukleMenuItems(): Promise<void> {
      try {
        const [items, cats, ratings]: [MenuItem[], MenuCategory[], MenuRating[]] = await Promise.all([
          db.menuItems.toArray(),
          db.categories.toArray(),
          db.ratings.toArray(),
        ]);
        if (isIptalEdildi) {
          return;
        }
        setMenuItems(items);
        setKategoriler(cats);
        setPuanlar(ratings);
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

  const kategoriOzetleri = useMemo(() => {
    const ozetler =
      kategoriler.length > 0
        ? buildMenuKategoriOzetleriFromKategoriler(menuItems, kategoriler)
        : buildMenuKategoriOzetleri(menuItems);
    return ozetler;
  }, [menuItems, kategoriler]);

  const kullanilabilirAnahtarlar = useMemo((): string[] => {
    return kategoriOzetleri.map((o) => o.anahtar);
  }, [kategoriOzetleri]);

  useEffect((): void => {
    if (kullanilabilirAnahtarlar.length === 0) {
      setSeciliKategori(null);
      return;
    }
    const aramaParametresiKategori: string | null = aramaParametreleri.get("category");
    const kaydedilmisKategori: string | null = localStorage.getItem("qr_menu_day_category");
    const resolved: string | null = resolveSeciliKategori({
      aramaParametresiKategori,
      kaydedilmisKategori,
      kullanilabilirEtiketler: kullanilabilirAnahtarlar,
    });
    setSeciliKategori(resolved);
    if (resolved && aramaParametresiKategori !== resolved) {
      setAramaParametreleri({ category: resolved }, { replace: true });
    }
  }, [kullanilabilirAnahtarlar, aramaParametreleri, setAramaParametreleri]);

  const seciliKategoriId = useMemo((): string | null => {
    if (!seciliKategori) {
      return null;
    }
    const kategori: MenuCategory | undefined = kategoriler.find((k) => k.slug === seciliKategori);
    return kategori ? kategori.id : null;
  }, [seciliKategori, kategoriler]);

  const puanOrtalamaMap = useMemo((): Map<string, number> => {
    const map: Map<string, { toplam: number; adet: number }> = new Map();
    for (const p of puanlar) {
      const mevcut = map.get(p.menuItemId) ?? { toplam: 0, adet: 0 };
      map.set(p.menuItemId, { toplam: mevcut.toplam + p.score, adet: mevcut.adet + 1 });
    }
    const sonuc: Map<string, number> = new Map();
    for (const [menuItemId, v] of map.entries()) {
      sonuc.set(menuItemId, v.adet > 0 ? v.toplam / v.adet : 0);
    }
    return sonuc;
  }, [puanlar]);

  const filtrelenmisUrunler = useMemo((): MenuItem[] => {
    const filtreli: MenuItem[] = menuItems.filter((i) => {
      if (!i.available) {
        return false;
      }
      if (!seciliKategori) {
        return true;
      }
      if (kategoriler.length > 0) {
        return !!seciliKategoriId && i.categoryId === seciliKategoriId;
      }
      return i.tags.includes(seciliKategori);
    });
    if (urunSiralamaModu === "isim_artan") {
      return [...filtreli].sort((a, b) => a.nameTR.localeCompare(b.nameTR));
    }
    return [...filtreli].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [menuItems, seciliKategori, urunSiralamaModu, kategoriler, seciliKategoriId]);

  async function kaydetPuan(menuItemId: string, score: number): Promise<void> {
    const tableSessionId: string | null = localStorage.getItem("qr_menu_table_session_id");
    const mevcut: MenuRating | undefined = await db.ratings
      .where("menuItemId")
      .equals(menuItemId)
      .and((r: MenuRating) => (tableSessionId ? r.tableSessionId === tableSessionId : !r.tableSessionId))
      .first();
    if (mevcut) {
      await db.ratings.put({ ...mevcut, score, createdAt: Date.now() });
    } else {
      await db.ratings.put({
        id: globalThis.crypto.randomUUID(),
        menuItemId,
        tableSessionId: tableSessionId ?? undefined,
        score,
        createdAt: Date.now(),
      });
    }
    const ratings: MenuRating[] = await db.ratings.toArray();
    setPuanlar(ratings);
  }

  return (
    <div className="day-menu">
      <div className="day-header">
        <h1 className="day-title">Günün Menüsü</h1>
        <button className="day-secondary" onClick={() => navigate("/menu")}>
          Kategoriler
        </button>
      </div>

      <div className="category-list">
        {kategoriOzetleri.map((ozet) => {
          const isSecili: boolean = seciliKategori === ozet.anahtar;
          return (
            <button
              key={ozet.anahtar}
              className={`category-item ${isSecili ? "category-item--active" : ""}`}
              onClick={() => {
                localStorage.setItem("qr_menu_day_category", ozet.anahtar);
                setSeciliKategori(ozet.anahtar);
                setAramaParametreleri({ category: ozet.anahtar });
              }}
            >
              {ozet.baslik}
            </button>
          );
        })}
      </div>

      <div className="day-controls">
        <label className="day-control">
          <span className="day-control-label">Sıralama</span>
          <select
            className="day-select"
            value={urunSiralamaModu}
            onChange={(e) => setUrunSiralamaModu(e.target.value as MenuUrunSiralamaModu)}
          >
            <option value="guncellenme_azalan">Güncellenme (yeniden eskiye)</option>
            <option value="isim_artan">İsim (A → Z)</option>
          </select>
        </label>
      </div>

      {isYukleniyor ? (
        <div className="menu-placeholder">Yükleniyor...</div>
      ) : seciliKategori === null ? (
        <div className="menu-placeholder">Henüz bir kategori yok.</div>
      ) : filtrelenmisUrunler.length === 0 ? (
        <div className="menu-placeholder">Bu kategoride ürün bulunamadı.</div>
      ) : (
        <div className="day-list" role="list">
          {filtrelenmisUrunler.map((urun) => (
            <div key={urun.id} className="day-row" role="listitem">
              <div className="day-row-top">
                <button className="day-row-titleBtn" onClick={() => navigate(`/menu/item/${encodeURIComponent(urun.id)}`)}>
                  {urun.nameTR}
                </button>
                <div className="day-row-rating">
                  <span className="day-row-ratingValue">
                    {(puanOrtalamaMap.get(urun.id) ?? 0).toFixed(1)}
                  </span>
                  <span className="day-row-ratingText">/ 5</span>
                </div>
              </div>
              <div className="day-row-tags">{urun.tags.join(", ")}</div>
              <div className="day-row-rate">
                <span className="day-row-rateLabel">Puan ver:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} className="day-row-rateBtn" onClick={() => void kaydetPuan(urun.id, s)}>
                    {s}
                  </button>
                ))}
                <button className="day-row-detailBtn" onClick={() => navigate(`/menu/item/${encodeURIComponent(urun.id)}`)}>
                  Detay →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}