import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { db, ChangeSet, MenuCategory, MenuItem, MenuRating, Recipe, TemplateId } from "../../db";
import { publishChangeSet } from "../../admin/adminActions";
import { AdminSession } from "../../admin/admin.types";
import "./AdminScreen.css";

type AdminTab = "kategori" | "urun_ekle" | "urun_liste" | "puanlar" | "qr_uret";

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
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  const [kategoriAdiTR, setKategoriAdiTR] = useState<string>("");
  const [kategoriAdiEN, setKategoriAdiEN] = useState<string>("");
  const [kategoriGorselUrl, setKategoriGorselUrl] = useState<string>("");
  const [kategoriSira, setKategoriSira] = useState<number>(1);
  const [isKategoriAktif, setIsKategoriAktif] = useState<boolean>(true);

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
    const [items, cats, ratings]: [MenuItem[], MenuCategory[], MenuRating[]] = await Promise.all([
      db.menuItems.orderBy("updatedAt").reverse().toArray(),
      db.categories.orderBy("sortOrder").toArray(),
      db.ratings.toArray(),
    ]);
    setMenuItems(items);
    setKategoriler(cats);
    setPuanlar(ratings);
    setIsYukleniyor(false);
  }

  useEffect(() => {
    void yukleAdminVeri();
  }, []);

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
    const mevcutSlug: MenuCategory | undefined = await db.categories.where("slug").equals(slug).first();
    if (mevcutSlug) {
      setHataMesaji(`Bu kategori daha önce eklenmiş: ${mevcutSlug.nameTR} (${mevcutSlug.slug})`);
      return;
    }
    const simdi: number = Date.now();
    const kategori: MenuCategory = {
      id: globalThis.crypto.randomUUID(),
      nameTR,
      nameEN: kategoriAdiEN.trim().length > 0 ? kategoriAdiEN.trim() : undefined,
      slug,
      imageUrl: kategoriGorselUrl.trim().length > 0 ? kategoriGorselUrl.trim() : undefined,
      sortOrder: Number.isFinite(kategoriSira) ? kategoriSira : 1,
      active: isKategoriAktif,
      createdAt: simdi,
      updatedAt: simdi,
    };
    await db.categories.put(kategori);
    setBasariMesaji("Kategori kaydedildi.");
    setKategoriAdiTR("");
    setKategoriAdiEN("");
    setKategoriGorselUrl("");
    setKategoriSira(1);
    setIsKategoriAktif(true);
    await yukleAdminVeri();
    setSekme("urun_ekle");
    if (!seciliKategoriId) {
      setSeciliKategoriId(kategori.id);
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
    const id: string = globalThis.crypto.randomUUID();
    const templateId: TemplateId = "food_detail_v1" as TemplateId;
    const simdi: number = Date.now();
    const recipeId: string = globalThis.crypto.randomUUID();
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
      patches: [
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
    setBasariMesaji("Ürün kaydedildi ve yayınlandı.");
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
    await yukleAdminVeri();
    setSekme("urun_liste");
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
      </nav>

      {hataMesaji ? <div className="admin__alert admin__alert--error">{hataMesaji}</div> : null}
      {basariMesaji ? <div className="admin__alert admin__alert--success">{basariMesaji}</div> : null}

      {sekme === "kategori" ? (
        <section className="admin__card">
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
            Kategoriyi Kaydet
          </button>
          <div className="admin__hint">
            Not: Kategori eklemeden önce “daha önce eklenmiş mi?” kontrolü slug üzerinden yapılır.
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {sekme === "urun_ekle" ? (
        <section className="admin__card">
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
            Ürünü Kaydet ve Yayınla
          </button>
          <div className="admin__hint">
            Not: Ürün eklemeden önce “daha önce eklenmiş mi?” kontrolü DB’de id ve nameTR+templateId üzerinden yapılır.
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

