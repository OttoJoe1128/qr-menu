import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { db, ChangeSet, MenuItem, TemplateId } from "../../db";
import { publishChangeSet } from "../../admin/adminActions";
import { AdminSession } from "../../admin/admin.types";
import "./AdminScreen.css";

type AdminTab = "menu_ekle" | "menu_liste" | "qr_uret";

function createAdminSession(): AdminSession {
  const issuedAt: number = Date.now();
  return {
    adminId: "owner_local",
    role: "OWNER",
    permissions: [
      "VIEW_ADMIN_DASHBOARD",
      "APPROVE_CHANGESET",
      "PUBLISH_CHANGESET",
      "ROLLBACK",
      "VIEW_AUDIT",
      "MANAGE_ADMINS",
    ],
    issuedAt,
    expiresAt: issuedAt + 1000 * 60 * 60 * 12,
  };
}

function parseEtiketler(input: string): string[] {
  const etiketler: string[] = input
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const benzersiz: string[] = Array.from(new Set(etiketler));
  return benzersiz;
}

export default function AdminScreen() {
  const [sekme, setSekme] = useState<AdminTab>("menu_ekle");
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  const [urunAdiTR, setUrunAdiTR] = useState<string>("");
  const [urunAdiEN, setUrunAdiEN] = useState<string>("");
  const [etiketlerMetin, setEtiketlerMetin] = useState<string>("");
  const [isUrunMevcut, setIsUrunMevcut] = useState<boolean>(true);

  const [masaNumarasi, setMasaNumarasi] = useState<string>("1");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const adminSession: AdminSession = useMemo(() => createAdminSession(), []);

  async function yukleMenuItems(): Promise<void> {
    setIsYukleniyor(true);
    const items: MenuItem[] = await db.menuItems.orderBy("updatedAt").reverse().toArray();
    setMenuItems(items);
    setIsYukleniyor(false);
  }

  useEffect(() => {
    void yukleMenuItems();
  }, []);

  async function kaydetMenuItem(): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    const nameTR: string = urunAdiTR.trim();
    if (nameTR.length === 0) {
      setHataMesaji("Ürün adı (TR) zorunludur.");
      return;
    }
    const tags: string[] = parseEtiketler(etiketlerMetin);
    if (tags.length === 0) {
      setHataMesaji("En az 1 etiket giriniz. Örn: tavuk, ana_yemek");
      return;
    }
    const id: string = globalThis.crypto.randomUUID();
    const templateId: TemplateId = "food_detail_v1" as TemplateId;
    const simdi: number = Date.now();
    const menuItem: MenuItem = {
      id,
      nameTR,
      nameEN: urunAdiEN.trim().length > 0 ? urunAdiEN.trim() : undefined,
      templateId,
      recipeId: undefined,
      tags,
      available: isUrunMevcut,
      createdAt: simdi,
      updatedAt: simdi,
    };
    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(),
      status: "approved",
      patches: [{ type: "ADD_MENU_ITEM", payload: menuItem }],
      createdAt: simdi,
      approvedAt: simdi,
      approvedBy: adminSession.adminId,
      baseSnapshotId: undefined,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
    setBasariMesaji("Ürün kaydedildi ve yayınlandı.");
    setUrunAdiTR("");
    setUrunAdiEN("");
    setEtiketlerMetin("");
    setIsUrunMevcut(true);
    await yukleMenuItems();
    setSekme("menu_liste");
  }

  async function uretQrKod(): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    const table: string = masaNumarasi.trim();
    if (table.length === 0) {
      setHataMesaji("Masa numarası zorunludur.");
      return;
    }
    const url: string = `${window.location.origin}/menu?table=${encodeURIComponent(table)}`;
    const dataUrl: string = await QRCode.toDataURL(url, { margin: 2, width: 320 });
    setQrDataUrl(dataUrl);
    setBasariMesaji("QR oluşturuldu.");
  }

  const toplamUrun: number = menuItems.length;

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__title">Admin Panel</div>
        <div className="admin__subtitle">Toplam ürün: {toplamUrun}</div>
      </header>

      <nav className="admin__tabs">
        <button className={`admin__tab ${sekme === "menu_ekle" ? "admin__tab--active" : ""}`} onClick={() => setSekme("menu_ekle")}>
          Menü Ekle
        </button>
        <button className={`admin__tab ${sekme === "menu_liste" ? "admin__tab--active" : ""}`} onClick={() => setSekme("menu_liste")}>
          Menü Liste
        </button>
        <button className={`admin__tab ${sekme === "qr_uret" ? "admin__tab--active" : ""}`} onClick={() => setSekme("qr_uret")}>
          QR Üret
        </button>
      </nav>

      {hataMesaji ? <div className="admin__alert admin__alert--error">{hataMesaji}</div> : null}
      {basariMesaji ? <div className="admin__alert admin__alert--success">{basariMesaji}</div> : null}

      {sekme === "menu_ekle" ? (
        <section className="admin__card">
          <div className="admin__row">
            <label className="admin__field">
              <span className="admin__label">Ürün adı (TR)</span>
              <input className="admin__input" value={urunAdiTR} onChange={(e) => setUrunAdiTR(e.target.value)} placeholder="Örn: Izgara Tavuk" />
            </label>
            <label className="admin__field">
              <span className="admin__label">Ürün adı (EN) (opsiyonel)</span>
              <input className="admin__input" value={urunAdiEN} onChange={(e) => setUrunAdiEN(e.target.value)} placeholder="Grilled Chicken" />
            </label>
          </div>
          <label className="admin__field">
            <span className="admin__label">Etiketler (virgülle)</span>
            <input className="admin__input" value={etiketlerMetin} onChange={(e) => setEtiketlerMetin(e.target.value)} placeholder="örn: ana_yemek, tavuk, izgara" />
          </label>
          <label className="admin__check">
            <input type="checkbox" checked={isUrunMevcut} onChange={(e) => setIsUrunMevcut(e.target.checked)} />
            <span>Ürün menüde görünsün (available)</span>
          </label>
          <button className="admin__primary" onClick={() => void kaydetMenuItem()}>
            Kaydet ve Yayınla
          </button>
          <div className="admin__hint">
            Not: Aynı ürün tekrar eklenmesin diye kayıt öncesi DB kontrolü uygulanır (id ve nameTR+templateId).
          </div>
        </section>
      ) : null}

      {sekme === "menu_liste" ? (
        <section className="admin__card">
          <button className="admin__secondary" onClick={() => void yukleMenuItems()}>
            Listeyi Yenile
          </button>
          {isYukleniyor ? (
            <div className="admin__hint">Yükleniyor...</div>
          ) : menuItems.length === 0 ? (
            <div className="admin__hint">Henüz ürün yok.</div>
          ) : (
            <div className="admin__list" role="list">
              {menuItems.map((m) => (
                <div key={m.id} className="admin__listRow" role="listitem">
                  <div className="admin__listTitle">{m.nameTR}</div>
                  <div className="admin__listMeta">
                    <span className={`admin__badge ${m.available ? "admin__badge--ok" : "admin__badge--off"}`}>
                      {m.available ? "AKTİF" : "PASİF"}
                    </span>
                    <span className="admin__tags">{m.tags.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {sekme === "qr_uret" ? (
        <section className="admin__card">
          <label className="admin__field">
            <span className="admin__label">Masa numarası</span>
            <input className="admin__input" value={masaNumarasi} onChange={(e) => setMasaNumarasi(e.target.value)} placeholder="Örn: 12" />
          </label>
          <button className="admin__primary" onClick={() => void uretQrKod()}>
            QR Oluştur
          </button>
          {qrDataUrl ? (
            <div className="admin__qr">
              <img className="admin__qrImg" src={qrDataUrl} alt="QR Kod" />
              <div className="admin__hint">
                QR linki: <code>{`${window.location.origin}/menu?table=${encodeURIComponent(masaNumarasi.trim())}`}</code>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

