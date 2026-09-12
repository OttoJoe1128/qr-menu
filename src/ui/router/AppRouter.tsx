import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import MainScreen from "../main/MainScreen";
import HomeMenuScreen from "../menu/HomeMenuScreen";
import DayMenuScreen from "../menu/DayMenuScreen";
import AdminScreen from "../admin/AdminScreen";
import MenuItemDetailScreen from "../menu/MenuItemDetailScreen";

function RootScreen() {
  const [aramaParametreleri] = useSearchParams();
  const sayfa: string | null = aramaParametreleri.get("sayfa");
  if (sayfa === "admin") {
    return <AdminScreen />;
  }
  return <MainScreen />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootScreen />} />
        <Route path="/menu" element={<HomeMenuScreen />} />
        <Route path="/recommend" element={<div>Recommend (mock)</div>} />
        <Route path="/waiter" element={<div>Waiter (mock)</div>} />
        <Route path="/menu/day" element={<DayMenuScreen />} />
        <Route path="/menu/item/:id" element={<MenuItemDetailScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

