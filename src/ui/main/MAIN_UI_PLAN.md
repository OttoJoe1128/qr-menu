# ANA EKRAN UI PLANI — QR MENU

## 1. AMAÇ
Bu ekran, restoran içindeki bir müşterinin:
- Hızlı
- Hatasız
- Yormayan
- Görsel olarak gerçek dünyaya yakın
bir şekilde menüye ulaşmasını sağlar.

Bu ekran, sistemdeki tüm altyapının (menu, recipe, snapshot, ops, audit)
müşteriye yansıyan yüzüdür.

---

## 2. FELSEFE
- Minimal ama soğuk değil
- Modern ama steril değil
- Dijital ama lokanta hissini bozmayan
- Dadaist: düz grid zorunlu değil
- Fraktal: her seçim yeni bir alt deneyim açar

---

## 3. ANA EKRAN BİLEŞENLERİ

### 3.1 KAHRAMAN ALAN (ÜST ALAN)
- Restoranı temsil eden büyük görsel
- Hafif hareket (parallax / fade)
- Logo veya mekan adı
- “Menüyü Keşfet” ana butonu

---

### 3.2 ANA NAVİGASYON (KART TABANLI)
Her biri büyük dokunmatik kart:

- 🍽 Menü
- ⭐ Önerilenler (ML için geçici alan)
- ℹ️ Mekan Hakkında
- 🧾 Sipariş Akışı (ileride aktif olacak)

Kartlar:
- Görsel ağırlıklı
- Net ikon
- Tek tıkla ilerleme
- Geri dönüş her zaman mümkün

---

## 4. MENÜ AKIŞI (ÇEKİRDEK)

### 4.1 Menü Liste Ekranı
- Kategoriler (Et, Tavuk, Vegan, İçecek vb.)
- Filtrelenebilir
- Scroll yormaz
- Görsel + isim

### 4.2 Menü Detay Ekranı
Bir ürün seçildiğinde:

- Ürün görseli
- Ürün adı
- Kısa açıklama
- Reçete (malzemeler)
- Yapılış usulü (adımlar)
- Püf noktaları (notlar)
- Eşleşmeler (uyum önerileri)

---

## 5. AKIŞ İLKELERİ
- Her ekran geri dönebilir
- Asla dead-end yok
- Kullanıcı düşünmek zorunda kalmaz
- Tek elde kullanılabilir
- Offline-first düşünülür

---

## 6. GELECEK GENİŞLEME
- ML destekli öneriler
- Kullanıcı tercihi öğrenme
- Ops / TableSession entegrasyonu
- Admin snapshot’larına bağlı içerik stabilitesi

---

## 7. TEKNİK NOTLAR
- React + Vite
- State minimal tutulur
- Backend zaten güçlü: UI sadece yansıtır
- Bu ekran statik başlar, sonra dinamikleşir

---

## 8. SONUÇ
Bu dosya, MainScreen.tsx’in anayasasıdır.
Bu plana aykırı UI yazılmaz.