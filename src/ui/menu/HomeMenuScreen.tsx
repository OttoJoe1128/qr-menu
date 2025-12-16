import "./HomeMenuScreen.css";

export default function HomeMenuScreen() {
  return (
    <div className="home-menu">

      <div className="hero-grid">
        <div className="hero-card breakfast">
          <span>Breakfast</span>
        </div>

        <div className="hero-card lunch-dinner">
          <span>Lunch & Dinner</span>
        </div>

        <div className="hero-card bar">
          <span>Bar & Drinks</span>
        </div>
      </div>

      <div className="category-strip">
        <button>Starters</button>
        <button>Main Courses</button>
        <button>Desserts</button>
        <button>Specials</button>
      </div>

    </div>
  );
}