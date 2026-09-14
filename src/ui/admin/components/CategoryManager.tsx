import React, { useState } from "react";
import { db, ChangeSet, MenuCategory, MenuItem } from "../../../db";
import { publishChangeSet } from "../../../admin/adminActions";
import { AdminSession } from "../../../admin/admin.types";
import { createKayitId, createSlug, resolveHataMesaji } from "../utils/adminUtils";
import { supabase } from "../../../services/supabaseClient";

interface Props {
  kategoriler: MenuCategory[];
  menuItems: MenuItem[];
  refreshData: () => Promise<void>;
  adminSession: AdminSession | null;
  onNavigateToProductAdd: (categoryId: string) => void;
}

export default function CategoryManager({ kategoriler, menuItems, refreshData, adminSession, onNavigateToProductAdd }: Props) {
  const [duzenlenenKategoriId, setDuzenlenenKategoriId] = useState<string | null>(null);
  const [kategoriAdiTR, setKategoriAdiTR] = useState<string>("");
  const [kategoriAdiEN, setKategoriAdiEN] = useState<string>("");
  const [kategoriGorselUrl, setKategoriGorselUrl] = useState<string>("");
  const [kategoriSira, setKategoriSira] = useState<number>(1);
  const [isKategoriAktif, setIsKategoriAktif] = useState<boolean>(true);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  const currentTenantId = "local_demo_tenant";

  function temizleKategoriForm() {
    setDuzenlenenKategoriId(null); setKategoriAdiTR(""); setKategoriAdiEN("");
    setKategoriGorselUrl(""); setKategoriSira(1); setIsKategoriAktif(true);
  }

  async function kaydetKategori(): Promise<void> {
    setHataMesaji(null); setBasariMesaji(null);
    if (!adminSession) return setHataMesaji("Yetkilendirme hatası.");
    
    const nameTR = kategoriAdiTR.trim();
    if (!nameTR) return setHataMesaji("Kategori adı (TR) zorunludur.");
    const slug = createSlug(nameTR);
    if (!slug) return setHataMesaji("Kategori slug üretilemedi.");

    try {
      const simdi = Date.now();
      const kategori: MenuCategory = {
        id: duzenlenenKategoriId ?? createKayitId(),
        tenantId: currentTenantId,
        nameTR,
        nameEN: kategoriAdiEN.trim() || undefined,
        slug,
        imageUrl: kategoriGorselUrl.trim() || undefined,
        sortOrder: kategoriSira,
        active: isKategoriAktif,
        createdAt: simdi,
        updatedAt: simdi,
      };

      const cs: ChangeSet = {
        id: createKayitId(),
        tenantId: currentTenantId,
        status: "approved",
        patches: [{ type: duzenlenenKategoriId ? "UPDATE_CATEGORY" : "ADD_CATEGORY", payload: kategori }],
        createdAt: simdi,
        approvedAt: simdi,
        approvedBy: adminSession.adminId,
      };

      await db.changeSets.put(cs);
      await publishChangeSet(adminSession, cs.id);
      
      setBasariMesaji("Kategori kaydedildi ve yayınlandı.");
      temizleKategoriForm();
      await refreshData();
    } catch (err) {
      setHataMesaji(resolveHataMesaji(err));
    }
  }

  async function baslatKategoriDuzenle(kategoriId: string) {
    const k = kategoriler.find((k) => k.id === kategoriId);
    if (!k) return;
    setDuzenlenenKategoriId(k.id); setKategoriAdiTR(k.nameTR); setKategoriAdiEN(k.nameEN || "");
    setKategoriGorselUrl(k.imageUrl || ""); setKategoriSira(k.sortOrder); setIsKategoriAktif(k.active);
  }

  async function silKategori(kategoriId: string) {
    const k = kategoriler.find((k) => k.id === kategoriId);
    if (!k || !window.confirm(`"${k.nameTR}" silinecek. Emin misiniz?`)) return;
    try {
      await supabase.from('categories').delete().eq('id', kategoriId);
      await db.categories.delete(kategoriId);
      await refreshData();
    } catch (err) { setHataMesaji(resolveHataMesaji(err)); }
  }

  return (
    <section className="admin__card">
      {hataMesaji && <div className="admin__alert admin__alert--error">{hataMesaji}</div>}
      {basariMesaji && <div className="admin__alert admin__alert--success">{basariMesaji}</div>}
      
      <div className="admin__row">
        <label className="admin__field"><span className="admin__label">Kategori Adı (TR) *</span><input className="admin__input" value={kategoriAdiTR} onChange={e => setKategoriAdiTR(e.target.value)} /></label>
        <label className="admin__field"><span className="admin__label">Kategori Adı (EN)</span><input className="admin__input" value={kategoriAdiEN} onChange={e => setKategoriAdiEN(e.target.value)} /></label>
      </div>
      <div className="admin__row">
        <label className="admin__field"><span className="admin__label">Görsel URL</span><input className="admin__input" value={kategoriGorselUrl} onChange={e => setKategoriGorselUrl(e.target.value)} /></label>
        <label className="admin__field"><span className="admin__label">Sıra</span><input className="admin__input" type="number" value={kategoriSira} onChange={e => setKategoriSira(Number(e.target.value))} /></label>
      </div>
      <label className="admin__check">
        <input type="checkbox" checked={isKategoriAktif} onChange={e => setIsKategoriAktif(e.target.checked)} />
        <span>Müşteri Menüsünde Göster</span>
      </label>
      
      <button className="admin__primary" onClick={() => void kaydetKategori()} style={{ marginTop: "1rem" }}>
        {duzenlenenKategoriId ? "Güncelle ve Yayınla" : "Kaydet ve Yayınla"}
      </button>

      <hr style={{ margin: "2rem 0", borderColor: "rgba(255,255,255,0.1)" }} />
      <h3>Mevcut Kategoriler</h3>
      <div className="admin__list">
        {kategoriler.map(k => (
          <div key={k.id} className="admin__listRow" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{k.nameTR} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Sıra: {k.sortOrder})</span></div>
            <div>
              <button className="admin__secondary admin__inlineBtn" onClick={() => void baslatKategoriDuzenle(k.id)}>Düzenle</button>
              <button className="admin__secondary admin__inlineBtn" onClick={() => void silKategori(k.id)} style={{ color: "#ff6b6b" }}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
