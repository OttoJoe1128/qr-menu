import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./MainScreen.css";

import breakfastImg from "../../assets/images/breakfast.jpeg";
import recommendImg from "../../assets/images/recommend.jpeg";
import dinnerImg from "../../assets/images/dinner.jpeg";

export default function MainScreen() {
  const navigate = useNavigate();
  const [aramaParametreleri] = useSearchParams();
  const isAdminKisayoluGorunur: boolean = useMemo((): boolean => {
    const isAdmin: string | null = aramaParametreleri.get("admin");
    return isAdmin === "1";
  }, [aramaParametreleri]);

  return (
    <div className="main-grid">
      {isAdminKisayoluGorunur ? (
        <button className="admin-fab" onClick={() => navigate("/admin")}>
          Admin
        </button>
      ) : null}
      <div
        className="menu-card"
        style={{ backgroundImage: `url(${breakfastImg})` }}
        onClick={() => navigate("/menu?type=breakfast")}
      >
        <div className="menu-title">Breakfast</div>
      </div>

      <div
        className="menu-card"
        style={{ backgroundImage: `url(${recommendImg})` }}
        onClick={() => navigate("/menu")}
      >
        <div className="menu-title">Önerilenler</div>
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