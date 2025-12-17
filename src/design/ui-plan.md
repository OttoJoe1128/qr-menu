# QR Menu — UI / UX Ana Plan

## 1. Amaç

Bu doküman QR Menu uygulamasının **tüm kullanıcı arayüzü kurgusunun**
tek referans kaynağıdır.

Hedef:
- Kullanıcıyı yormadan sonuca ulaştırmak
- Gerçek bir restoran deneyimini dijitalde temsil etmek
- Teknik altyapı ile birebir uyumlu bir UI üretmek
- İleride ML ve öneri sistemlerini UI kırmadan entegre edebilmek

---

## 2. Genel Yaklaşım

- Ana ekran **sabit**
- Scroll minimum
- Kullanıcı her zaman nerede olduğunu bilmeli
- Geri dönüş her zaman mümkün olmalı
- Deneyim: modern + sade + hafif dadaist

---

## 3. Ana Ekran (Home)

Ana ekran **3 ana blok + 1 sabit alt bar**’dan oluşur.

### 3.1 Blok 1 – Hero / “Bugün Senin İçin”

- Ekranın %40’ı
- Büyük görsel (gerçek yemek fotoğrafı)
- Ürün adı
- Kısa vurucu metin (opsiyonel)
- CTA: “Detaya bak”

Kaynak:
- MenuItem.available = true
- İlk aşamada statik / random
- İleride ML öneri motoru

Amaç:
- Kullanıcıyı anında bağlamak
- “Buradayım” hissi vermek

---

### 3.2 Blok 2 – Menü Kategorileri

- Ekranın %30’u
- Grid yapı (2x2 veya 3x2)
- Maksimum 6 kategori

Örnek kategoriler:
- Ana Yemek
- Hafif
- İçecek
- Tatlı
- Şefin Seçimi
- Vejetaryen / Özel

Teknik bağ:
- tags
- TemplateId
- Sabit kodlu değil

Davranış:
- Tıklanınca kategori liste ekranı açılır
- Ana ekran state’i bozulmaz

---

### 3.3 Blok 3 – Keşfet / Önerilenler

- Ekranın %20’si
- Yatay mini kartlar (3–4 adet)
- Küçük görsel + ürün adı
- “Bununla iyi gider” etiketi

Kaynak:
- Recipe.pairings
- Snapshot sonrası popülerlik
- Ops.TableSession verileri

---

### 3.4 Sabit Alt Bar

- Ekranın %10’u
- Her ekranda sabit

Butonlar:
- Ana Ekran
- Menü
- Favoriler (ileride)
- Masa / Hesap (ops)

Amaç:
- Kullanıcının kaybolmasını engellemek
- Geri dönüşü her zaman mümkün kılmak

---

## 4. Ürün Detay Ekranı (Özet)

(Bu ekran daha sonra detaylandırılacak)

İçerik:
- Ürün görseli
- Ürün açıklaması
- Reçete (ingredients)
- Yapılış
- Püf noktaları
- Bununla iyi gider önerileri

---

## 5. Gelecek Genişlemeler

- ML destekli öneriler
- Kullanıcı davranışına göre sıralama
- Günün menüsü
- Ops / masa bazlı öneriler

Bu doküman, UI kararlarında **üst referans** kabul edilir.