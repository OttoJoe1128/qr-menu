import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Mevcut oturumu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // 2. Oturum değişikliklerini (Giriş/Çıkış) canlı dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Henüz kontrol aşamasındaysa bekleme ekranı göster
  if (isAuthenticated === null) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "white" }}>Güvenlik Kontrolü Yapılıyor...</div>;
  }

  // Oturum yoksa login ekranına şutla, varsa içeri (children) al
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
