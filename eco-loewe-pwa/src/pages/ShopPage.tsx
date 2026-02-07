
import { useEffect, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { UserDTO } from "../shared/api/types";

const COIN_PACKAGES = [
  { coins: 100, price: "CHF 4.90" },
  { coins: 300, price: "CHF 12.90" },
  { coins: 600, price: "CHF 24.90" },
  { coins: 1200, price: "CHF 44.90" },
];

const MOCK_ITEMS = [
  { id: "hat-cap", name: "Basecap", priceCoins: 50, category: "hats" as const, emoji: "🧢" },
  { id: "outfit-scarf", name: "Schal", priceCoins: 30, category: "outfits" as const, emoji: "🧣" },
  { id: "acc-sunglasses", name: "Sonnenbrille", priceCoins: 40, category: "accessories" as const, emoji: "😎" },
  { id: "decor-plant", name: "Pflanze", priceCoins: 25, category: "decor" as const, emoji: "🪴" }
];

export default function ShopPage() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null);

  // Load user dashboard on mount
  useEffect(() => {
    (async () => {
      try {
        const userData = await Api.dashboard();
        setUser(userData);
      } catch (e) {
        setMessage({ type: "error", text: "Fehler beim Laden der User-Daten" });
      }
    })();
  }, []);

  // Buy coins and update backend
  async function buyCoinsMock(amount: number) {
    setLoading(true);
    try {
      // Rufe neuen Backend-Endpoint auf (statt Mock)
      const result = await Api.buyCoins({
        amount,
        paymentMethod: "card",
      });

      // Update lokalen State mit neuer Balance vom Backend
      if (user) {
        setUser({
          ...user,
          lion: { ...user.lion, coins: result.newBalance },
        });
      }

      setMessage({
        type: "success",
        text: `${amount} Coins hinzugefügt! 🎉 (ID: ${result.transactionId})`,
      });
      setShowPayment(false);
      setSelectedCoins(null);
    } catch (e) {
      setMessage({ type: "error", text: "Zahlungsvorgang fehlgeschlagen" });
    } finally {
      setLoading(false);
    }
  }

  async function buyItem(itemId: string, priceCoins: number) {
    if (!user) return;

    if (user.lion.coins < priceCoins) {
      setMessage({ type: "error", text: "Nicht genug Coins!" });
      return;
    }

    setLoading(true);
    try {
      // Kaufe Item über Backend
      await Api.purchase({ itemId });
      // Refreshe User-Daten nach Kauf
      const updated = await Api.dashboard();
      setUser(updated);
      setMessage({ type: "success", text: "Artikel gekauft! 🎉" });
    } catch (e) {
      setMessage({ type: "error", text: "Kauf fehlgeschlagen" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page shopPage">
      <h1>Shop</h1>

      {message && (
        <Card className={`message message-${message.type}`}>
          <p>{message.text}</p>
        </Card>
      )}

      {/* Coin Balance & Buy Coins */}
      <Card>
        <div className="row between">
          <div>
            <div className="label">Deine Coins</div>
            <div className="coinBalance">{user?.lion.coins ?? 0} 🪙</div>
          </div>
          <PrimaryButton small onClick={() => setShowPayment(!showPayment)}>
            Coins kaufen →
          </PrimaryButton>
        </div>

        {showPayment && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
            <div className="label">Coins kaufen mit Kreditkarte</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", margin: "10px 0" }}>
              {COIN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.coins}
                  style={{
                    padding: "12px",
                    border: selectedCoins === pkg.coins ? "2px solid var(--brand)" : "1px solid var(--border)",
                    borderRadius: "10px",
                    background: selectedCoins === pkg.coins ? "color-mix(in srgb, var(--brand) 15%, white 85%)" : "white",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() => setSelectedCoins(pkg.coins)}
                  disabled={loading}
                >
                  <div style={{ fontSize: "16px", fontWeight: "900", color: "var(--brand)" }}>
                    {pkg.coins} 🪙
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                    {pkg.price}
                  </div>
                </button>
              ))}
            </div>
            {selectedCoins && (
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <PrimaryButton small onClick={() => buyCoinsMock(selectedCoins)} disabled={loading}>
                  {loading ? "Verarbeite..." : "Bezahlen"}
                </PrimaryButton>
                <PrimaryButton
                  small
                  onClick={() => setShowPayment(false)}
                  style={{ background: "var(--muted)", color: "white" }}
                >
                  Abbrechen
                </PrimaryButton>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Items Grid */}
      <div className="shopGrid">
        {MOCK_ITEMS.map((item) => (
          <Card key={item.id}>
            <div className="shopItem">
              <div className="shopItemIcon">{item.emoji}</div>
              <div className="shopItemName">{item.name}</div>
              <div className="shopItemPrice">{item.priceCoins} Coins</div>
              <PrimaryButton
                small
                disabled={loading || !user || user.lion.coins < item.priceCoins}
                onClick={() => buyItem(item.id, item.priceCoins)}
              >
                Kaufen
              </PrimaryButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};