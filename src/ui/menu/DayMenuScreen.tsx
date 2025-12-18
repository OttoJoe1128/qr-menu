import "./DayMenuScreen.css";

const categories = [
  "Yumurta",
  "Fırın",
  "Sıcak",
  "Soğuk",
  "İçecek",
];

export default function DayMenuScreen() {
  return (
    <div className="day-menu">
      <h1 className="day-title">Kahvaltı Menüsü</h1>

      <div className="category-list">
        {categories.map((cat) => (
          <button key={cat} className="category-item">
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-placeholder">
        Ürünleri görmek için bir kategori seçin
      </div>
    </div>
  );
}