import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./MainScreen.css";
import AdminScreen from "../admin/AdminScreen";

export default function MainScreen() {
  const navigate = useNavigate();
  const [aramaParametreleri] = useSearchParams();
  const adminKisayoluAnahtari: string = "qr_menu_admin_kisayolu";
  const [aktifSayfa, setAktifSayfa] = useState<string | null>(null);

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

  useEffect((): void => {
    const sayfa: string | null = aramaParametreleri.get("sayfa");
    setAktifSayfa(sayfa);
  }, [aramaParametreleri]);

  // Admin paneli göster
  if (aktifSayfa === "admin") {
    return <AdminScreen />;
  }

  return (
    <div className="welcome-screen">
      {isAdminKisayoluGorunur ? (
        <button className="admin-fab" onClick={() => navigate("/?sayfa=admin")}>
          Admin Paneli
        </button>
      ) : null}
      
      <div className="welcome-container">
        <div className="welcome-logo">
          <div className="logo-circle">🍽️</div>
        </div>
        
        <h1 className="welcome-title">The Brook Phuket</h1>
        <p className="welcome-subtitle">Restaurant & Bar</p>
        
        <div className="welcome-divider"></div>
        
        <p className="welcome-text">
          Hoş Geldiniz
        </p>
        <p className="welcome-text-en">
          Welcome to our restaurant
        </p>
        
        <button 
          className="welcome-button"
          onClick={() => navigate("/menu")}
        >
          <span className="button-text">Menüyü Görüntüle</span>
          <span className="button-icon">→</span>
        </button>

        <div className="welcome-info">
          <p>🕐 Açık Saatler: 08:00 - 23:00</p>
          <p>📍 Chalong, Phuket</p>
        </div>
      </div>
    </div>
  );
}