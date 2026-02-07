import type { ShopItemDTO } from "../contracts/types.ts";

export const shopItems: ShopItemDTO[] = [
  {
    id: "hat-cap",
    name: "Basecap",
    priceCoins: 50,
    category: "hats",
    owned: false,
    assetPath: "/assets/articles/hats/cap/cap_icon.png",
  },
  {
    id: "hat-detective",
    name: "Detektiv-Hut",
    priceCoins: 120,
    category: "hats",
    owned: false,
    assetPath: "/assets/articles/hats/detective_hat/detective_hat_icon.png",
  },
  {
    id: "hat-birthday",
    name: "Party-Hut",
    priceCoins: 80,
    category: "hats",
    owned: false,
    assetPath: "/assets/articles/hats/birthday_hat/birthday_hat_icon.png",
  },
  {
    id: "hat-fedora",
    name: "Fedora",
    priceCoins: 150,
    category: "hats",
    owned: false,
    assetPath: "/assets/articles/hats/fedora/fedora_icon.png",
  },
  {
    id: "outfit-scarf",
    name: "Schal",
    priceCoins: 30,
    category: "scarfs",
    owned: false,
    assetPath: "/assets/articles/scarfs/FC_Winterthur_scarf/scarf_icon.png",
  },
];
