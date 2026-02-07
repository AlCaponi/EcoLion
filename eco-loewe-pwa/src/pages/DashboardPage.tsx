import Card from "../shared/components/Card";
import "../styles/pages/dashboard.css";

export default function DashboardPage() {
  // City-wide stats (Winterthur)
  const cityStats = {
    totalCo2Saved: 156230,
    totalParticipants: 4856,
    totalKmSustainable: 2340850,
    airplaneHoursSaved: 8423,
    coinsInCirculation: 2450000,
  };

  // Latest challenges
  const challenges = [
    {
      id: 1,
      title: "Team Stadtzentrum vs Töss",
      status: "active",
      progress: 75,
      daysLeft: 3,
      reward: "500 Coins",
    },
    {
      id: 2,
      title: "Februar: 10,000 km Challenge",
      status: "active",
      progress: 62,
      daysLeft: 12,
      reward: "Exklusives Accessoire",
    },
    {
      id: 3,
      title: "Winterthur wird Grün",
      status: "completed",
      progress: 100,
      reward: "🏆 Abgeschlossen",
    },
  ];

  // Reward tiers / Shop items
  const rewards = [
    {
      id: 1,
      name: "Grünes T-Shirt",
      cost: 500,
      icon: "�",
      rarity: "common",
    },
    {
      id: 2,
      name: "Fahrradständer",
      cost: 1200,
      icon: "🚲",
      rarity: "rare",
    },
    {
      id: 3,
      name: "Eco-Tragetasche",
      cost: 300,
      icon: "🎒",
      rarity: "common",
    },
    {
      id: 4,
      name: "Premium Lion Accessoire",
      cost: 2500,
      icon: "👑",
      rarity: "legendary",
    },
    {
      id: 5,
      name: "Gutschein Café Altstadt",
      cost: 800,
      icon: "☕",
      rarity: "rare",
    },
    {
      id: 6,
      name: "Stadtbus Pass (1 Monat)",
      cost: 1500,
      icon: "🚌",
      rarity: "rare",
    },
  ];

  // User testimonials
  const testimonials = [
    {
      id: 1,
      name: "Marco S.",
      avatar: "😊",
      text: "Ich fahre jetzt täglich mit dem Fahrrad. Ecolion macht es so viel spaßiger!",
      co2Saved: 345,
    },
    {
      id: 2,
      name: "Nina K.",
      avatar: "🤩",
      text: "Mein Löwe ist so süß geworden! Die Accessoires sind das Beste.",
      lions: 3,
    },
    {
      id: 3,
      name: "Alex T.",
      avatar: "🌱",
      text: "Endlich ein System das CO2-Sparen belohnt. Winterthur macht es vor!",
      co2Saved: 289,
    },
  ];

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: "#9CA3AF",
      rare: "#3B82F6",
      legendary: "#FBBF24",
    };
    return colors[rarity] || "#9CA3AF";
  };

  return (
    <div className="page homePage">
      {/* Hero Section */}
      <div className="heroSection">
        <h1>🌍 Winterthur wird Grün</h1>
        <p className="heroSubtitle">Gemeinsam für nachhaltige Mobilität</p>
      </div>

      {/* City Stats */}
      <Card>
        <h2 className="sectionTitle">Unsere Wirkung</h2>
        <div className="cityStatsGrid">
          <div className="cityStat">
            <span className="statNumber">{(cityStats.totalCo2Saved / 1000).toFixed(0)}</span>
            <span className="statLabel">Tonnen CO₂ eingespart</span>
            <span className="statSubtext">Der Stadt</span>
          </div>
          <div className="cityStat">
            <span className="statNumber">{cityStats.totalParticipants.toLocaleString()}</span>
            <span className="statLabel">Aktive Teilnehmer</span>
            <span className="statSubtext">in Winterthur</span>
          </div>
          <div className="cityStat">
            <span className="statNumber">{(cityStats.totalKmSustainable / 1000).toFixed(0)}k</span>
            <span className="statLabel">Kilometer nachhaltig</span>
            <span className="statSubtext">Zu Fuß & ÖV</span>
          </div>
          <div className="cityStat">
            <span className="statNumber">{cityStats.airplaneHoursSaved.toLocaleString()}</span>
            <span className="statLabel">Flugstunden erspart</span>
            <span className="statSubtext">= Weniger Emissionen</span>
          </div>
        </div>
      </Card>

      {/* Active Challenges */}
      <Card>
        <h2 className="sectionTitle">🎯 Aktive Challenges</h2>
        <div className="challengesList">
          {challenges.map((challenge) => (
            <div key={challenge.id} className={`challengeItem ${challenge.status}`}>
              <div className="challengeHeader">
                <h3>{challenge.title}</h3>
                <span className={`badge ${challenge.status}`}>
                  {challenge.status === "active"
                    ? `${challenge.daysLeft}d`
                    : "✓"}
                </span>
              </div>

              {challenge.status === "active" && (
                <>
                  <div className="progressBar">
                    <div
                      className="progressFill"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <span className="progressText">{challenge.progress}%</span>
                </>
              )}

              <p className="challengeReward">🎁 Reward: {challenge.reward}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Rewards / Shop Items */}
      <Card>
        <h2 className="sectionTitle">💎 Was du verdienen kannst</h2>
        <p className="rewardsSubtext">
          Tausche deine Coins gegen echte Rewards
        </p>
        <div className="rewardsGrid">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="rewardItem"
              style={{
                borderTop: `3px solid ${getRarityColor(reward.rarity)}`,
              }}
            >
              <span className="rewardIcon">{reward.icon}</span>
              <h4>{reward.name}</h4>
              <div className="rewardCost">
                <span className="coinIcon">🪙</span>
                <span>{reward.cost}</span>
              </div>
              <span className="rarityTag" style={{ color: getRarityColor(reward.rarity) }}>
                {reward.rarity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* User Testimonials */}
      <Card>
        <h2 className="sectionTitle">💬 Das sagen unsere Nutzer</h2>
        <div className="testimonialsList">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonialItem">
              <div className="testimonialHeader">
                <span className="testimonialAvatar">{testimonial.avatar}</span>
                <h4>{testimonial.name}</h4>
              </div>
              <p className="testimonialText">"{testimonial.text}"</p>
              <div className="testimonialStat">
                {testimonial.co2Saved && (
                  <span>🌍 {testimonial.co2Saved} kg CO₂ gespart</span>
                )}
                {testimonial.lions && (
                  <span>🦁 {testimonial.lions} Löwen gezüchtet</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Impact Stats */}
      <Card>
        <h2 className="sectionTitle">📈 Coins im Umlauf</h2>
        <div className="coinsCirculation">
          <div className="circulationBig">
            <span className="coinIcon">🪙</span>
            <span className="amount">
              {(cityStats.coinsInCirculation / 1000000).toFixed(1)}M
            </span>
          </div>
          <p className="circulationText">
            Coins wurden bereits für Rewards eingelöst und unterstützen lokale Partner wie
            Stadtbus Winterthur, House of Winterthur und mehr!
          </p>
        </div>
      </Card>

      {/* CTA */}
      <Card>
        <div className="ctaSection">
          <h3>🚀 Du möchtest mitmachen?</h3>
          <p>
            Jeden Tag ein wenig nachhaltiger unterwegs sein, deinen Löwen aufleveln und
            echte Rewards gewinnen!
          </p>
          <button className="ctaButton">Jetzt downloaden</button>
        </div>
      </Card>
    </div>
  );
}

