import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainScreen from "../main/MainScreen";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/menu" element={<div>Menu (mock)</div>} />
        <Route path="/recommend" element={<div>Recommend (mock)</div>} />
        <Route path="/waiter" element={<div>Waiter (mock)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

