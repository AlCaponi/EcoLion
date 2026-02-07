import type { ShopItemDTO } from "../contracts/types.ts";

export const shopItems: ShopItemDTO[] = [
  {
    id: "hat-cap",
    name: "Basecap",
    priceCoins: 50,
    category: "hats",
    owned: false,
    assetPath: "/assets/shop/hat-cap.png",
  },
  {
    id: "hat-tophat",
    name: "Zylinder",
    priceCoins: 120,
    category: "hats",
    owned: false,
    assetPath: "/assets/shop/hat-tophat.png",
  },
  {
    id: "outfit-scarf",
    name: "Schal",
    priceCoins: 30,
    category: "outfits",
    owned: false,
    assetPath: "/assets/shop/outfit-scarf.png",
  },
  {
    id: "acc-sunglasses",
    name: "Sonnenbrille",
    priceCoins: 40,
    category: "accessories",
    owned: false,
    assetPath: "/assets/shop/acc-sunglasses.png",
  },
  {
    id: "decor-plant",
    name: "Pflanze",
    priceCoins: 25,
    category: "decor",
    owned: false,
    assetPath: "/assets/shop/decor-plant.png",
  },
];
