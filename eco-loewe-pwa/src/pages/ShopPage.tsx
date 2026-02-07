import { useEffect, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { ShopItemDTO, UserDTO } from "../shared/api/types";

// Coin packages for purchase
const COIN_PACKAGES = [
  { coins: 100, price: "CHF 4.90" },
  { coins: 300, price: "CHF 12.90" },
  { coins: 600, price: "CHF 24.90" },
  { coins: 1200, price: "CHF 44.90" },
];

export default function ShopPage() {
  const [items, setItems] = useState<ShopItemDTO[]>([]);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null);

  // Load user and shop items
  useEffect(() => {
    (async () => {
      try {
        const [userData, shopItems] = await Promise.all([
            Api.dashboard(),
            Api.shopItems()
        ]);
        setUser(userData);
        setItems(shopItems);
      } catch (e) {
        setMessage({ type: "error", text: "Fehler beim Laden der Shop-Daten" });
      }
    })();
  }, []);

  // Purchase item with coins
  async function buyItem(itemId: string) {
    if (!user || user.lion.coins < 10) {
      setMessage({ type: "error", text: "Nicht genug Coins!" });
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await Api.purchase({ itemId });
      setUser(updatedUser);
      
      // Update local items state to reflect ownership
      setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, owned: true } : item
      ));

      setMessage({ type: "success", text: "Artikel gekauft! 🎉" });
    } catch (e) {
      setMessage({ type: "error", text: "Kauf fehlgeschlagen" });
    } finally {
      setLoading(false);
    }
  }

  // Equip/unequip item
  async function toggleEquip(itemId: string, isEquipped: boolean) {
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = isEquipped ? await Api.unequip(itemId) : await Api.equip({ itemId });
      setUser(updatedUser);
    } catch (e) {
      setMessage({ type: "error", text: "Aktion fehlgeschlagen" });
    } finally {
      setLoading(false);
    }
  }

  // Buy coins with card (mock)
  async function buyCoinsMock(amount: number) {
    // Simulate payment processing
    setLoading(true);
    try {
      // In production: call Api.buyCoins({ amount, paymentMethod: "card" })
      // For demo: simulate successful payment
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!user) {
        setMessage({ type: "error", text: "Benutzer nicht geladen" });
        return;
      }

      const response = await Api.buyCoins({ amount, paymentMethod: "card" });

      setUser({
        ...user,
        lion: { ...user.lion, coins: response.newBalance },
      });

      setMessage({ type: "success", text: `${amount} Coins hinzugefügt! 🎉` });
      setShowPayment(false);
      setSelectedCoins(null);
    } catch (e) {
      setMessage({ type: "error", text: "Zahlungsvorgang fehlgeschlagen" });
    } finally {
      setLoading(false);
    }
  }

  // Get item price or button text
  function canAfford(item: ShopItemDTO): boolean {
    return user?.lion?.coins !== undefined ? user.lion.coins >= item.priceCoins : false;
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
          <div className="coinPurchaseSection">
            <div className="label" style={{ marginTop: "12px" }}>
              Coins kaufen mit Kreditkarte
            </div>
            <div className="coinPackages">
              {COIN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.coins}
                  className={`coinPackage ${selectedCoins === pkg.coins ? "selected" : ""}`}
                  onClick={() => setSelectedCoins(pkg.coins)}
                  disabled={loading}
                >
                  <div className="coins">{pkg.coins} 🪙</div>
                  <div className="price">{pkg.price}</div>
                </button>
              ))}
            </div>
            {selectedCoins && (
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <PrimaryButton
                  small
                  onClick={() => buyCoinsMock(selectedCoins)}
                  disabled={loading}
                >
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

      {/* Items Grid by Category */}
      {(["hats", "outfits", "accessories", "decor"] as const).map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category}>
            <h2 style={{ fontSize: "16px", fontWeight: "900", margin: "16px 0 8px" }}>
              {category === "hats"
                ? "👒 Hüte"
                : category === "outfits"
                  ? "👔 Outfits"
                  : category === "accessories"
                    ? "✨ Accessoires"
                    : "🎨 Dekor"}
            </h2>

            <div className="shopGrid">
              {categoryItems.map((item) => {
                  const isEquipped = user?.lion.accessories.includes(item.id) ?? false;
                  // Handle potential emoji assets gracefully (legacy items)
                  const isImage = item.assetPath.startsWith("/") || item.assetPath.endsWith(".png");

                  return (
                    <Card key={item.id}>
                    <div className="shopItem">
                        <div className="shopItemIcon">
                            {isImage ? (
                                <img src={item.assetPath} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            ) : (
                                <span style={{ fontSize: "3rem" }}>{item.assetPath}</span>
                            )}
                        </div>
                        <div className="shopItemName">{item.name}</div>

                        {item.owned ? (
                        <div className="shopItemOwned">
                            <div className="shopItemPrice">Im Besitz</div>
                            <PrimaryButton
                            small
                            disabled={loading}
                            onClick={() => toggleEquip(item.id, isEquipped)}
                            style={{
                                background: isEquipped ? "var(--brand)" : "var(--muted)",
                            }}
                            >
                            {isEquipped ? "Ausziehen" : "Anziehen"}
                            </PrimaryButton>
                        </div>
                        ) : (
                        <>
                            <div className="shopItemPrice">{item.priceCoins} Coins</div>
                            <PrimaryButton
                            small
                            disabled={loading || !canAfford(item)}
                            onClick={() => buyItem(item.id)}
                            >
                            Kaufen
                            </PrimaryButton>
                        </>
                        )}
                    </div>
                    </Card>
                  );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
