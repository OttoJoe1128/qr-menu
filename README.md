# QR Menu

QR tabanl? **menü** ve **operasyon (masa oturumu)** yönetimi için Vite + React tabanl?, **offline-first** yaklaº?m?yla ilerleyen bir uygulama. Kal?c? veri katman? taray?c? taraf?nda **IndexedDB** (Dexie) ile tutulur.

## Teknoloji
- **UI**: React + Vite
- **Depolama**: Dexie (IndexedDB)
- **Alanlar (domain)**: Menü, Reçete, Template, De?iºiklik Seti (ChangeSet), Snapshot, Ops (TableSession), Audit

## Kurulum
Node.js kurulu olmal?d?r.

```bash
npm install
```

## Çal?ºt?rma komutlar?
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
- **UI / UX master plan (k?sa)**: `docs/ui-plan.md`
- **UI / UX master plan (detayl?)**: `src/design/ui-plan.md`
- **Main Screen anayasas?**: `src/ui/main/MAIN_UI_PLAN.md`

## Proje yap?s? (özet)
- `src/ui/`: Ekranlar (TSX + CSS) ve router
- `src/db/`: Dexie ºemas? ve temel tipler
- `src/templates/`: Template registry ve çözümleme
- `src/updates/`: ChangeSet uygulama + snapshot servisleri
- `src/ops/`: Masa oturumu (TableSession) servisleri
- `src/audit/`: Audit event yaz?m? (tek giriº noktas?)

## Notlar
- Veriler taray?c?da saklan?r (IndexedDB). Geliºtirme s?ras?nda veriyi ?s?f?rlamak? için taray?c? uygulama verilerini temizlemeniz gerekebilir.
- UI geliºtirmesinde referans dokümanlar yukar?daki dosyalard?r; UI kararlar? bu planlarla tutarl? ilerlemelidir.
