import { useEffect, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { ShopItemDTO, UserDTO } from "../shared/api/types";

export default function ShopPage() {
  const [items, setItems] = useState<ShopItemDTO[]>([]);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

      {/* Coin Balance */}
      <Card>
        <div className="row between">
          <div>
            <div className="label">Deine Coins</div>
            <div className="coinBalance">{user?.lion.coins ?? 0} 🪙</div>
          </div>
          {/* Coin purchase removed as per decision */}
        </div>
      </Card>

      {/* Items Grid by Category */}
      {(["hats", "scarfs"] as const).map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category}>
            <h2 style={{ fontSize: "16px", fontWeight: "900", margin: "16px 0 8px" }}>
              {category === "hats"
                ? "👒 Hüte"
                : "🧣 Schals"}
            </h2>

            <div className="shopGrid">
              {categoryItems.map((item) => {
                  const isEquipped = user?.lion.accessories.includes(item.id) ?? false;
                  
                  // Check if another item of the same category is equipped
                  // We look through all equipped IDs, find their item details in 'items', and check category
                  const isCategoryOccupied = user?.lion.accessories.some(accId => {
                      if (accId === item.id) return false; // Skip self
                      const acc = items.find(i => i.id === accId);
                      return acc?.category === item.category;
                  });

                  // Handle potential emoji assets gracefully (legacy items)
                  const isImage = item.assetPath.startsWith("/") || item.assetPath.endsWith(".png");

                  return (
                    <Card key={item.id}>
                    <div className="shopItem">
                        <div className="shopItemIcon" style={{ padding: 0 }}>
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
                                background: isEquipped ? "var(--muted)" : "var(--brand)",
                                color: "white",
                                border: isEquipped ? "1px solid var(--muted)" : "none"
                            }}
                            >
                            {isEquipped 
                                ? "Ausziehen" 
                                : isCategoryOccupied 
                                    ? "Wechseln" 
                                    : "Anziehen"}
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
                            {canAfford(item) ? "Kaufen" : "Nicht genug"}
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