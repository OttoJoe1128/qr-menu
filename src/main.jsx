import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { seedDatabase } from './dev/seed' // Veritabanı tohumlama fonksiyonunu içe aktardık

// 1. Önce veritabanını tohumla
seedDatabase().then(() => {
  // 2. Tohumlama başarılı olursa React uygulamasını (Arayüzü) ayağa kaldır
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error("Veritabanı başlatılırken kritik bir hata oluştu:", error);
});
