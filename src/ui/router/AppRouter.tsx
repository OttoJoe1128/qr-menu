import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainScreen from "../main/MainScreen";
import HomeMenuScreen from "../menu/HomeMenuScreen";
import DayMenuScreen from "../menu/DayMenuScreen";
import AdminScreen from "../admin/AdminScreen";
import MenuItemDetailScreen from "../menu/MenuItemDetailScreen";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* B2B SaaS Clean Routes */}
        <Route path="/" element={<MainScreen />} />
        <Route path="/menu" element={<HomeMenuScreen />} />
        <Route path="/menu/day" element={<DayMenuScreen />} />
        <Route path="/menu/item/:id" element={<MenuItemDetailScreen />} />
        
        {/* Admin & Mock Routes */}
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/recommend" element={<div>Recommend (mock)</div>} />
        <Route path="/waiter" element={<div>Waiter (mock)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
