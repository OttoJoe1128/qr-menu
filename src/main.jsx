import "./i18n/i18n";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './ui/router/AppRouter';
import { seedDatabase } from './dev/seed';

// 1. Önce veritabanını tohumla
seedDatabase().then(() => {
  // 2. Monolit (App.jsx) yerine Domain-Driven Router devrede
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  )
}).catch((error) => {
  console.error("Veritabanı başlatılırken kritik bir hata oluştu:", error);
});
