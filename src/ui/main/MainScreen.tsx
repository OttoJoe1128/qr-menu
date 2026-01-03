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
  const masaNumarasiAnahtari: string = "qr_menu_table_number";
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

  const masaNumarasi: string | null = useMemo((): string | null => {
    const kayitli: string | null = localStorage.getItem(masaNumarasiAnahtari);
    if (!kayitli) {
      return null;
    }
    const temiz: string = kayitli.trim();
    return temiz.length > 0 ? temiz : null;
  }, [masaNumarasiAnahtari]);

  return (
    <div className="main-grid">
      {isAdminKisayoluGorunur ? (
        <button className="admin-fab" onClick={() => navigate("/?sayfa=admin")}>
          Admin Paneli
        </button>
      ) : null}
      <header className="main-header">
        <div className="main-header__left">
          <div className="main-header__title">QR Menü</div>
          <div className="main-header__subtitle">Sipariş vermeden önce ürünleri inceleyebilirsiniz.</div>
        </div>
        <div className="main-header__right">
          {masaNumarasi ? <div className="main-pill">Masa {masaNumarasi}</div> : null}
          <button className="main-secondary" onClick={() => navigate("/menu")}>
            Menüye Git
          </button>
        </div>
      </header>
      <div
        className="menu-card"
        style={{ backgroundImage: `url(${breakfastImg})` }}
        onClick={() => navigate("/menu?type=breakfast")}
      >
        <div className="menu-title">Kahvaltı</div>
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
        <div className="menu-title">Akşam & Bar</div>
      </div>
    </div>
  );
}