import { MenuCategory, MenuItem } from "../../db";

export type MenuKategoriSiralamaModu = "alfabetik_artan" | "alfabetik_azalan" | "sayim_azalan";

export interface MenuKategoriOzeti {
  anahtar: string;
  baslik: string;
  urunSayisi: number;
}

export interface SeciliKategoriGirdisi {
  aramaParametresiKategori?: string | null;
  kaydedilmisKategori?: string | null;
  kullanilabilirEtiketler: string[];
}

export function buildMenuKategoriOzetleri(items: MenuItem[]): MenuKategoriOzeti[] {
  const map: Map<string, number> = new Map<string, number>();
  for (const item of items) {
    if (!item.available) {
      continue;
    }
    for (const tag of item.tags) {
      const mevcut: number = map.get(tag) ?? 0;
      map.set(tag, mevcut + 1);
    }
  }
  const ozetler: MenuKategoriOzeti[] = Array.from(map.entries()).map(([anahtar, urunSayisi]) => ({
    anahtar,
    baslik: anahtar,
    urunSayisi,
  }));
  return ozetler;
}

export function buildMenuKategoriOzetleriFromKategoriler(
  items: MenuItem[],
  kategoriler: MenuCategory[],
): MenuKategoriOzeti[] {
  const aktifKategoriler: MenuCategory[] = kategoriler
    .filter((k) => k.active)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.nameTR.localeCompare(b.nameTR));
  const sayimMap: Map<string, number> = new Map<string, number>();
  for (const item of items) {
    if (!item.available) {
      continue;
    }
    const kategoriId: string | undefined = item.categoryId;
    if (!kategoriId) {
      continue;
    }
    const mevcut: number = sayimMap.get(kategoriId) ?? 0;
    sayimMap.set(kategoriId, mevcut + 1);
  }
  const ozetler: MenuKategoriOzeti[] = aktifKategoriler.map((k) => ({
    anahtar: k.slug,
    baslik: k.nameTR,
    urunSayisi: sayimMap.get(k.id) ?? 0,
  }));
  return ozetler.filter((o) => o.urunSayisi > 0);
}

export function sortMenuKategoriOzetleri(
  ozetler: MenuKategoriOzeti[],
  siralamaModu: MenuKategoriSiralamaModu,
): MenuKategoriOzeti[] {
  const kopya: MenuKategoriOzeti[] = [...ozetler];
  if (siralamaModu === "sayim_azalan") {
    return kopya.sort((a, b) => b.urunSayisi - a.urunSayisi || a.baslik.localeCompare(b.baslik));
  }
  if (siralamaModu === "alfabetik_azalan") {
    return kopya.sort((a, b) => b.baslik.localeCompare(a.baslik));
  }
  return kopya.sort((a, b) => a.baslik.localeCompare(b.baslik));
}

export function resolveSeciliKategori(input: SeciliKategoriGirdisi): string | null {
  const { aramaParametresiKategori, kaydedilmisKategori, kullanilabilirEtiketler } = input;
  if (aramaParametresiKategori && kullanilabilirEtiketler.includes(aramaParametresiKategori)) {
    return aramaParametresiKategori;
  }
  if (kaydedilmisKategori && kullanilabilirEtiketler.includes(kaydedilmisKategori)) {
    return kaydedilmisKategori;
  }
  return kullanilabilirEtiketler.length > 0 ? kullanilabilirEtiketler[0] : null;
}

