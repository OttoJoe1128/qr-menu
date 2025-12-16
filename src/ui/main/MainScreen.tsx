import { useNavigate } from "react-router-dom";
import breakfastImg from "../../assets/images/breakfast.jpeg";
import dinnerImg from "../../assets/images/dinner.jpeg";
import recommendImg from "../../assets/images/recommend.jpeg";
import "./MainScreen.css";

export default function MainScreen() {
  const navigate = useNavigate();

  return (
    <div className="main-screen">
      <div
        className="menu-card"
        style={{ backgroundImage: `url(${breakfastImg})` }}
        onClick={() => navigate("/menu/day")}
      >
        <div className="overlay">
          <h2>DAY MENU</h2>
          <p>Breakfast · Lunch · Dinner</p>
        </div>
      </div>

      <div
        className="menu-card"
        style={{ backgroundImage: `url(${dinnerImg})` }}
        onClick={() => navigate("/menu/evening")}
      >
        <div className="overlay">
          <h2>EVENING MENU</h2>
          <p>Dinner · Specials</p>
        </div>
      </div>

      <div
        className="menu-card"
        style={{ backgroundImage: `url(${recommendImg})` }}
        onClick={() => navigate("/bar")}
      >
        <div className="overlay">
          <h2>BAR & CHILL</h2>
          <p>Drinks · Snacks · Cocktails</p>
        </div>
      </div>
    </div>
  );
}