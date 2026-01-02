import AppRouter from "./ui/router/AppRouter";
import { useEffect } from "react";
import { initCore } from "./core/init";
import { openTableSession } from "./ops/opsService";

export default function App() {
  useEffect(() => {
    async function init() {
      await initCore();
      const params = new URLSearchParams(window.location.search);
      const tableNumber = params.get("table");
      if (!tableNumber) {
        return;
      }
      const session = await openTableSession(tableNumber);
      localStorage.setItem("qr_menu_table_number", tableNumber);
      localStorage.setItem("qr_menu_table_session_id", session.id);
    }
    void init();
  }, []);
  return <AppRouter />;
}
