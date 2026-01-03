import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { db, ChangeSet, MenuCategory, MenuItem, MenuRating, Recipe, TemplateId } from "../../db";
import { publishChangeSet } from "../../admin/adminActions";
import { AdminSession } from "../../admin/admin.types";
import { fullMenuKategoriler, fullMenuItems } from "../../dev/fullMenuData";
import "./AdminScreen.css";

type AdminTab = "kategori" | "urun_ekle" | "urun_liste" | "puanlar" | "qr_uret" | "veri_yukle";

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

function parseSatirlar(input: string): string[] {
  const satirlar: string[] = input
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return satirlar;
}

function createSlug(input: string): string {
  const trMap: Record<string, string> = {
    ı: "i",
    İ: "i",
    ş: "s",
    Ş: "s",
    ğ: "g",
    Ğ: "g",
    ü: "u",
    Ü: "u",
    ö: "o",
    Ö: "o",
    ç: "c",
    Ç: "c",
  };
  const raw: string = input
    .split("")
    .map((c) => trMap[c] ?? c)
    .join("")
    .toLowerCase()
    .trim();
  const slug: string = raw
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug;
}

export default function AdminScreen() {
  const [sekme, setSekme] = useState<AdminTab>("kategori");
  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [kategoriler, setKategoriler] = useState<MenuCategory[]>([]);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  const [duzenlenenKategoriId, setDuzenlenenKategoriId] = useState<string | null>(null);
  const [kategoriAdiTR, setKategoriAdiTR] = useState<string>("");
  const [kategoriAdiEN, setKategoriAdiEN] = useState<string>("");
  const [kategoriGorselUrl, setKategoriGorselUrl] = useState<string>("");
  const [kategoriSira, setKategoriSira] = useState<number>(1);
  const [isKategoriAktif, setIsKategoriAktif] = useState<boolean>(true);

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

  const [masaNumarasi, setMasaNumarasi] = useState<string>("1");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const adminSession: AdminSession = useMemo(() => createAdminSession(), []);

  async function yukleAdminVeri(): Promise<void> {
    setIsYukleniyor(true);
    const [items, cats, ratings, rcp]: [MenuItem[], MenuCategory[], MenuRating[], Recipe[]] = await Promise.all([
      db.menuItems.orderBy("updatedAt").reverse().toArray(),
      db.categories.orderBy("sortOrder").toArray(),
      db.ratings.toArray(),
      db.recipes.orderBy("updatedAt").reverse().toArray(),
    ]);
    setMenuItems(items);
    setKategoriler(cats);
    setPuanlar(ratings);
    setRecipes(rcp);
    setIsYukleniyor(false);
  }

  useEffect(() => {
    void yukleAdminVeri();
  }, []);

  function temizleKategoriForm(): void {
    setDuzenlenenKategoriId(null);
    setKategoriAdiTR("");
    setKategoriAdiEN("");
    setKategoriGorselUrl("");
    setKategoriSira(1);
    setIsKategoriAktif(true);
  }

  function temizleUrunForm(): void {
    setDuzenlenenMenuItemId(null);
    setDuzenlenenRecipeId(null);
    setSeciliKategoriId("");
    setUrunAdiTR("");
    setUrunAdiEN("");
    setEtiketlerMetin("");
    setHeroImageUrl("");
    setAciklamaMetin("");
    setMalzemelerMetin("");
    setAdimlarMetin("");
    setEslesmelerMetin("");
    setSefNotlariMetin("");
    setIsUrunMevcut(true);
  }

  async function kaydetKategori(): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    const nameTR: string = kategoriAdiTR.trim();
    if (nameTR.length === 0) {
      setHataMesaji("Kategori adı (TR) zorunludur.");
      return;
    }
    const slug: string = createSlug(nameTR);
    if (slug.length === 0) {
      setHataMesaji("Kategori slug üretilemedi. Lütfen farklı bir kategori adı giriniz.");
      return;
    }
    const simdi: number = Date.now();
    const kategori: MenuCategory = {
      id: duzenlenenKategoriId ?? globalThis.crypto.randomUUID(),
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
      id: globalThis.crypto.randomUUID(),
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
    await yukleAdminVeri();
    setSekme("urun_ekle");
    if (!seciliKategoriId) {
      setSeciliKategoriId(kategori.id);
    }
  }

  async function baslatKategoriDuzenle(kategoriId: string): Promise<void> {
    const kategori: MenuCategory | undefined = kategoriler.find((k) => k.id === kategoriId);
    if (!kategori) {
      return;
    }
    setDuzenlenenKategoriId(kategori.id);
    setKategoriAdiTR(kategori.nameTR);
    setKategoriAdiEN(kategori.nameEN ?? "");
    setKategoriGorselUrl(kategori.imageUrl ?? "");
    setKategoriSira(kategori.sortOrder);
    setIsKategoriAktif(kategori.active);
    setSekme("kategori");
  }

  async function silKategori(kategoriId: string): Promise<void> {
    const kategori: MenuCategory | undefined = kategoriler.find((k) => k.id === kategoriId);
    if (!kategori) {
      setHataMesaji("Kategori bulunamadı.");
      return;
    }
    
    const bagliUrunler: MenuItem[] = menuItems.filter((m) => m.categoryId === kategoriId);
    const onayMesaji = bagliUrunler.length > 0
      ? `⚠️ Bu kategoriye bağlı ${bagliUrunler.length} ürün var!\n\nKategoriyi silmek istediğinize emin misiniz?\n(Ürünler silinmeyecek, sadece kategori bağlantısı kaldırılacak)`
      : `"${kategori.nameTR}" kategorisini silmek istediğinize emin misiniz?`;
    
    if (!window.confirm(onayMesaji)) {
      return;
    }

    setHataMesaji(null);
    setBasariMesaji(null);
    
    try {
      await db.categories.delete(kategoriId);
      setBasariMesaji(`"${kategori.nameTR}" kategorisi silindi.`);
      await yukleAdminVeri();
    } catch (err: any) {
      setHataMesaji(err.message ?? "Kategori silinemedi.");
    }
  }

  async function silMenuItem(menuItemId: string): Promise<void> {
    const item: MenuItem | undefined = menuItems.find((m) => m.id === menuItemId);
    if (!item) {
      setHataMesaji("Ürün bulunamadı.");
      return;
    }
    
    if (!window.confirm(`"${item.nameTR}" ürünü ve ilgili recipe'yi silmek istediğinize emin misiniz?`)) {
      return;
    }

    setHataMesaji(null);
    setBasariMesaji(null);
    
    try {
      // Önce recipe'yi sil
      if (item.recipeId) {
        await db.recipes.delete(item.recipeId);
      }
      // Sonra menu item'ı sil
      await db.menuItems.delete(menuItemId);
      setBasariMesaji(`"${item.nameTR}" ürünü silindi.`);
      await yukleAdminVeri();
    } catch (err: any) {
      setHataMesaji(err.message ?? "Ürün silinemedi.");
    }
  }

  async function kaydetMenuItem(): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    if (!seciliKategoriId) {
      setHataMesaji("Önce bir kategori seçiniz.");
      return;
    }
    const nameTR: string = urunAdiTR.trim();
    if (nameTR.length === 0) {
      setHataMesaji("Ürün adı (TR) zorunludur.");
      return;
    }
    const heroImage: string = heroImageUrl.trim();
    if (heroImage.length === 0) {
      setHataMesaji("Görsel URL (heroImage) zorunludur.");
      return;
    }
    const description: string = aciklamaMetin.trim();
    if (description.length === 0) {
      setHataMesaji("Açıklama zorunludur.");
      return;
    }
    const ingredients: string[] = parseSatirlar(malzemelerMetin);
    if (ingredients.length === 0) {
      setHataMesaji("Malzemeler (en az 1 satır) zorunludur.");
      return;
    }
    const steps: string[] = parseSatirlar(adimlarMetin);
    if (steps.length === 0) {
      setHataMesaji("Yapılış adımları (en az 1 satır) zorunludur.");
      return;
    }
    const tags: string[] = parseEtiketler(etiketlerMetin);
    const id: string = duzenlenenMenuItemId ?? globalThis.crypto.randomUUID();
    const templateId: TemplateId = "food_detail_v1" as TemplateId;
    const simdi: number = Date.now();
    const recipeId: string = duzenlenenRecipeId ?? globalThis.crypto.randomUUID();
    const recipe: Recipe = {
      id: recipeId,
      heroImage,
      description,
      ingredients,
      steps,
      pairings: parseSatirlar(eslesmelerMetin),
      chefNotes: sefNotlariMetin.trim().length > 0 ? sefNotlariMetin.trim() : undefined,
      notes: undefined,
      createdAt: simdi,
      updatedAt: simdi,
    };
    const menuItem: MenuItem = {
      id,
      nameTR,
      nameEN: urunAdiEN.trim().length > 0 ? urunAdiEN.trim() : undefined,
      templateId,
      recipeId,
      categoryId: seciliKategoriId,
      tags,
      available: isUrunMevcut,
      createdAt: simdi,
      updatedAt: simdi,
    };
    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(),
      status: "approved",
      patches: duzenlenenMenuItemId
        ? [
            { type: "UPDATE_RECIPE", payload: recipe },
            { type: "UPDATE_MENU_ITEM", payload: menuItem },
          ]
        : [
            { type: "ADD_RECIPE", payload: recipe },
            { type: "ADD_MENU_ITEM", payload: menuItem },
          ],
      createdAt: simdi,
      approvedAt: simdi,
      approvedBy: adminSession.adminId,
      baseSnapshotId: undefined,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
    setBasariMesaji(duzenlenenMenuItemId ? "Ürün güncellendi ve yayınlandı." : "Ürün kaydedildi ve yayınlandı.");
    temizleUrunForm();
    await yukleAdminVeri();
    setSekme("urun_liste");
  }

  async function baslatUrunDuzenle(menuItemId: string): Promise<void> {
    const item: MenuItem | undefined = menuItems.find((m) => m.id === menuItemId);
    if (!item) {
      return;
    }
    const rcp: Recipe | undefined = item.recipeId ? recipes.find((r) => r.id === item.recipeId) : undefined;
    setDuzenlenenMenuItemId(item.id);
    setDuzenlenenRecipeId(item.recipeId ?? null);
    setSeciliKategoriId(item.categoryId ?? "");
    setUrunAdiTR(item.nameTR);
    setUrunAdiEN(item.nameEN ?? "");
    setEtiketlerMetin(item.tags.join(", "));
    setIsUrunMevcut(item.available);
    setHeroImageUrl(rcp?.heroImage ?? "");
    setAciklamaMetin(rcp?.description ?? "");
    setMalzemelerMetin(rcp ? rcp.ingredients.join("\n") : "");
    setAdimlarMetin(rcp ? rcp.steps.join("\n") : "");
    setEslesmelerMetin(rcp?.pairings ? rcp.pairings.join("\n") : "");
    setSefNotlariMetin(rcp?.chefNotes ?? "");
    setSekme("urun_ekle");
  }

  async function degistirUrunAktiflik(menuItemId: string, yeniDurum: boolean): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    const item: MenuItem | undefined = await db.menuItems.get(menuItemId);
    if (!item) {
      setHataMesaji("Ürün bulunamadı.");
      return;
    }
    const simdi: number = Date.now();
    const guncel: MenuItem = { ...item, available: yeniDurum, updatedAt: simdi };
    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(),
      status: "approved",
      patches: [{ type: "UPDATE_MENU_ITEM", payload: guncel }],
      createdAt: simdi,
      approvedAt: simdi,
      approvedBy: adminSession.adminId,
      baseSnapshotId: undefined,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
    setBasariMesaji("Ürün durumu güncellendi.");
    await yukleAdminVeri();
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

  async function uretKategoriQrKod(kategoriSlug: string, kategoriAdi: string): Promise<void> {
    const url: string = `${window.location.origin}/menu/day?category=${encodeURIComponent(kategoriSlug)}`;
    const dataUrl: string = await QRCode.toDataURL(url, { margin: 2, width: 400 });
    
    // QR kodu yeni sekmede göster
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Kod - ${kategoriAdi}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
            }
            h1 {
              margin: 0 0 10px 0;
              color: #2d3748;
              font-size: 32px;
            }
            p {
              margin: 0 0 30px 0;
              color: #718096;
              font-size: 16px;
            }
            img {
              max-width: 400px;
              width: 100%;
              height: auto;
              border-radius: 10px;
            }
            .url {
              margin-top: 20px;
              padding: 15px;
              background: #f7fafc;
              border-radius: 8px;
              font-size: 12px;
              color: #4a5568;
              word-break: break-all;
            }
            .buttons {
              margin-top: 20px;
              display: flex;
              gap: 10px;
              justify-content: center;
            }
            button {
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            }
            .print-btn {
              background: #667eea;
              color: white;
            }
            .print-btn:hover {
              background: #5568d3;
            }
            .download-btn {
              background: #48bb78;
              color: white;
            }
            .download-btn:hover {
              background: #38a169;
            }
            @media print {
              body {
                background: white;
              }
              .buttons {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${kategoriAdi}</h1>
            <p>Menü QR Kodu</p>
            <img src="${dataUrl}" alt="QR Kod" />
            <div class="url">${url}</div>
            <div class="buttons">
              <button class="print-btn" onclick="window.print()">🖨️ Yazdır</button>
              <button class="download-btn" onclick="downloadQR()">⬇️ İndir</button>
            </div>
          </div>
          <script>
            function downloadQR() {
              const link = document.createElement('a');
              link.download = 'qr-${kategoriSlug}.png';
              link.href = '${dataUrl}';
              link.click();
            }
          </script>
        </body>
        </html>
      `);
    }
    setBasariMesaji(`${kategoriAdi} için QR kod oluşturuldu.`);
  }

  const toplamUrun: number = menuItems.length;
  const toplamKategori: number = kategoriler.length;

  const kategoriMap = useMemo((): Map<string, MenuCategory> => {
    const map: Map<string, MenuCategory> = new Map();
    for (const k of kategoriler) {
      map.set(k.id, k);
    }
    return map;
  }, [kategoriler]);

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

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__title">Admin Panel</div>
        <div className="admin__subtitle">
          Kategori: {toplamKategori} • Ürün: {toplamUrun}
        </div>
        <button 
          className="admin__secondary" 
          onClick={() => window.location.href = "/"}
          style={{ position: "absolute", right: "20px", top: "20px" }}
        >
          ← Ana Sayfa
        </button>
      </header>

      <nav className="admin__tabs">
        <button className={`admin__tab ${sekme === "kategori" ? "admin__tab--active" : ""}`} onClick={() => setSekme("kategori")}>
          Kategoriler
        </button>
        <button className={`admin__tab ${sekme === "urun_ekle" ? "admin__tab--active" : ""}`} onClick={() => setSekme("urun_ekle")}>
          Ürün Ekle
        </button>
        <button className={`admin__tab ${sekme === "urun_liste" ? "admin__tab--active" : ""}`} onClick={() => setSekme("urun_liste")}>
          Ürünler
        </button>
        <button className={`admin__tab ${sekme === "puanlar" ? "admin__tab--active" : ""}`} onClick={() => setSekme("puanlar")}>
          Puanlar
        </button>
        <button className={`admin__tab ${sekme === "qr_uret" ? "admin__tab--active" : ""}`} onClick={() => setSekme("qr_uret")}>
          QR Üret
        </button>
        <button className={`admin__tab ${sekme === "veri_yukle" ? "admin__tab--active" : ""}`} onClick={() => setSekme("veri_yukle")}>
          📦 Veri Yükle
        </button>
      </nav>

      {hataMesaji ? <div className="admin__alert admin__alert--error">{hataMesaji}</div> : null}
      {basariMesaji ? <div className="admin__alert admin__alert--success">{basariMesaji}</div> : null}

      {sekme === "kategori" ? (
        <section className="admin__card">
          <button className="admin__secondary" onClick={() => temizleKategoriForm()}>
            Yeni Kategori
          </button>
          <label className="admin__field">
            <span className="admin__label">Kategori adı (TR)</span>
            <input className="admin__input" value={kategoriAdiTR} onChange={(e) => setKategoriAdiTR(e.target.value)} placeholder="Örn: Ana Yemek" />
          </label>
          <div className="admin__row">
            <label className="admin__field">
              <span className="admin__label">Kategori adı (EN) (opsiyonel)</span>
              <input className="admin__input" value={kategoriAdiEN} onChange={(e) => setKategoriAdiEN(e.target.value)} placeholder="Main Courses" />
            </label>
            <label className="admin__field">
              <span className="admin__label">Sıra</span>
              <input className="admin__input" value={String(kategoriSira)} onChange={(e) => setKategoriSira(Number(e.target.value))} placeholder="1" />
            </label>
          </div>
          <label className="admin__field">
            <span className="admin__label">Görsel URL (opsiyonel)</span>
            <input className="admin__input" value={kategoriGorselUrl} onChange={(e) => setKategoriGorselUrl(e.target.value)} placeholder="https://..." />
          </label>
          <label className="admin__check">
            <input type="checkbox" checked={isKategoriAktif} onChange={(e) => setIsKategoriAktif(e.target.checked)} />
            <span>Kategori aktif</span>
          </label>
          <button className="admin__primary" onClick={() => void kaydetKategori()}>
            {duzenlenenKategoriId ? "Kategoriyi Güncelle ve Yayınla" : "Kategoriyi Kaydet ve Yayınla"}
          </button>
          <div className="admin__hint">
            Not: Kategori kaydı ChangeSet üzerinden yayınlanır ve snapshot üretir.
          </div>
          <div className="admin__hint">Mevcut kategoriler:</div>
          {isYukleniyor ? (
            <div className="admin__hint">Yükleniyor...</div>
          ) : kategoriler.length === 0 ? (
            <div className="admin__hint">Henüz kategori yok.</div>
          ) : (
            <div className="admin__list" role="list">
              {kategoriler.map((k) => (
                <div key={k.id} className="admin__listRow" role="listitem">
                  <div className="admin__listTitle">{k.nameTR}</div>
                  <div className="admin__listMeta">
                    <span className={`admin__badge ${k.active ? "admin__badge--ok" : "admin__badge--off"}`}>
                      {k.active ? "AKTİF" : "PASİF"}
                    </span>
                    <span className="admin__tags">slug: {k.slug} • sıra: {k.sortOrder}</span>
                    <button className="admin__secondary admin__inlineBtn" onClick={() => void baslatKategoriDuzenle(k.id)}>
                      Düzenle
                    </button>
                    <button 
                      className="admin__secondary admin__inlineBtn" 
                      onClick={() => void silKategori(k.id)}
                      style={{ backgroundColor: "#dc3545", color: "white" }}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {sekme === "urun_ekle" ? (
        <section className="admin__card">
          <button className="admin__secondary" onClick={() => temizleUrunForm()}>
            Yeni Ürün
          </button>
          <label className="admin__field">
            <span className="admin__label">Kategori</span>
            <select className="admin__input" value={seciliKategoriId} onChange={(e) => setSeciliKategoriId(e.target.value)}>
              <option value="">Kategori seçiniz</option>
              {kategoriler.filter((k) => k.active).map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nameTR}
                </option>
              ))}
            </select>
          </label>
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
            <span className="admin__label">Etiketler (virgülle) (opsiyonel)</span>
            <input className="admin__input" value={etiketlerMetin} onChange={(e) => setEtiketlerMetin(e.target.value)} placeholder="örn: tavuk, izgara, acılı" />
          </label>
          <label className="admin__field">
            <span className="admin__label">Görsel URL (heroImage)</span>
            <input className="admin__input" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://..." />
          </label>
          <label className="admin__field">
            <span className="admin__label">Açıklama</span>
            <textarea className="admin__textarea" value={aciklamaMetin} onChange={(e) => setAciklamaMetin(e.target.value)} placeholder="Kısa, iştah açan açıklama" />
          </label>
          <label className="admin__field">
            <span className="admin__label">Malzemeler (her satır 1 madde)</span>
            <textarea className="admin__textarea" value={malzemelerMetin} onChange={(e) => setMalzemelerMetin(e.target.value)} placeholder={"Tavuk\nZeytinyağı\nBaharat karışımı"} />
          </label>
          <label className="admin__field">
            <span className="admin__label">Yapılış adımları (her satır 1 adım)</span>
            <textarea className="admin__textarea" value={adimlarMetin} onChange={(e) => setAdimlarMetin(e.target.value)} placeholder={"Marine et\nIzgarayı ısıt\nPişir ve servis et"} />
          </label>
          <label className="admin__field">
            <span className="admin__label">Eşleşmeler (opsiyonel, her satır 1 öneri)</span>
            <textarea className="admin__textarea" value={eslesmelerMetin} onChange={(e) => setEslesmelerMetin(e.target.value)} placeholder={"Ayran\nMevsim salata"} />
          </label>
          <label className="admin__field">
            <span className="admin__label">Şef notları (opsiyonel)</span>
            <textarea className="admin__textarea" value={sefNotlariMetin} onChange={(e) => setSefNotlariMetin(e.target.value)} placeholder="Örn: Sosu ayrı isteyebilirsiniz." />
          </label>
          <label className="admin__check">
            <input type="checkbox" checked={isUrunMevcut} onChange={(e) => setIsUrunMevcut(e.target.checked)} />
            <span>Ürün menüde görünsün (available)</span>
          </label>
          <button className="admin__primary" onClick={() => void kaydetMenuItem()}>
            {duzenlenenMenuItemId ? "Ürünü Güncelle ve Yayınla" : "Ürünü Kaydet ve Yayınla"}
          </button>
          <div className="admin__hint">
            Not: Ürün kaydı ChangeSet üzerinden yayınlanır; tekrar ekleme kontrolü DB katmanında yapılır.
          </div>
        </section>
      ) : null}

      {sekme === "urun_liste" ? (
        <section className="admin__card">
          <button className="admin__secondary" onClick={() => void yukleAdminVeri()}>
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
                    <span className="admin__tags">
                      kategori: {m.categoryId ? (kategoriMap.get(m.categoryId)?.nameTR ?? "Bilinmiyor") : "Yok"} •{" "}
                      etiket: {m.tags.join(", ")}
                    </span>
                    <button className="admin__secondary admin__inlineBtn" onClick={() => void baslatUrunDuzenle(m.id)}>
                      Düzenle
                    </button>
                    <button
                      className="admin__secondary admin__inlineBtn"
                      onClick={() => void degistirUrunAktiflik(m.id, !m.available)}
                    >
                      {m.available ? "Pasife Al" : "Aktif Et"}
                    </button>
                    <button 
                      className="admin__secondary admin__inlineBtn" 
                      onClick={() => void silMenuItem(m.id)}
                      style={{ backgroundColor: "#dc3545", color: "white" }}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {sekme === "puanlar" ? (
        <section className="admin__card">
          <button className="admin__secondary" onClick={() => void yukleAdminVeri()}>
            Puanları Yenile
          </button>
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
          <div className="admin__hint">
            Not: Aynı masa session’ı aynı ürünü tekrar puanlarsa yeni kayıt eklemek yerine güncellenir.
          </div>
        </section>
      ) : null}

      {sekme === "qr_uret" ? (
        <section className="admin__card">
          <h2>🔗 QR Kod Üretimi</h2>
          
          {/* Masa QR Kodu */}
          <div style={{ marginBottom: "40px", padding: "20px", backgroundColor: "#f0f9ff", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
            <h3 style={{ marginTop: 0, color: "#1e40af" }}>Masa QR Kodu</h3>
            <div className="admin__hint" style={{ marginBottom: "15px" }}>
              Masa numarasına özel QR kod oluşturun
            </div>
            <label className="admin__field">
              <span className="admin__label">Masa numarası</span>
              <input className="admin__input" value={masaNumarasi} onChange={(e) => setMasaNumarasi(e.target.value)} placeholder="Örn: 12" />
            </label>
            <button className="admin__primary" onClick={() => void uretQrKod()}>
              📱 Masa QR Oluştur
            </button>
            {qrDataUrl ? (
              <div className="admin__qr">
                <img className="admin__qrImg" src={qrDataUrl} alt="QR Kod" />
                <div className="admin__hint">
                  QR linki: <code>{`${window.location.origin}/menu?table=${encodeURIComponent(masaNumarasi.trim())}`}</code>
                </div>
              </div>
            ) : null}
          </div>

          {/* Kategori QR Kodları */}
          <div style={{ padding: "20px", backgroundColor: "#fef3c7", borderRadius: "12px", border: "1px solid #fde68a" }}>
            <h3 style={{ marginTop: 0, color: "#92400e" }}>Kategori QR Kodları</h3>
            <div className="admin__hint" style={{ marginBottom: "15px" }}>
              Her kategori için ayrı QR kod oluşturun. QR kod tarandığında direkt o kategoriye gider.
            </div>
            
            {kategoriler.filter(k => k.active).length === 0 ? (
              <div className="admin__hint">Henüz aktif kategori yok.</div>
            ) : (
              <div className="admin__list" role="list">
                {kategoriler.filter(k => k.active).map((k) => (
                  <div key={k.id} className="admin__listRow" role="listitem">
                    <div className="admin__listTitle">{k.nameTR}</div>
                    <div className="admin__listMeta">
                      <span className="admin__tags">{k.slug}</span>
                      <button 
                        className="admin__secondary admin__inlineBtn" 
                        onClick={() => void uretKategoriQrKod(k.slug, k.nameTR)}
                        style={{ backgroundColor: "#f59e0b", color: "white" }}
                      >
                        📱 QR Üret
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Genel Menü QR */}
          <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
            <h3 style={{ marginTop: 0, color: "#166534" }}>Genel Menü QR</h3>
            <div className="admin__hint" style={{ marginBottom: "15px" }}>
              Tüm kategorileri gösteren ana menü QR kodu
            </div>
            <button 
              className="admin__primary" 
              onClick={() => void uretKategoriQrKod("tum-menu", "Tam Menü")}
              style={{ backgroundColor: "#10b981" }}
            >
              📱 Ana Menü QR Oluştur
            </button>
          </div>
        </section>
      ) : null}

      {sekme === "veri_yukle" ? (
        <VeriYukleTab 
          adminSession={adminSession}
          onSuccess={async () => {
            setBasariMesaji("Veriler başarıyla yüklendi!");
            await yukleAdminVeri();
            setSekme("urun_liste");
          }}
          onError={(msg) => setHataMesaji(msg)}
        />
      ) : null}
    </div>
  );
}

function VeriYukleTab({ adminSession, onSuccess, onError }: { adminSession: AdminSession, onSuccess: () => void, onError: (msg: string) => void }) {
  const [isYukleniyor, setIsYukleniyor] = useState(false);
  const [isSiliyor, setIsSiliyor] = useState(false);

  async function yukleFullMenu(): Promise<void> {
    setIsYukleniyor(true);
    try {
      await seedFullMenuToBrowser(adminSession);
      onSuccess();
    } catch (err: any) {
      onError(err.message ?? "Veri yükleme başarısız.");
    } finally {
      setIsYukleniyor(false);
    }
  }

  async function temizleVeritabani(): Promise<void> {
    const onay = window.confirm(
      "⚠️ DİKKAT!\n\n" +
      "Bu işlem TÜM verileri silecek:\n" +
      "• Tüm kategoriler\n" +
      "• Tüm menü öğeleri\n" +
      "• Tüm recipe'ler\n" +
      "• Tüm puanlar\n" +
      "• Tüm changeset'ler\n\n" +
      "Bu işlem GERİ ALINAMAZ!\n\n" +
      "Devam etmek istediğinize emin misiniz?"
    );
    
    if (!onay) {
      return;
    }

    setIsSiliyor(true);
    try {
      // Tüm tabloları temizle
      await db.categories.clear();
      await db.menuItems.clear();
      await db.recipes.clear();
      await db.ratings.clear();
      await db.changeSets.clear();
      await db.snapshots.clear();
      await db.auditEvents.clear();
      
      alert("✅ Veritabanı başarıyla temizlendi!\n\nŞimdi yeni verileri yükleyebilirsiniz.");
      onSuccess();
    } catch (err: any) {
      onError(err.message ?? "Veritabanı temizleme başarısız.");
    } finally {
      setIsSiliyor(false);
    }
  }

  return (
    <section className="admin__card">
      <h2>📦 Veri Yönetimi</h2>
      
      {/* TEMİZLE BÖLÜMÜ */}
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#fff3cd", borderRadius: "8px", border: "2px solid #ffc107" }}>
        <h3 style={{ marginTop: 0, color: "#856404" }}>🗑️ Veritabanını Temizle</h3>
        <div className="admin__hint" style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#dc3545" }}>⚠️ DİKKAT:</strong> Bu işlem tüm verileri kalıcı olarak siler!
          <ul style={{ marginTop: "10px", marginLeft: "20px", color: "#856404" }}>
            <li>Tüm kategoriler silinecek</li>
            <li>Tüm menü öğeleri silinecek</li>
            <li>Tüm recipe'ler silinecek</li>
            <li>Tüm puanlar silinecek</li>
          </ul>
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>
            Bu işlem geri alınamaz! Devam etmeden önce emin olun.
          </p>
        </div>
        <button 
          className="admin__secondary" 
          onClick={() => void temizleVeritabani()}
          disabled={isSiliyor}
          style={{ 
            backgroundColor: "#dc3545", 
            color: "white",
            border: "none",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          {isSiliyor ? "🗑️ Siliniyor..." : "🗑️ Tüm Verileri Sil"}
        </button>
      </div>

      {/* YÜKLEME BÖLÜMÜ */}
      <div style={{ padding: "20px", backgroundColor: "#d1ecf1", borderRadius: "8px", border: "2px solid #17a2b8" }}>
        <h3 style={{ marginTop: 0, color: "#0c5460" }}>📥 Tam Menü Verilerini Yükle</h3>
        <div className="admin__hint">
          <strong>Bu işlem browser veritabanına tüm menü verilerini yükler:</strong>
          <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
            <li><strong>10 Kategori:</strong> Kahvaltı, Çorbalar, Başlangıçlar, Salatalar, Phuket İmza Yemekleri, Deniz Ürünleri, Batı Ana Yemekleri, Comfort Food, Makarnalar, Tatlılar</li>
            <li><strong>50 Recipe:</strong> Her ürün için detaylı malzemeler, adımlar, eşleştirmeler ve şef notları</li>
            <li><strong>50 Menü Öğesi:</strong> Tüm kategorilere dağıtılmış ürünler</li>
          </ul>
          <p style={{ marginTop: "10px", color: "#0c5460" }}>
            ⏱️ Bu işlem biraz zaman alabilir (yaklaşık 10-15 saniye). Lütfen bekleyin...
          </p>
          <p style={{ marginTop: "10px", fontWeight: "bold", color: "#856404" }}>
            💡 İpucu: Eğer daha önce veri yüklediyseniz, önce "Tüm Verileri Sil" butonuna basın, sonra yeniden yükleyin.
          </p>
        </div>
        <button 
          className="admin__primary" 
          onClick={() => void yukleFullMenu()}
          disabled={isYukleniyor}
          style={{ marginTop: "20px" }}
        >
          {isYukleniyor ? "⏳ Yükleniyor... (Lütfen bekleyin)" : "🚀 Tüm Menüyü Yükle (50 Ürün)"}
        </button>
      </div>
    </section>
  );
}

async function seedFullMenuToBrowser(adminSession: AdminSession): Promise<void> {
  const simdi = Date.now();
  
  // 1. Kategorileri ekle
  for (const kat of fullMenuKategoriler) {
    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(),
      status: "approved",
      patches: [{ 
        type: "ADD_CATEGORY", 
        payload: { ...kat, active: true, createdAt: simdi, updatedAt: simdi } 
      }],
      createdAt: simdi,
      approvedAt: simdi,
      approvedBy: adminSession.adminId,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
  }

  // 2. Tüm 50 menü öğesini ve recipe'leri ekle
  for (const urun of fullMenuItems) {
    const recipeId = globalThis.crypto.randomUUID();
    const menuItemId = globalThis.crypto.randomUUID();
    
    const cs: ChangeSet = {
      id: globalThis.crypto.randomUUID(),
      status: "approved",
      patches: [
        { 
          type: "ADD_RECIPE", 
          payload: {
            id: recipeId,
            heroImage: urun.heroImage,
            description: urun.description,
            ingredients: urun.ingredients,
            steps: urun.steps,
            pairings: urun.pairings,
            chefNotes: urun.chefNotes,
            createdAt: simdi,
            updatedAt: simdi,
          } 
        },
        { 
          type: "ADD_MENU_ITEM", 
          payload: {
            id: menuItemId,
            nameTR: urun.nameTR,
            nameEN: urun.nameEN,
            templateId: "food_detail_v1" as TemplateId,
            categoryId: urun.categoryId,
            recipeId: recipeId,
            tags: urun.tags,
            available: true,
            createdAt: simdi,
            updatedAt: simdi,
          } 
        }
      ],
      createdAt: simdi,
      approvedAt: simdi,
      approvedBy: adminSession.adminId,
    };
    await db.changeSets.put(cs);
    await publishChangeSet(adminSession, cs.id);
  }
}

