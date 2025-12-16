import "./DayMenuScreen.css";

export default function DayMenuScreen() {
  return (
    <div className="day-menu">
      <h1>Day Menu</h1>

      <div className="day-options">
        <div className="day-card">Breakfast</div>
        <div className="day-card">Lunch</div>
        <div className="day-card">Dinner</div>
      </div>
    </div>
  );
}