import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainScreen from "../main/MainScreen";
import HomeMenuScreen from "../menu/HomeMenuScreen";
import DayMenuScreen from "../menu/DayMenuScreen";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/menu" element={<HomeMenuScreen />} />
        <Route path="/recommend" element={<div>Recommend (mock)</div>} />
        <Route path="/waiter" element={<div>Waiter (mock)</div>} />
        <Route path="/menu/day" element={<DayMenuScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

