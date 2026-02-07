import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";

const MOCK_ITEMS = [
  { id: "hat-cap", name: "Basecap", priceCoins: 50, category: "hats" as const, emoji: "🧢" },
  { id: "outfit-scarf", name: "Schal", priceCoins: 30, category: "outfits" as const, emoji: "🧣" },
  { id: "acc-sunglasses", name: "Sonnenbrille", priceCoins: 40, category: "accessories" as const, emoji: "😎" },
  { id: "decor-plant", name: "Pflanze", priceCoins: 25, category: "decor" as const, emoji: "🪴" },
  { id: "hat-crown", name: "Goldene Krone", priceCoins: 500, category: "hats" as const, emoji: "👑" },
];

export default function ShopPage() {
  return (
    <div className="page shopPage">
      <h1>Shop</h1>

      <Card>
        <div className="row between">
          <div>
            <div className="label">Deine Coins</div>
            <div className="coinBalance">85 🪙</div>
          </div>
        </div>
      </Card>

      <div className="shopGrid">
        {MOCK_ITEMS.map((item) => (
          <Card key={item.id}>
            <div className="shopItem">
              <div className="shopItemIcon">{item.emoji}</div>
              <div className="shopItemName">{item.name}</div>
              <div className="shopItemPrice">{item.priceCoins} Coins</div>
              <PrimaryButton small>Kaufen</PrimaryButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
