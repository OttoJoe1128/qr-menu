import { useState } from "react";
import { db, ChangeSet, TemplateId } from "../../../db";
import { publishChangeSet } from "../../../admin/adminActions";
import { AdminSession } from "../../../admin/admin.types";
import { fullMenuKategoriler, fullMenuItems } from "../../../dev/fullMenuData";

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
      await seedFullMenuToBrowser(adminSession);
      await onSuccess();
    } catch (err: any) {
      onError(err.message ?? "Veri yükleme başarısız.");
    } finally {
      setIsYukleniyor(false);
    }
  }

  async function temizleVeritabani(): Promise<void> {
    const onay = window.confirm(
      "⚠️ DİKKAT!\n\nBu işlem TÜM verileri silecek:\n• Tüm kategoriler\n• Tüm menü öğeleri\n• Tüm recipe'ler\n• Tüm puanlar\n• Tüm changeset'ler\n\nBu işlem GERİ ALINAMAZ!\n\nDevam etmek istediğinize emin misiniz?"
    );
    if (!onay) return;

    setIsSiliyor(true);
    try {
      await db.categories.clear();
      await db.menuItems.clear();
      await db.recipes.clear();
      await db.ratings.clear();
      await db.changeSets.clear();
      await db.snapshots.clear();
      await db.auditEvents.clear();
      
      alert("✅ Veritabanı başarıyla temizlendi!\n\nŞimdi yeni verileri yükleyebilirsiniz.");
      await onSuccess();
    } catch (err: any) {
      onError(err.message ?? "Veritabanı temizleme başarısız.");
    } finally {
      setIsSiliyor(false);
    }
  }

  return (
    <section className="admin__card">
      <h2>📦 Veri Yönetimi</h2>
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#fff3cd", borderRadius: "8px", border: "2px solid #ffc107" }}>
        <h3 style={{ marginTop: 0, color: "#856404" }}>🗑️ Veritabanını Temizle</h3>
        <div className="admin__hint" style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#dc3545" }}>⚠️ DİKKAT:</strong> Bu işlem tüm verileri kalıcı olarak siler!
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>Bu işlem geri alınamaz! Devam etmeden önce emin olun.</p>
        </div>
        <button 
          className="admin__secondary" 
          onClick={() => void temizleVeritabani()}
          disabled={isSiliyor}
          style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "12px 24px", fontSize: "16px", fontWeight: "bold" }}
        >
          {isSiliyor ? "🗑️ Siliniyor..." : "🗑️ Tüm Verileri Sil"}
        </button>
      </div>

      <div style={{ padding: "20px", backgroundColor: "#d1ecf1", borderRadius: "8px", border: "2px solid #17a2b8" }}>
        <h3 style={{ marginTop: 0, color: "#0c5460" }}>📥 Tam Menü Verilerini Yükle</h3>
        <div className="admin__hint">
          <strong>Bu işlem browser veritabanına tüm menü verilerini yükler.</strong>
          <p style={{ marginTop: "10px", color: "#0c5460" }}>⏱️ Yaklaşık 10-15 saniye sürebilir.</p>
        </div>
        <button 
          className="admin__primary" 
          onClick={() => void yukleFullMenu()}
          disabled={isYukleniyor}
          style={{ marginTop: "20px" }}
        >
          {isYukleniyor ? "⏳ Yükleniyor..." : "🚀 Tüm Menüyü Yükle (50 Ürün)"}
        </button>
      </div>
    </section>
  );
}

async function seedFullMenuToBrowser(adminSession: AdminSession): Promise<void> {
  const simdi = Date.now();
  for (const kat of fullMenuKategoriler) {
    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(),
      status: "approved",
      patches: [{ type: "ADD_CATEGORY", payload: { ...kat, active: true, createdAt: simdi, updatedAt: simdi } }],
      createdAt: simdi, approvedAt: simdi, approvedBy: adminSession.adminId,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
  }

  for (const urun of fullMenuItems) {
    const recipeId = globalThis.crypto.randomUUID();
    const menuItemId = globalThis.crypto.randomUUID();
    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(),
      status: "approved",
      patches: [
        { type: "ADD_RECIPE", payload: { id: recipeId, heroImage: urun.heroImage, description: urun.description, ingredients: urun.ingredients, steps: urun.steps, pairings: urun.pairings, chefNotes: urun.chefNotes, createdAt: simdi, updatedAt: simdi } },
        { type: "ADD_MENU_ITEM", payload: { id: menuItemId, nameTR: urun.nameTR, nameEN: urun.nameEN, templateId: "food_detail_v1" as TemplateId, categoryId: urun.categoryId, recipeId: recipeId, tags: urun.tags, available: true, createdAt: simdi, updatedAt: simdi } }
      ],
      createdAt: simdi, approvedAt: simdi, approvedBy: adminSession.adminId,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
  }
}
