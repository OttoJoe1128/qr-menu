import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import breakfastImg from "../assets/images/breakfast.jpeg";
import lunchImg from "../assets/images/recommend.jpeg";
import dinnerImg from "../assets/images/dinner.jpeg";

const HERO = [
  {
    key: "breakfast",
    title: "Breakfast",
    subtitle: "Start your day fresh",
    img: breakfastImg,
  },
  {
    key: "lunch",
    title: "Lunch",
    subtitle: "Balanced & flavorful",
    img: lunchImg,
  },
  {
    key: "dinner-bar",
    title: "Dinner & Bar",
    subtitle: "Evening dining & drinks",
    img: dinnerImg,
  },
];

const CATEGORIES = [
  { key: "starters", label: "Starters" },
  { key: "mains", label: "Mains" },
  { key: "vegan", label: "Vegan" },
  { key: "desserts", label: "Desserts" },
  { key: "drinks", label: "Drinks" },
];

export default function MainScreen() {
  const navigate = useNavigate();

  const onHeroClick = (mode) => {
    navigate(`/menu?mode=${encodeURIComponent(mode)}`);
  };

  const onCategoryClick = (cat) => {
    navigate(`/menu?category=${encodeURIComponent(cat)}`);
  };

  const todayHint = useMemo(() => {
    return "Explore curated dishes based on your time and mood.";
  }, []);

  return (
    <div className="ms">
      <header className="ms__topbar">
        <div className="ms__brand">QR Menu</div>

        <div className="ms__utils">
          <button className="ms__utilBtn" onClick={() => navigate("/waiter")}>
            Call Waiter
          </button>
          <button
            className="ms__utilBtn"
            onClick={() => navigate("/recommend")}
          >
            Recommend
          </button>
        </div>
      </header>

      <main className="ms__content">
        <section
          className="ms__heroGrid"
          aria-label="Time-based menu selection"
        >
          {HERO.map((h) => (
            <button
              key={h.key}
              className="ms__heroCard"
              onClick={() => onHeroClick(h.key)}
              style={{ backgroundImage: `url(${h.img})` }}
              aria-label={`${h.title}: ${h.subtitle}`}
            >
              <div className="ms__heroOverlay" />
              <div className="ms__heroText">
                <div className="ms__heroTitle">{h.title}</div>
                <div className="ms__heroSubtitle">{h.subtitle}</div>
              </div>
            </button>
          ))}
        </section>

        <section className="ms__categoryStrip" aria-label="Categories">
          <div className="ms__categoryRow">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className="ms__chip"
                onClick={() => onCategoryClick(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        <section className="ms__cta">
          <div className="ms__ctaText">{todayHint}</div>
          <button className="ms__ctaBtn" onClick={() => navigate("/menu")}>
            Explore Menu
          </button>
        </section>
      </main>
    </div>
  );
}
