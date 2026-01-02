import { MenuItem } from "../../db";

export type MenuKategoriSiralamaModu = "alfabetik_artan" | "alfabetik_azalan" | "sayim_azalan";

export interface MenuKategoriOzeti {
  etiket: string;
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
  const ozetler: MenuKategoriOzeti[] = Array.from(map.entries()).map(([etiket, urunSayisi]) => ({
    etiket,
    urunSayisi,
  }));
  return ozetler;
}

export function sortMenuKategoriOzetleri(
  ozetler: MenuKategoriOzeti[],
  siralamaModu: MenuKategoriSiralamaModu,
): MenuKategoriOzeti[] {
  const kopya: MenuKategoriOzeti[] = [...ozetler];
  if (siralamaModu === "sayim_azalan") {
    return kopya.sort((a, b) => b.urunSayisi - a.urunSayisi || a.etiket.localeCompare(b.etiket));
  }
  if (siralamaModu === "alfabetik_azalan") {
    return kopya.sort((a, b) => b.etiket.localeCompare(a.etiket));
  }
  return kopya.sort((a, b) => a.etiket.localeCompare(b.etiket));
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

