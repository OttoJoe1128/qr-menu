import React, { useMemo, useState } from "react";
import { useAdminData } from "./hooks/useAdminData";
import CategoryManager from "./components/CategoryManager";
import ProductManager from "./components/ProductManager";
import ReviewsTab from "./components/ReviewsTab";
import QrGeneratorTab from "./components/QrGeneratorTab";
import DataManagementTab from "./components/DataManagementTab";
import { createAdminSession } from "./utils/adminUtils";
import "./AdminScreen.css";

type AdminTab = "kategori" | "urun_ekle" | "urun_liste" | "puanlar" | "qr_uret" | "veri_yukle";

export default function AdminScreen() {
  const [sekme, setSekme] = useState<AdminTab>("kategori");
  const [hedefKategoriId, setHedefKategoriId] = useState<string>("");
  
  // İzole Edilmiş Veri Katmanı
  const { menuItems, kategoriler, puanlar, recipes, isYukleniyor, refreshData } = useAdminData();
  const adminSession = useMemo(() => createAdminSession(), []);

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__title">SaaS Command Center</div>
        <div className="admin__subtitle">
          Aktif Kategori: {kategoriler.length} • Toplam Ürün: {menuItems.length}
        </div>
        <button 
          className="admin__secondary" 
          onClick={() => window.location.href = "/"}
          style={{ position: "absolute", right: "20px", top: "20px" }}
        >
          ← Müşteri Arayüzü
        </button>
      </header>

      <nav className="admin__tabs">
        <button className={`admin__tab ${sekme === "kategori" ? "admin__tab--active" : ""}`} onClick={() => setSekme("kategori")}>Kategoriler</button>
        <button className={`admin__tab ${sekme === "urun_ekle" ? "admin__tab--active" : ""}`} onClick={() => setSekme("urun_ekle")}>Ürün Ekle</button>
        <button className={`admin__tab ${sekme === "urun_liste" ? "admin__tab--active" : ""}`} onClick={() => setSekme("urun_liste")}>Envanter</button>
        <button className={`admin__tab ${sekme === "puanlar" ? "admin__tab--active" : ""}`} onClick={() => setSekme("puanlar")}>Puanlar</button>
        <button className={`admin__tab ${sekme === "qr_uret" ? "admin__tab--active" : ""}`} onClick={() => setSekme("qr_uret")}>QR Üret</button>
        <button className={`admin__tab ${sekme === "veri_yukle" ? "admin__tab--active" : ""}`} onClick={() => setSekme("veri_yukle")}>📦 Veri Yükle</button>
      </nav>

      {isYukleniyor && <div className="admin__alert" style={{ textAlign: "center", padding: "2rem" }}>⏳ Veriler modüllere yükleniyor...</div>}

      {!isYukleniyor && sekme === "kategori" && (
        <CategoryManager 
          kategoriler={kategoriler} menuItems={menuItems} refreshData={refreshData} adminSession={adminSession}
          onNavigateToProductAdd={(catId) => { setHedefKategoriId(catId); setSekme("urun_ekle"); }} 
        />
      )}

      {!isYukleniyor && (sekme === "urun_ekle" || sekme === "urun_liste") && (
        <ProductManager 
          activeTab={sekme} onTabChange={setSekme} menuItems={menuItems} kategoriler={kategoriler} 
          recipes={recipes} refreshData={refreshData} adminSession={adminSession} initialCategoryId={hedefKategoriId}
        />
      )}

      {!isYukleniyor && sekme === "puanlar" && <ReviewsTab menuItems={menuItems} puanlar={puanlar} refreshData={refreshData} />}
      {!isYukleniyor && sekme === "qr_uret" && <QrGeneratorTab />}
      {!isYukleniyor && sekme === "veri_yukle" && <DataManagementTab adminSession={adminSession} onSuccess={refreshData} onError={console.error} />}
    </div>
  );
}
