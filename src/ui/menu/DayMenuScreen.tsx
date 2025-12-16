import "./DayMenuScreen.css";

const categories = [
  "Eggs",
  "Bakery",
  "Hot Dishes",
  "Cold Plates",
  "Drinks",
];

export default function DayMenuScreen() {
  return (
    <div className="day-menu">
      <h1 className="day-title">Breakfast Menu</h1>

      <div className="category-list">
        {categories.map((cat) => (
          <button key={cat} className="category-item">
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-placeholder">
        Select a category to view items
      </div>
    </div>
  );
}