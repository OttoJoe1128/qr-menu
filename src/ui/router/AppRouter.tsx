import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainScreen from "../main/MainScreen";
import DayMenuScreen from "../menu/DayMenuScreen";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/menu" element={<div>Menu (mock)</div>} />
        <Route path="/recommend" element={<div>Recommend (mock)</div>} />
        <Route path="/waiter" element={<div>Waiter (mock)</div>} />
        <Route path="/menu/day" element={<DayMenuScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

