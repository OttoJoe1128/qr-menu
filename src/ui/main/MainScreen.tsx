import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./MainScreen.css";

import breakfastImg from "../../assets/images/breakfast.jpeg";
import recommendImg from "../../assets/images/recommend.jpeg";
import dinnerImg from "../../assets/images/dinner.jpeg";

export default function MainScreen() {
  const navigate = useNavigate();
  const [aramaParametreleri] = useSearchParams();
  const adminKisayoluAnahtari: string = "qr_menu_admin_kisayolu";
  const isAdminKisayoluGorunur: boolean = useMemo((): boolean => {
    const isAdmin: string | null = aramaParametreleri.get("admin");
    if (isAdmin === "1") {
      return true;
    }
    const kayitli: string | null = localStorage.getItem(adminKisayoluAnahtari);
    return kayitli === "1";
  }, [aramaParametreleri, adminKisayoluAnahtari]);

  useEffect((): void => {
    const isAdmin: string | null = aramaParametreleri.get("admin");
    if (isAdmin !== "1") {
      return;
    }
    localStorage.setItem(adminKisayoluAnahtari, "1");
  }, [aramaParametreleri, adminKisayoluAnahtari]);

  return (
    <div className="main-grid">
      {isAdminKisayoluGorunur ? (
        <button className="admin-fab" onClick={() => navigate("/?sayfa=admin")}>
          Admin Paneli
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