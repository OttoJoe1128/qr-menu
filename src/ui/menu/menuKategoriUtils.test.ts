import { describe, expect, it } from "vitest";
import {
  buildMenuKategoriOzetleri,
  resolveSeciliKategori,
  sortMenuKategoriOzetleri,
} from "./menuKategoriUtils";
import { MenuItem } from "../../db";

function createMenuItem(input: Partial<MenuItem> & Pick<MenuItem, "id" | "nameTR" | "templateId" | "tags" | "available">): MenuItem {
  return {
    id: input.id,
    nameTR: input.nameTR,
    nameEN: input.nameEN,
    templateId: input.templateId,
    recipeId: input.recipeId,
    tags: input.tags,
    available: input.available,
    createdAt: input.createdAt ?? 100,
    updatedAt: input.updatedAt ?? 200,
  };
}

describe("menuKategoriUtils", () => {
  it("kategorileri sayar, sadece available olanlari dikkate alir ve siralar", () => {
    const inputMenuItems: MenuItem[] = [
      createMenuItem({
        id: "1",
        nameTR: "Izgara Tavuk",
        templateId: "food_detail_v1",
        tags: ["tavuk", "izgara"],
        available: true,
      }),
      createMenuItem({
        id: "2",
        nameTR: "Tavuk Dürüm",
        templateId: "food_detail_v1",
        tags: ["tavuk"],
        available: true,
      }),
      createMenuItem({
        id: "3",
        nameTR: "Gizli Ürün",
        templateId: "food_detail_v1",
        tags: ["tavuk"],
        available: false,
      }),
    ];
    const actualOzetler = buildMenuKategoriOzetleri(inputMenuItems);
    const actualSiralilar = sortMenuKategoriOzetleri(actualOzetler, "sayim_azalan");
    expect(actualSiralilar).toEqual([
      { anahtar: "tavuk", baslik: "tavuk", urunSayisi: 2 },
      { anahtar: "izgara", baslik: "izgara", urunSayisi: 1 },
    ]);
  });

  it("secili kategoriyi query param > localStorage > ilk kategori onceligiyle belirler", () => {
    const actual1 = resolveSeciliKategori({
      aramaParametresiKategori: "icecek",
      kaydedilmisKategori: "tatli",
      kullanilabilirEtiketler: ["tatli", "icecek"],
    });
    expect(actual1).toBe("icecek");

    const actual2 = resolveSeciliKategori({
      aramaParametresiKategori: "yok",
      kaydedilmisKategori: "tatli",
      kullanilabilirEtiketler: ["tatli", "icecek"],
    });
    expect(actual2).toBe("tatli");

    const actual3 = resolveSeciliKategori({
      aramaParametresiKategori: null,
      kaydedilmisKategori: null,
      kullanilabilirEtiketler: ["tatli", "icecek"],
    });
    expect(actual3).toBe("tatli");
  });
});

