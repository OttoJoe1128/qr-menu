import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./MainScreen.css";

import breakfastImg from "../../assets/images/breakfast.jpeg";
import lunchImg from "../../assets/images/recommend.jpeg";
import dinnerImg from "../../assets/images/dinner.jpeg";

export default function MainScreen() {
  const navigate = useNavigate();
  const heroCards = useMemo(() => {
    return [
      {
        id: "breakfast",
        baslik: "Kahvaltı",
        altBaslik: "Güne iyi başla",
        gorsel: breakfastImg,
        hedef: "/menu/day",
      },
      {
        id: "recommend",
        baslik: "Şefin Önerileri",
        altBaslik: "Bugün ne yesem?",
        gorsel: lunchImg,
        hedef: "/recommend",
      },
      {
        id: "dinner",
        baslik: "Akşam",
        altBaslik: "Yemek & içecek",
        gorsel: dinnerImg,
        hedef: "/menu",
      },
    ] as const;
  }, []);

  return (
    <div className="ms">
      <header className="ms__topbar">
        <div className="ms__brand">QR Menu</div>
        <div className="ms__topActions">
          <button className="ms__topBtn" onClick={() => navigate("/waiter")}>
            Garson
          </button>
          <button className="ms__topBtn" onClick={() => navigate("/recommend")}>
            Öneri
          </button>
        </div>
      </header>
      <main className="ms__content">
        <section className="ms__hero" aria-label="Ana seçimler">
          <div className="ms__heroTitle">Bugün Senin İçin</div>
          <div className="ms__heroGrid">
            {heroCards.map((card) => (
              <button
                key={card.id}
                className="ms__heroCard"
                onClick={() => navigate(card.hedef)}
                style={{ backgroundImage: `url(${card.gorsel})` }}
                aria-label={`${card.baslik}: ${card.altBaslik}`}
              >
                <div className="ms__heroOverlay" />
                <div className="ms__heroText">
                  <div className="ms__heroCardTitle">{card.baslik}</div>
                  <div className="ms__heroCardSubtitle">{card.altBaslik}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="ms__section" aria-label="Hızlı menü">
          <div className="ms__sectionTitle">Menü</div>
          <div className="ms__quickRow">
            <button className="ms__chip" onClick={() => navigate("/menu")}>
              Menüye Göz At
            </button>
            <button className="ms__chip" onClick={() => navigate("/menu/day")}>
              Günün Menüsü
            </button>
            <button className="ms__chip" onClick={() => navigate("/recommend")}>
              Şefin Önerisi
            </button>
          </div>
        </section>
      </main>
      <nav className="ms__bottomBar" aria-label="Alt menü">
        <button className="ms__bottomBtn" onClick={() => navigate("/")}>
          Ana Sayfa
        </button>
        <button className="ms__bottomBtn" onClick={() => navigate("/menu")}>
          Menü
        </button>
        <button className="ms__bottomBtn" onClick={() => navigate("/recommend")}>
          Öneri
        </button>
        <button className="ms__bottomBtn" onClick={() => navigate("/waiter")}>
          Garson
        </button>
      </nav>
    </div>
  );
}