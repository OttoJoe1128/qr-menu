import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainScreen from "../main/MainScreen";
import HomeMenuScreen from "../menu/HomeMenuScreen";
import DayMenuScreen from "../menu/DayMenuScreen";
import AdminScreen from "../admin/AdminScreen";
import MenuItemDetailScreen from "../menu/MenuItemDetailScreen";
import LoginScreen from "../auth/LoginScreen";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Müşteri Arayüzü (Açık Rotalar) */}
        <Route path="/" element={<MainScreen />} />
        <Route path="/menu" element={<HomeMenuScreen />} />
        <Route path="/menu/day" element={<DayMenuScreen />} />
        <Route path="/menu/item/:id" element={<MenuItemDetailScreen />} />
        
        {/* SaaS Kimlik Doğrulama */}
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Admin Paneli (Güvenli Rota) */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/recommend" element={<div>Recommend (mock)</div>} />
        <Route path="/waiter" element={<div>Waiter (mock)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
