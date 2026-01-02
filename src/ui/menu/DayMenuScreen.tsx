import "./DayMenuScreen.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db, MenuItem } from "../../db";
import { buildMenuKategoriOzetleri, resolveSeciliKategori } from "./menuKategoriUtils";

type MenuUrunSiralamaModu = "guncellenme_azalan" | "isim_artan";

export default function DayMenuScreen() {
  const navigate = useNavigate();
  const [aramaParametreleri, setAramaParametreleri] = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);
  const [seciliKategori, setSeciliKategori] = useState<string | null>(null);
  const [urunSiralamaModu, setUrunSiralamaModu] = useState<MenuUrunSiralamaModu>("guncellenme_azalan");

  useEffect((): (() => void) => {
    let isIptalEdildi: boolean = false;
    async function yukleMenuItems(): Promise<void> {
      try {
        const items: MenuItem[] = await db.menuItems.toArray();
        if (isIptalEdildi) {
          return;
        }
        setMenuItems(items);
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

  const kullanilabilirEtiketler = useMemo((): string[] => {
    const ozetler = buildMenuKategoriOzetleri(menuItems);
    return ozetler
      .map((o) => o.etiket)
      .sort((a, b) => a.localeCompare(b));
  }, [menuItems]);

  useEffect((): void => {
    if (kullanilabilirEtiketler.length === 0) {
      setSeciliKategori(null);
      return;
    }
    const aramaParametresiKategori: string | null = aramaParametreleri.get("category");
    const kaydedilmisKategori: string | null = localStorage.getItem("qr_menu_day_category");
    const resolved: string | null = resolveSeciliKategori({
      aramaParametresiKategori,
      kaydedilmisKategori,
      kullanilabilirEtiketler,
    });
    setSeciliKategori(resolved);
    if (resolved && aramaParametresiKategori !== resolved) {
      setAramaParametreleri({ category: resolved }, { replace: true });
    }
  }, [kullanilabilirEtiketler, aramaParametreleri, setAramaParametreleri]);

  const filtrelenmisUrunler = useMemo((): MenuItem[] => {
    const filtreli: MenuItem[] = menuItems.filter((i) => i.available && (!!seciliKategori ? i.tags.includes(seciliKategori) : true));
    if (urunSiralamaModu === "isim_artan") {
      return [...filtreli].sort((a, b) => a.nameTR.localeCompare(b.nameTR));
    }
    return [...filtreli].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [menuItems, seciliKategori, urunSiralamaModu]);

  return (
    <div className="day-menu">
      <div className="day-header">
        <h1 className="day-title">Günün Menüsü</h1>
        <button className="day-secondary" onClick={() => navigate("/menu")}>
          Kategoriler
        </button>
      </div>

      <div className="category-list">
        {kullanilabilirEtiketler.map((cat) => {
          const isSecili: boolean = seciliKategori === cat;
          return (
            <button
              key={cat}
              className={`category-item ${isSecili ? "category-item--active" : ""}`}
              onClick={() => {
                localStorage.setItem("qr_menu_day_category", cat);
                setSeciliKategori(cat);
                setAramaParametreleri({ category: cat });
              }}
            >
              {cat}
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
              <div className="day-row-title">{urun.nameTR}</div>
              <div className="day-row-tags">{urun.tags.join(", ")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}