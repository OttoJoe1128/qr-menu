import React, { useState } from "react";
import { db, ChangeSet, MenuCategory, MenuItem } from "../../../db";
import { publishChangeSet } from "../../../admin/adminActions";
import { AdminSession } from "../../../admin/admin.types";

// --- Kapsüllenmiş Yardımcı Fonksiyonlar ---
const createKayitId = () => crypto.randomUUID();
const createSlug = (text: string) => text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
const resolveHataMesaji = (err: unknown) => err instanceof Error ? err.message : String(err);

interface CategoryManagerProps {
  kategoriler: MenuCategory[];
  menuItems: MenuItem[];
  refreshData: () => Promise<void>;
  adminSession: AdminSession | null;
  onNavigateToProductAdd: (categoryId: string) => void;
}

export default function CategoryManager({ 
  kategoriler, 
  menuItems, 
  refreshData, 
  adminSession,
  onNavigateToProductAdd 
}: CategoryManagerProps) {
  // İzole Edilmiş Kategori State'leri
  const [duzenlenenKategoriId, setDuzenlenenKategoriId] = useState<string | null>(null);
  const [kategoriAdiTR, setKategoriAdiTR] = useState<string>("");
  const [kategoriAdiEN, setKategoriAdiEN] = useState<string>("");
  const [kategoriGorselUrl, setKategoriGorselUrl] = useState<string>("");
  const [kategoriSira, setKategoriSira] = useState<number>(1);
  const [isKategoriAktif, setIsKategoriAktif] = useState<boolean>(true);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  function temizleKategoriForm(): void {
    setDuzenlenenKategoriId(null);
    setKategoriAdiTR("");
    setKategoriAdiEN("");
    setKategoriGorselUrl("");
    setKategoriSira(1);
    setIsKategoriAktif(true);
  }

  async function kaydetKategori(): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    
    if (!adminSession) {
      setHataMesaji("Yetkilendirme hatası: Admin oturumu bulunamadı.");
      return;
    }

    try {
      const nameTR = kategoriAdiTR.trim();
      if (nameTR.length === 0) {
        setHataMesaji("Kategori adı (TR) zorunludur.");
        return;
      }
      
      const slug = createSlug(nameTR);
      if (slug.length === 0) {
        setHataMesaji("Kategori slug üretilemedi. Lütfen farklı bir kategori adı giriniz.");
        return;
      }
      
      const mevcutSlug = await db.categories.where("slug").equals(slug).first();
      if (mevcutSlug && mevcutSlug.id !== duzenlenenKategoriId) {
        setHataMesaji(`Bu kategori daha önce eklenmiş: slug=${slug}`);
        return;
      }
      
      const simdi = Date.now();
      const kategori: MenuCategory = {
        id: duzenlenenKategoriId ?? createKayitId(),
        nameTR,
        nameEN: kategoriAdiEN.trim().length > 0 ? kategoriAdiEN.trim() : undefined,
        slug,
        imageUrl: kategoriGorselUrl.trim().length > 0 ? kategoriGorselUrl.trim() : undefined,
        sortOrder: Number.isFinite(kategoriSira) ? kategoriSira : 1,
        active: isKategoriAktif,
        createdAt: simdi,
        updatedAt: simdi,
      };

      const cs: ChangeSet = {
        id: createKayitId(),
        status: "approved",
        patches: [{ type: duzenlenenKategoriId ? "UPDATE_CATEGORY" : "ADD_CATEGORY", payload: kategori }],
        createdAt: simdi,
        approvedAt: simdi,
        approvedBy: adminSession.adminId,
        baseSnapshotId: undefined, 
      };

      await db.changeSets.put(cs);
      await publishChangeSet(adminSession, cs.id);
      
      setBasariMesaji(duzenlenenKategoriId ? "Kategori güncellendi ve yayınlandı." : "Kategori kaydedildi ve yayınlandı.");
      temizleKategoriForm();
      await refreshData();
      onNavigateToProductAdd(kategori.id);
      
    } catch (err: unknown) {
      setHataMesaji(resolveHataMesaji(err));
    }
  }

  async function baslatKategoriDuzenle(kategoriId: string): Promise<void> {
    const kategori = kategoriler.find((k) => k.id === kategoriId);
    if (!kategori) return;
    
    setDuzenlenenKategoriId(kategori.id);
    setKategoriAdiTR(kategori.nameTR);
    setKategoriAdiEN(kategori.nameEN || "");
    setKategoriGorselUrl(kategori.imageUrl || "");
    setKategoriSira(kategori.sortOrder);
    setIsKategoriAktif(kategori.active);
    setHataMesaji(null);
    setBasariMesaji(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function silKategori(kategoriId: string): Promise<void> {
    const kategori = kategoriler.find((k) => k.id === kategoriId);
    if (!kategori) {
      setHataMesaji("Kategori bulunamadı.");
      return;
    }
    
    const bagliUrunler = menuItems.filter((m) => m.categoryId === kategoriId);
    const onayMesaji = bagliUrunler.length > 0
      ? `⚠️ Bu kategoriye bağlı ${bagliUrunler.length} ürün var!\n\nKategoriyi silmek istediğinize emin misiniz?\n(Ürünler silinmeyecek, sadece kategori bağlantısı kaldırılacak)`
      : `"${kategori.nameTR}" kategorisini silmek istediğinize emin misiniz?`;
    
    if (!window.confirm(onayMesaji)) return;

    setHataMesaji(null);
    setBasariMesaji(null);
    
    try {
      await db.categories.delete(kategoriId);
      await refreshData();
      setBasariMesaji("Kategori başarıyla silindi.");
    } catch (err: unknown) {
      setHataMesaji(resolveHataMesaji(err));
    }
  }

  return (
    <section className="admin__card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Kategori Yönetim Merkezi</h2>
        <button className="admin__secondary" onClick={temizleKategoriForm}>
          Formu Temizle
        </button>
      </div>

      {hataMesaji && <div className="admin__error" style={{ color: "#dc3545", backgroundColor: "#f8d7da", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>{hataMesaji}</div>}
      {basariMesaji && <div className="admin__success" style={{ color: "#198754", backgroundColor: "#d1e7dd", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>{basariMesaji}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="admin__formGroup">
          <label>Kategori Adı (TR) *</label>
          <input type="text" value={kategoriAdiTR} onChange={(e) => setKategoriAdiTR(e.target.value)} placeholder="Örn: Kahvaltı Deneyimi" />
        </div>
        <div className="admin__formGroup">
          <label>Kategori Adı (EN)</label>
          <input type="text" value={kategoriAdiEN} onChange={(e) => setKategoriAdiEN(e.target.value)} placeholder="Örn: Breakfast Experience" />
        </div>
      </div>

      <div className="admin__formGroup" style={{ marginTop: "1rem" }}>
        <label>Kategori Görsel URL</label>
        <input type="text" value={kategoriGorselUrl} onChange={(e) => setKategoriGorselUrl(e.target.value)} placeholder="https://unsplash.com/..." />
      </div>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginTop: "1rem" }}>
        <div className="admin__formGroup" style={{ flex: 1 }}>
          <label>Görünüm Sırası</label>
          <input type="number" value={kategoriSira} onChange={(e) => setKategoriSira(Number(e.target.value))} min="1" />
        </div>
        <div className="admin__formGroup" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", flex: 1 }}>
          <input type="checkbox" id="catActive" checked={isKategoriAktif} onChange={(e) => setIsKategoriAktif(e.target.checked)} style={{ width: "20px", height: "20px" }}/>
          <label htmlFor="catActive" style={{ margin: 0, cursor: "pointer" }}>Müşteri Menüsünde Göster</label>
        </div>
      </div>

      <button className="admin__primary" onClick={() => void kaydetKategori()} style={{ marginTop: "1.5rem", width: "100%", padding: "12px", fontSize: "1rem", fontWeight: "bold" }}>
        {duzenlenenKategoriId ? "Kategoriyi Güncelle ve Yayınla" : "Kategoriyi Kaydet ve Yayınla"}
      </button>
      
      <div className="admin__hint" style={{ marginTop: "0.5rem", textAlign: "center" }}>
        Not: Kategori kayıtları ChangeSet mimarisi üzerinden güvenli snapshot üretir.
      </div>

      <hr style={{ margin: "2.5rem 0", borderColor: "rgba(255,255,255,0.1)" }} />

      <h3>Mevcut Kategoriler ({kategoriler.length})</h3>
      
      {kategoriler.length === 0 ? (
        <div className="admin__hint">Sistemde henüz aktif bir kategori bulunmuyor.</div>
      ) : (
        <div className="admin__list" role="list">
          {kategoriler.map((k) => (
            <div key={k.id} className="admin__listRow" role="listitem" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "12px", marginBottom: "0.5rem" }}>
              <div>
                <div className="admin__listTitle" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{k.nameTR}</div>
                <div className="admin__listMeta" style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.85rem", opacity: 0.8 }}>
                  <span style={{ color: k.active ? "#4ade80" : "#f87171", fontWeight: "bold" }}>
                    {k.active ? "● AKTİF" : "○ PASİF"}
                  </span>
                  <span>Sıra: {k.sortOrder}</span>
                  <span>Slug: {k.slug}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="admin__secondary admin__inlineBtn" onClick={() => void baslatKategoriDuzenle(k.id)}>
                  Düzenle
                </button>
                <button className="admin__secondary admin__inlineBtn" onClick={() => void silKategori(k.id)} style={{ backgroundColor: "rgba(220, 53, 69, 0.1)", color: "#ff6b6b", borderColor: "rgba(220, 53, 69, 0.2)" }}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
