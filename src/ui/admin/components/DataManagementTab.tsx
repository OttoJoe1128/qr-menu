import { useState } from "react";
import { db, ChangeSet, TemplateId } from "../../../db";
import { publishChangeSet } from "../../../admin/adminActions";
import { AdminSession } from "../../../admin/admin.types";
import { fullMenuKategoriler, fullMenuItems } from "../../../dev/fullMenuData";
import { supabase } from "../../../services/supabaseClient"; // <-- BULUT KÖPRÜSÜ

interface Props {
  adminSession: AdminSession;
  onSuccess: () => Promise<void>;
  onError: (msg: string) => void;
}

export default function DataManagementTab({ adminSession, onSuccess, onError }: Props) {
  const [isYukleniyor, setIsYukleniyor] = useState(false);
  const [isSiliyor, setIsSiliyor] = useState(false);

  async function yukleFullMenu(): Promise<void> {
    setIsYukleniyor(true);
    try {
      await seedFullMenuToCloudAndBrowser(adminSession);
      await onSuccess();
    } catch (err: any) {
      console.error(err);
      onError(err.message ?? "Veri yükleme başarısız.");
    } finally {
      setIsYukleniyor(false);
    }
  }

  async function temizleVeritabani(): Promise<void> {
    const onay = window.confirm(
      "⚠️ DİKKAT!\n\nBu işlem TÜM verileri hem YERELDEN hem de BULUTTAN (Supabase) silecektir.\nBu işlem GERİ ALINAMAZ!\n\nDevam etmek istediğinize emin misiniz?"
    );
    if (!onay) return;

    setIsSiliyor(true);
    try {
      // 1. Bulutu Temizle (Supabase)
      await supabase.from('menuItems').delete().neq('id', '0');
      await supabase.from('recipes').delete().neq('id', '0');
      await supabase.from('categories').delete().neq('id', '0');

      // 2. Yereli Temizle (Dexie)
      await db.categories.clear();
      await db.menuItems.clear();
      await db.recipes.clear();
      await db.ratings.clear();
      await db.changeSets.clear();
      await db.snapshots.clear();
      await db.auditEvents.clear();
      
      alert("✅ Veritabanı (Hem Bulut Hem Yerel) başarıyla temizlendi!");
      await onSuccess();
    } catch (err: any) {
      onError(err.message ?? "Veritabanı temizleme başarısız.");
    } finally {
      setIsSiliyor(false);
    }
  }

  return (
    <section className="admin__card">
      <h2>📦 Veri Yönetimi (Bulut Entegreli)</h2>
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#fff3cd", borderRadius: "8px", border: "2px solid #ffc107" }}>
        <h3 style={{ marginTop: 0, color: "#856404" }}>🗑️ Veritabanını Temizle</h3>
        <div className="admin__hint" style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#dc3545" }}>⚠️ DİKKAT:</strong> Bu işlem verileri hem cihazdan hem Supabase'den kalıcı olarak siler!
        </div>
        <button 
          className="admin__secondary" 
          onClick={() => void temizleVeritabani()}
          disabled={isSiliyor}
          style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "12px 24px", fontSize: "16px", fontWeight: "bold" }}
        >
          {isSiliyor ? "🗑️ Siliniyor..." : "🗑️ Tüm Verileri Sil (Yerel + Bulut)"}
        </button>
      </div>

      <div style={{ padding: "20px", backgroundColor: "#d1ecf1", borderRadius: "8px", border: "2px solid #17a2b8" }}>
        <h3 style={{ marginTop: 0, color: "#0c5460" }}>📥 Buluta ve Yerele Tam Menü Yükle</h3>
        <div className="admin__hint">
          <strong>Bu işlem 50 ürünü önce Supabase'e, ardından yerel veritabanına yazar.</strong>
        </div>
        <button 
          className="admin__primary" 
          onClick={() => void yukleFullMenu()}
          disabled={isYukleniyor}
          style={{ marginTop: "20px" }}
        >
          {isYukleniyor ? "⏳ Buluta Yükleniyor..." : "🚀 Buluta Menüyü Yükle (50 Ürün)"}
        </button>
      </div>
    </section>
  );
}

// B2B HYBRID SEED FONKSİYONU: Önce Supabase'e, Sonra Dexie'ye (ChangeSet)
async function seedFullMenuToCloudAndBrowser(adminSession: AdminSession): Promise<void> {
  const simdi = Date.now();
  const currentTenantId = "local_demo_tenant"; // B2B Kiracı ID'si

  // Supabase'e Gönderilecek Veri Dizileri
  const cloudCategories = [];
  const cloudRecipes = [];
  const cloudMenuItems = [];

  // Verileri Hazırlama ve Dexie'ye Yazma
  for (const kat of fullMenuKategoriler) {
    const katPayload = { ...kat, tenantId: currentTenantId, active: true, createdAt: simdi, updatedAt: simdi };
    cloudCategories.push(katPayload);

    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(), tenantId: currentTenantId, status: "approved",
      patches: [{ type: "ADD_CATEGORY", payload: katPayload }],
      createdAt: simdi, approvedAt: simdi, approvedBy: adminSession.adminId,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
  }

  for (const urun of fullMenuItems) {
    const recipeId = globalThis.crypto.randomUUID();
    const menuItemId = globalThis.crypto.randomUUID();
    
    const recipePayload = { id: recipeId, tenantId: currentTenantId, heroImage: urun.heroImage, description: urun.description, ingredients: urun.ingredients, steps: urun.steps, pairings: urun.pairings, chefNotes: urun.chefNotes, createdAt: simdi, updatedAt: simdi };
    const itemPayload = { id: menuItemId, tenantId: currentTenantId, nameTR: urun.nameTR, nameEN: urun.nameEN, templateId: "food_detail_v1" as TemplateId, categoryId: urun.categoryId, recipeId: recipeId, tags: urun.tags, available: true, price: 0, createdAt: simdi, updatedAt: simdi };
    
    cloudRecipes.push(recipePayload);
    cloudMenuItems.push(itemPayload);

    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(), tenantId: currentTenantId, status: "approved",
      patches: [{ type: "ADD_RECIPE", payload: recipePayload }, { type: "ADD_MENU_ITEM", payload: itemPayload }],
      createdAt: simdi, approvedAt: simdi, approvedBy: adminSession.adminId,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
  }

  // BULUTA TOPLU (BULK) YAZMA İŞLEMİ
  const { error: catErr } = await supabase.from('categories').insert(cloudCategories);
  if (catErr) throw new Error("Supabase Kategorileri yüklenemedi: " + catErr.message);

  const { error: recErr } = await supabase.from('recipes').insert(cloudRecipes);
  if (recErr) throw new Error("Supabase Tarifleri yüklenemedi: " + recErr.message);

  const { error: itemErr } = await supabase.from('menuItems').insert(cloudMenuItems);
  if (itemErr) throw new Error("Supabase Ürünleri yüklenemedi: " + itemErr.message);
}
