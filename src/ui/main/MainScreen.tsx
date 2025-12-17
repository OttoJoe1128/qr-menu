import { useNavigate } from "react-router-dom";
import "./MainScreen.css";

import breakfastImg from "../../assets/images/breakfast.jpeg";
import lunchImg from "../../assets/images/recommend.jpeg";
import dinnerImg from "../../assets/images/dinner.jpeg";

export default function MainScreen() {
  const navigate = useNavigate();

  return (
    <div className="main-grid">
      <div
        className="menu-card"
        style={{ backgroundImage: `url(${breakfastImg})` }}
        onClick={() => navigate("/menu?type=breakfast")}
      >
        <div className="menu-title">Breakfast</div>
      </div>

      <div
        className="menu-card"
        style={{ backgroundImage: `url(${lunchImg})` }}
        onClick={() => navigate("/menu?type=lunch")}
      >
        <div className="menu-title">Lunch</div>
      </div>

      <div
        className="menu-card wide"
        style={{ backgroundImage: `url(${dinnerImg})` }}
        onClick={() => navigate("/menu?type=dinner")}
      >
        <div className="menu-title">Dinner & Bar</div>
      </div>
    </div>
  );
}