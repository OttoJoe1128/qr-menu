# QR Menu

QR tabanlı **menü** ve **operasyon (masa oturumu)** yönetimi için Vite + React tabanlı, **offline-first** yaklaşımıyla ilerleyen bir uygulama. Kalıcı veri katmanı tarayıcı tarafında **IndexedDB** (Dexie) ile tutulur.

## Teknoloji
- **UI**: React + Vite
- **Depolama**: Dexie (IndexedDB)
- **Alanlar (domain)**: Menü, Reçete, Template, Değişiklik Seti (ChangeSet), Snapshot, Ops (TableSession), Audit

## Kurulum
Node.js kurulu olmalıdır.

```bash
npm install
```

## Çalıştırma komutları
```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run preview
```

## Dokümanlar (yönergeler)
- **UI / UX master plan (kısa)**: `docs/ui-plan.md`
- **UI / UX master plan (detaylı)**: `src/design/ui-plan.md`
- **Main Screen anayasası**: `src/ui/main/MAIN_UI_PLAN.md`

## Proje yapısı (özet)
- `src/ui/`: Ekranlar (TSX + CSS) ve router
- `src/db/`: Dexie şeması ve temel tipler
- `src/templates/`: Template registry ve çözümleme
- `src/updates/`: ChangeSet uygulama + snapshot servisleri
- `src/ops/`: Masa oturumu (TableSession) servisleri
- `src/audit/`: Audit event yazımı (tek giriş noktası)

## Notlar
- Veriler tarayıcıda saklanır (IndexedDB). Geliştirme sırasında veriyi "sıfırlamak" için tarayıcı uygulama verilerini temizlemeniz gerekebilir.
- UI geliştirmesinde referans dokümanlar yukarıdaki dosyalardır; UI kararları bu planlarla tutarlı ilerlemelidir.
