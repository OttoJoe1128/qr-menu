import { useNavigate } from "react-router-dom";
import "./HomeMenuScreen.css";

export default function HomeMenuScreen() {
  const navigate = useNavigate();

  return (
    <div className="home-menu">
      <div
        className="menu-card"
        style={{ backgroundImage: "url(/assets/images/breakfast.jpeg)" }}
        onClick={() => navigate("/menu/day")}
      >
        <div className="menu-title">Kahvaltı</div>
      </div>

      <div
        className="menu-card"
        style={{ backgroundImage: "url(/assets/images/dinner.jpeg)" }}
        onClick={() => navigate("/menu/dinner")}
      >
        <div className="menu-title">Akşam</div>
      </div>

      <div
        className="menu-card"
        style={{ backgroundImage: "url(/assets/images/recommend.jpeg)" }}
        onClick={() => navigate("/recommend")}
      >
        <div className="menu-title">Şefin Önerisi</div>
      </div>
    </div>
  );
}