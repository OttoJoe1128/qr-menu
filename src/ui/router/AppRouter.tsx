import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainScreen from "../main/MainScreen";
import DayMenuScreen from "../menu/DayMenuScreen";
import HomeMenuScreen from "../menu/HomeMenuScreen";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/menu" element={<HomeMenuScreen />} />
        <Route path="/recommend" element={<div>Öneriler (geçici)</div>} />
        <Route path="/waiter" element={<div>Garson Çağır (geçici)</div>} />
        <Route path="/menu/day" element={<DayMenuScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

