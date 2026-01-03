import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, MenuItem, MenuRating, Recipe } from "../../db";
import "./MenuItemDetailScreen.css";

type DetaySekmesi = "aciklama" | "malzemeler" | "yapilis" | "eslesmeler" | "sef_notlari";

export default function MenuItemDetailScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const menuItemId: string | undefined = params.id;
  const masaNumarasiAnahtari: string = "qr_menu_table_number";

  const [isYukleniyor, setIsYukleniyor] = useState<boolean>(true);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [puanlar, setPuanlar] = useState<MenuRating[]>([]);
  const [sekme, setSekme] = useState<DetaySekmesi>("aciklama");
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  const masaNumarasi: string | null = useMemo((): string | null => {
    const kayitli: string | null = localStorage.getItem(masaNumarasiAnahtari);
    if (!kayitli) {
      return null;
    }
    const temiz: string = kayitli.trim();
    return temiz.length > 0 ? temiz : null;
  }, [masaNumarasiAnahtari]);

  useEffect((): (() => void) => {
    let isIptalEdildi: boolean = false;
    async function yukle(): Promise<void> {
      try {
        if (!menuItemId) {
          setHataMesaji("Ürün bulunamadı.");
          return;
        }
        const item: MenuItem | undefined = await db.menuItems.get(menuItemId);
        if (isIptalEdildi) {
          return;
        }
        if (!item) {
          setHataMesaji("Ürün bulunamadı.");
          setMenuItem(null);
          setRecipe(null);
          return;
        }
        const [ratings, rcp]: [MenuRating[], Recipe | undefined] = await Promise.all([
          db.ratings.where("menuItemId").equals(item.id).toArray(),
          item.recipeId ? db.recipes.get(item.recipeId) : Promise.resolve(undefined),
        ]);
        if (isIptalEdildi) {
          return;
        }
        setMenuItem(item);
        setPuanlar(ratings);
        setRecipe(rcp ?? null);
        if (rcp) {
          setSekme("aciklama");
        }
      } finally {
        if (isIptalEdildi) {
          return;
        }
        setIsYukleniyor(false);
      }
    }
    void yukle();
    return (): void => {
      isIptalEdildi = true;
    };
  }, [menuItemId]);

  const puanOzeti = useMemo((): { ortalama: number; adet: number } => {
    if (puanlar.length === 0) {
      return { ortalama: 0, adet: 0 };
    }
    const toplam: number = puanlar.reduce((acc, p) => acc + p.score, 0);
    return { ortalama: toplam / puanlar.length, adet: puanlar.length };
  }, [puanlar]);

  const benimPuanim = useMemo((): number | null => {
    const tableSessionId: string | null = localStorage.getItem("qr_menu_table_session_id");
    const mevcut: MenuRating | undefined = puanlar.find((r) =>
      tableSessionId ? r.tableSessionId === tableSessionId : !r.tableSessionId,
    );
    return mevcut ? mevcut.score : null;
  }, [puanlar]);

  async function kaydetPuan(score: number): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    if (!menuItem) {
      return;
    }
    const tableSessionId: string | null = localStorage.getItem("qr_menu_table_session_id");
    const mevcut: MenuRating | undefined = await db.ratings
      .where("menuItemId")
      .equals(menuItem.id)
      .and((r: MenuRating) => (tableSessionId ? r.tableSessionId === tableSessionId : !r.tableSessionId))
      .first();
    if (mevcut) {
      await db.ratings.put({ ...mevcut, score, createdAt: Date.now() });
    } else {
      await db.ratings.put({
        id: globalThis.crypto.randomUUID(),
        menuItemId: menuItem.id,
        tableSessionId: tableSessionId ?? undefined,
        score,
        createdAt: Date.now(),
      });
    }
    const ratings: MenuRating[] = await db.ratings.where("menuItemId").equals(menuItem.id).toArray();
    setPuanlar(ratings);
    setBasariMesaji("Puan kaydedildi.");
  }

  function geriDon(): void {
    const kategori: string | null = localStorage.getItem("qr_menu_day_category");
    if (kategori) {
      navigate(`/menu/day?category=${encodeURIComponent(kategori)}`);
      return;
    }
    navigate("/menu");
  }

  if (isYukleniyor) {
    return (
      <div className="detay">
        <div className="detay__header">
          <div className="detay__headerLeft">
            <button className="detay__back" onClick={() => geriDon()}>
              ← Geri
            </button>
          </div>
          {masaNumarasi ? <div className="detay__pill">Masa {masaNumarasi}</div> : null}
        </div>
        <div className="detay__hint">Yükleniyor...</div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="detay">
        <div className="detay__header">
          <div className="detay__headerLeft">
            <button className="detay__back" onClick={() => geriDon()}>
              ← Geri
            </button>
          </div>
          {masaNumarasi ? <div className="detay__pill">Masa {masaNumarasi}</div> : null}
        </div>
        <div className="detay__hint">{hataMesaji ?? "Ürün bulunamadı."}</div>
      </div>
    );
  }

  return (
    <div className="detay">
      <div className="detay__header">
        <div className="detay__headerLeft">
          <button className="detay__back" onClick={() => geriDon()}>
            ← Geri
          </button>
          <button className="detay__back" onClick={() => navigate("/menu")}>
            Kategoriler
          </button>
          <button className="detay__back" onClick={() => navigate("/")}>
            Ana Ekran
          </button>
        </div>
        {masaNumarasi ? <div className="detay__pill">Masa {masaNumarasi}</div> : null}
      </div>

      <div className="detay__hero">
        {recipe?.heroImage ? <img className="detay__heroImg" src={recipe.heroImage} alt={menuItem.nameTR} /> : null}
        <div className="detay__heroBody">
          <div className="detay__title">{menuItem.nameTR}</div>
          <div className="detay__subtitle">
            <span className="detay__ratingValue">{puanOzeti.ortalama.toFixed(1)}</span>
            <span className="detay__ratingText">/ 5 • {puanOzeti.adet} oy</span>
          </div>
          <div className="detay__rate">
            <span className="detay__rateLabel">Puanın:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                className={`detay__rateBtn ${benimPuanim === s ? "detay__rateBtn--active" : ""}`}
                onClick={() => void kaydetPuan(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {hataMesaji ? <div className="detay__alert detay__alert--error">{hataMesaji}</div> : null}
          {basariMesaji ? <div className="detay__alert detay__alert--success">{basariMesaji}</div> : null}
        </div>
      </div>

      {!recipe ? (
        <div className="detay__hint">Bu ürün için detay içerik (recipe) eklenmemiş.</div>
      ) : (
        <>
          <div className="detay__tabs">
            <button className={`detay__tab ${sekme === "aciklama" ? "detay__tab--active" : ""}`} onClick={() => setSekme("aciklama")}>
              Açıklama
            </button>
            <button className={`detay__tab ${sekme === "malzemeler" ? "detay__tab--active" : ""}`} onClick={() => setSekme("malzemeler")}>
              Malzemeler
            </button>
            <button className={`detay__tab ${sekme === "yapilis" ? "detay__tab--active" : ""}`} onClick={() => setSekme("yapilis")}>
              Yapılış
            </button>
            <button className={`detay__tab ${sekme === "eslesmeler" ? "detay__tab--active" : ""}`} onClick={() => setSekme("eslesmeler")}>
              Eşleşmeler
            </button>
            <button className={`detay__tab ${sekme === "sef_notlari" ? "detay__tab--active" : ""}`} onClick={() => setSekme("sef_notlari")}>
              Şef Notu
            </button>
          </div>

          <div className="detay__content">
            {sekme === "aciklama" ? <div className="detay__text">{recipe.description}</div> : null}
            {sekme === "malzemeler" ? (
              <ol className="detay__list">
                {recipe.ingredients.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ol>
            ) : null}
            {sekme === "yapilis" ? (
              <ol className="detay__list">
                {recipe.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            ) : null}
            {sekme === "eslesmeler" ? (
              recipe.pairings && recipe.pairings.length > 0 ? (
                <ul className="detay__list">
                  {recipe.pairings.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : (
                <div className="detay__hint">Eşleşme önerisi yok.</div>
              )
            ) : null}
            {sekme === "sef_notlari" ? (
              recipe.chefNotes && recipe.chefNotes.trim().length > 0 ? (
                <div className="detay__text">{recipe.chefNotes}</div>
              ) : (
                <div className="detay__hint">Şef notu yok.</div>
              )
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

