import React, { useMemo } from "react";
import { MenuItem, MenuRating } from "../../../db";

interface Props { menuItems: MenuItem[]; puanlar: MenuRating[]; refreshData: () => void; }

export default function ReviewsTab({ menuItems, puanlar, refreshData }: Props) {
  const puanOzetMap = useMemo(() => {
    const map = new Map<string, { toplam: number; adet: number }>();
    for (const p of puanlar) {
      const mevcut = map.get(p.menuItemId) ?? { toplam: 0, adet: 0 };
      map.set(p.menuItemId, { toplam: mevcut.toplam + p.score, adet: mevcut.adet + 1 });
    }
    const sonuc = new Map<string, { ortalama: number; adet: number }>();
    for (const [id, v] of map.entries()) {
      sonuc.set(id, { ortalama: v.adet > 0 ? v.toplam / v.adet : 0, adet: v.adet });
    }
    return sonuc;
  }, [puanlar]);

  return (
    <section className="admin__card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Müşteri Puanları</h2>
        <button className="admin__secondary" onClick={() => void refreshData()}>Puanları Yenile</button>
      </div>
      {menuItems.length === 0 ? (
        <div className="admin__hint">Henüz ürün yok.</div>
      ) : (
        <div className="admin__list" role="list">
          {menuItems.map((m) => {
            const ozet = puanOzetMap.get(m.id) ?? { ortalama: 0, adet: 0 };
            return (
              <div key={m.id} className="admin__listRow" role="listitem">
                <div className="admin__listTitle">{m.nameTR}</div>
                <div className="admin__listMeta">
                  <span className="admin__badge admin__badge--ok">{ozet.ortalama.toFixed(1)} / 5</span>
                  <span className="admin__tags">{ozet.adet} oy</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
