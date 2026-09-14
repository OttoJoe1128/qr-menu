import React, { useState, useMemo, useEffect } from "react";
import { db, ChangeSet, MenuCategory, MenuItem, Recipe, TemplateId } from "../../../db";
import { publishChangeSet } from "../../../admin/adminActions";
import { AdminSession } from "../../../admin/admin.types";
import { parseEtiketler, parseSatirlar, resolveHataMesaji } from "../utils/adminUtils";
import { supabase } from "../../../services/supabaseClient";

interface Props {
  activeTab: "urun_ekle" | "urun_liste";
  onTabChange: (tab: "urun_ekle" | "urun_liste") => void;
  menuItems: MenuItem[];
  kategoriler: MenuCategory[];
  recipes: Recipe[];
  refreshData: () => Promise<void>;
  adminSession: AdminSession | null;
  initialCategoryId?: string;
}

export default function ProductManager({ activeTab, onTabChange, menuItems, kategoriler, recipes, refreshData, adminSession, initialCategoryId }: Props) {
  const [duzenlenenMenuItemId, setDuzenlenenMenuItemId] = useState<string | null>(null);
  const [duzenlenenRecipeId, setDuzenlenenRecipeId] = useState<string | null>(null);
  const [seciliKategoriId, setSeciliKategoriId] = useState<string>("");
  const [urunAdiTR, setUrunAdiTR] = useState<string>("");
  const [urunAdiEN, setUrunAdiEN] = useState<string>("");
  const [etiketlerMetin, setEtiketlerMetin] = useState<string>("");
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [aciklamaMetin, setAciklamaMetin] = useState<string>("");
  const [malzemelerMetin, setMalzemelerMetin] = useState<string>("");
  const [adimlarMetin, setAdimlarMetin] = useState<string>("");
  const [eslesmelerMetin, setEslesmelerMetin] = useState<string>("");
  const [sefNotlariMetin, setSefNotlariMetin] = useState<string>("");
  const [isUrunMevcut, setIsUrunMevcut] = useState<boolean>(true);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  const currentTenantId = "local_demo_tenant";

  useEffect(() => {
    if (initialCategoryId && !duzenlenenMenuItemId) setSeciliKategoriId(initialCategoryId);
  }, [initialCategoryId, duzenlenenMenuItemId]);

  const kategoriMap = useMemo(() => {
    const map = new Map<string, MenuCategory>();
    for (const k of kategoriler) map.set(k.id, k);
    return map;
  }, [kategoriler]);

  function temizleUrunForm(): void {
    setDuzenlenenMenuItemId(null); setDuzenlenenRecipeId(null); setSeciliKategoriId("");
    setUrunAdiTR(""); setUrunAdiEN(""); setEtiketlerMetin(""); setHeroImageUrl("");
    setAciklamaMetin(""); setMalzemelerMetin(""); setAdimlarMetin(""); setEslesmelerMetin("");
    setSefNotlariMetin(""); setIsUrunMevcut(true); setHataMesaji(null); setBasariMesaji(null);
  }

  async function kaydetMenuItem(): Promise<void> {
    setHataMesaji(null); setBasariMesaji(null);
    if (!adminSession) return setHataMesaji("Oturum hatası");
    if (!seciliKategoriId) return setHataMesaji("Kategori seçiniz.");
    if (!urunAdiTR.trim()) return setHataMesaji("Ürün adı zorunludur.");
    if (!heroImageUrl.trim()) return setHataMesaji("Görsel URL zorunludur.");
    if (!aciklamaMetin.trim()) return setHataMesaji("Açıklama zorunludur.");
    const ingredients = parseSatirlar(malzemelerMetin);
    if (ingredients.length === 0) return setHataMesaji("Malzemeler zorunludur.");
    const steps = parseSatirlar(adimlarMetin);
    if (steps.length === 0) return setHataMesaji("Yapılış adımları zorunludur.");

    try {
      const simdi = Date.now();
      const id = duzenlenenMenuItemId ?? globalThis.crypto.randomUUID();
      const recipeId = duzenlenenRecipeId ?? globalThis.crypto.randomUUID();

      const recipe: Recipe = {
        id: recipeId,
        tenantId: currentTenantId,
        heroImage: heroImageUrl.trim(), description: aciklamaMetin.trim(),
        ingredients, steps, pairings: parseSatirlar(eslesmelerMetin),
        chefNotes: sefNotlariMetin.trim() || undefined, createdAt: simdi, updatedAt: simdi,
      };

      const menuItem: MenuItem = {
        id,
        tenantId: currentTenantId,
        nameTR: urunAdiTR.trim(), nameEN: urunAdiEN.trim() || undefined,
        templateId: "food_detail_v1" as TemplateId, categoryId: seciliKategoriId,
        recipeId, tags: parseEtiketler(etiketlerMetin), available: isUrunMevcut,
        createdAt: simdi, updatedAt: simdi, price: 0,
      };

      const cs: ChangeSet = {
        id: globalThis.crypto.randomUUID(),
        tenantId: currentTenantId,
        status: "approved",
        patches: duzenlenenMenuItemId 
          ? [{ type: "UPDATE_RECIPE", payload: recipe }, { type: "UPDATE_MENU_ITEM", payload: menuItem }]
          : [{ type: "ADD_RECIPE", payload: recipe }, { type: "ADD_MENU_ITEM", payload: menuItem }],
        createdAt: simdi, approvedAt: simdi, approvedBy: adminSession.adminId,
      };

      await db.changeSets.put(cs);
      await publishChangeSet(adminSession, cs.id);
      setBasariMesaji(duzenlenenMenuItemId ? "Ürün güncellendi." : "Ürün eklendi.");
      temizleUrunForm();
      await refreshData();
      onTabChange("urun_liste");
    } catch (err) { setHataMesaji(resolveHataMesaji(err)); }
  }

  async function baslatUrunDuzenle(menuItemId: string): Promise<void> {
    const item = menuItems.find((m) => m.id === menuItemId);
    if (!item) return;
    const rcp = item.recipeId ? recipes.find((r) => r.id === item.recipeId) : undefined;
    
    setDuzenlenenMenuItemId(item.id); setDuzenlenenRecipeId(item.recipeId ?? null);
    setSeciliKategoriId(item.categoryId ?? ""); setUrunAdiTR(item.nameTR);
    setUrunAdiEN(item.nameEN ?? ""); setEtiketlerMetin(item.tags.join(", "));
    setIsUrunMevcut(item.available); setHeroImageUrl(rcp?.heroImage ?? "");
    setAciklamaMetin(rcp?.description ?? ""); setMalzemelerMetin(rcp ? rcp.ingredients.join("\n") : "");
    setAdimlarMetin(rcp ? rcp.steps.join("\n") : ""); setEslesmelerMetin(rcp?.pairings ? rcp.pairings.join("\n") : "");
    setSefNotlariMetin(rcp?.chefNotes ?? "");
    onTabChange("urun_ekle");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function degistirUrunAktiflik(menuItemId: string, yeniDurum: boolean): Promise<void> {
    if (!adminSession) return;
    try {
      const item = await db.menuItems.get(menuItemId);
      if (!item) return;
      const simdi = Date.now();
      const guncel = { ...item, available: yeniDurum, updatedAt: simdi };
      const cs: ChangeSet = {
        id: globalThis.crypto.randomUUID(),
        tenantId: currentTenantId,
        status: "approved",
        patches: [{ type: "UPDATE_MENU_ITEM", payload: guncel }],
        createdAt: simdi, approvedAt: simdi, approvedBy: adminSession.adminId,
      };
      await db.changeSets.put(cs);
      await publishChangeSet(adminSession, cs.id);
      await refreshData();
    } catch (err) { setHataMesaji("Durum güncellenemedi."); }
  }

  async function silMenuItem(menuItemId: string): Promise<void> {
    const item = menuItems.find((m) => m.id === menuItemId);
    if (!item || !window.confirm(`"${item.nameTR}" silinecek. Emin misiniz?`)) return;
    try {
      if (item.recipeId) {
        await supabase.from('recipes').delete().eq('id', item.recipeId);
        await db.recipes.delete(item.recipeId);
      }
      await supabase.from('menuItems').delete().eq('id', menuItemId);
      await db.menuItems.delete(menuItemId);
      await refreshData();
    } catch (err) { setHataMesaji("Silinemedi."); }
  }

  return (
    <section className="admin__card">
      {hataMesaji && <div className="admin__alert admin__alert--error">{hataMesaji}</div>}
      {basariMesaji && <div className="admin__alert admin__alert--success">{basariMesaji}</div>}

      {activeTab === "urun_ekle" && (
         <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0 }}>Ürün Ekle / Düzenle</h2>
              <button className="admin__secondary" onClick={temizleUrunForm}>Formu Temizle</button>
            </div>
            <label className="admin__field">
              <span className="admin__label">Kategori *</span>
              <select className="admin__input" value={seciliKategoriId} onChange={(e) => setSeciliKategoriId(e.target.value)}>
                <option value="">Kategori seçiniz</option>
                {kategoriler.filter(k => k.active).map(k => <option key={k.id} value={k.id}>{k.nameTR}</option>)}
              </select>
            </label>
            <div className="admin__row">
              <label className="admin__field"><span className="admin__label">Ürün Adı (TR) *</span><input className="admin__input" value={urunAdiTR} onChange={e => setUrunAdiTR(e.target.value)} /></label>
              <label className="admin__field"><span className="admin__label">Ürün Adı (EN)</span><input className="admin__input" value={urunAdiEN} onChange={e => setUrunAdiEN(e.target.value)} /></label>
            </div>
            <label className="admin__field"><span className="admin__label">Görsel URL *</span><input className="admin__input" value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} /></label>
            <label className="admin__field"><span className="admin__label">Açıklama *</span><textarea className="admin__textarea" value={aciklamaMetin} onChange={e => setAciklamaMetin(e.target.value)} /></label>
            <div className="admin__row">
              <label className="admin__field"><span className="admin__label">Malzemeler (Satır Satır) *</span><textarea className="admin__textarea" value={malzemelerMetin} onChange={e => setMalzemelerMetin(e.target.value)} /></label>
              <label className="admin__field"><span className="admin__label">Yapılış Adımları *</span><textarea className="admin__textarea" value={adimlarMetin} onChange={e => setAdimlarMetin(e.target.value)} /></label>
            </div>
            <div className="admin__row">
              <label className="admin__field"><span className="admin__label">Etiketler (virgülle)</span><input className="admin__input" value={etiketlerMetin} onChange={e => setEtiketlerMetin(e.target.value)} /></label>
              <label className="admin__field"><span className="admin__label">Eşleşmeler (Satır Satır)</span><textarea className="admin__textarea" value={eslesmelerMetin} onChange={e => setEslesmelerMetin(e.target.value)} /></label>
            </div>
            <label className="admin__check" style={{ marginTop: "1rem" }}>
              <input type="checkbox" checked={isUrunMevcut} onChange={e => setIsUrunMevcut(e.target.checked)} />
              <span>Ürün Menüde Gösterilsin</span>
            </label>
            <button className="admin__primary" onClick={() => void kaydetMenuItem()} style={{ marginTop: "1.5rem", width: "100%", padding: "12px", fontSize: "1.1rem" }}>
              {duzenlenenMenuItemId ? "Ürünü Güncelle" : "Ürünü Kaydet ve Yayınla"}
            </button>
         </div>
      )}

      {activeTab === "urun_liste" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Ürün Envanteri</h2>
          </div>
          {menuItems.length === 0 ? <div className="admin__hint">Ürün bulunamadı.</div> : (
            <div className="admin__list" role="list">
              {menuItems.map(m => (
                <div key={m.id} className="admin__listRow" role="listitem">
                  <div className="admin__listTitle">{m.nameTR}</div>
                  <div className="admin__listMeta" style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
                    <span className={`admin__badge ${m.available ? "admin__badge--ok" : "admin__badge--off"}`}>
                      {m.available ? "AKTİF" : "PASİF"}
                    </span>
                    <span className="admin__tags" style={{ flex: 1 }}>Kat: {kategoriMap.get(m.categoryId ?? "")?.nameTR ?? "Yok"}</span>
                    <button className="admin__secondary admin__inlineBtn" onClick={() => void baslatUrunDuzenle(m.id)}>Düzenle</button>
                    <button className="admin__secondary admin__inlineBtn" onClick={() => void degistirUrunAktiflik(m.id, !m.available)}>{m.available ? "Pasife Al" : "Aktif Et"}</button>
                    <button className="admin__secondary admin__inlineBtn" onClick={() => void silMenuItem(m.id)} style={{ backgroundColor: "rgba(220,53,69,0.1)", color: "#ff6b6b", borderColor: "rgba(220,53,69,0.2)" }}>Sil</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
