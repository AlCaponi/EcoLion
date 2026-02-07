import type { AssetDTO } from "../contracts/types.ts";

export const assets: AssetDTO[] = [
  { id: "hat-cap", url: "/assets/shop/hat-cap.png", category: "hats" },
  { id: "hat-tophat", url: "/assets/shop/hat-tophat.png", category: "hats" },
  {
    id: "acc-sunglasses",
    url: "/assets/shop/acc-sunglasses.png",
    category: "glasses",
  },
  {
    id: "acc-monocle",
    url: "/assets/shop/acc-monocle.png",
    category: "glasses",
  },
  {
    id: "scarf-wool",
    url: "/assets/shop/scarf-wool.png",
    category: "scarfs",
  },
  {
    id: "earring-gold",
    url: "/assets/shop/earring-gold.png",
    category: "earrings",
  },
  {
    id: "outfit-scarf",
    url: "/assets/shop/outfit-scarf.png",
    category: "outfits",
  },
  {
    id: "decor-plant",
    url: "/assets/shop/decor-plant.png",
    category: "decor",
  },
];
