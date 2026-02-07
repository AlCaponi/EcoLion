import { useState } from "react";
import type { QuestDTO, MilestoneDTO, RewardDTO, RewardCategory } from "../shared/api/types";

/* ── Mock rewards (linked via rewardId in milestones) ─────── */

// Generate expiry date once: 90 days from now
const defaultExpiryDate = new Date(Date.now() + 90 * 24 * 3600_000).toISOString();

const mockRewards: RewardDTO[] = [
  {
    id: "r1",
    title: "10% Rabatt — Technorama",
    description: "Gültig für 1 Erwachsenen-Eintritt im Swiss Science Center Technorama",
    partner: "Technorama Winterthur",
    category: "culture",
    icon: "🎭",
    claimed: false,
    expiresAt: defaultExpiryDate,
    code: "ECO-TECH-10",
  },
  {
    id: "r2",
    title: "Gratis Velo-Check",
    description: "Kostenloser Sicherheits-Check bei Velo Winterthur",
    partner: "Velo Winterthur",
    category: "mobility",
    icon: "🚲",
    claimed: false,
    expiresAt: defaultExpiryDate,
    code: "ECO-VELO-CHK",
  },
  {
    id: "r3",
    title: "CHF 15 Gutschein — Bistro Chez Oskar",
    description: "Einlösbar auf Speisen & Getränke im Chez Oskar am Neumarkt",
    partner: "Bistro Chez Oskar",
    category: "gastro",
    icon: "🍽️",
    claimed: false,
    expiresAt: defaultExpiryDate,
    code: "ECO-OSKAR-15",
  },
  {
    id: "r4",
    title: "20% Rabatt — Kletterhalle",
    description: "Einmalig 20% auf einen Eintritt in der Kletterhalle Winterthur",
    partner: "Kletterhalle Winterthur",
    category: "sport",
    icon: "🧗",
    claimed: false,
    expiresAt: defaultExpiryDate,
    code: "ECO-KLETTER-20",
  },
  {
    id: "r5",
    title: "Tages-GA zum halben Preis",
    description: "50% Rabatt auf ein Tages-GA der Stadtbus Winterthur",
    partner: "Stadtbus Winterthur",
    category: "mobility",
    icon: "🚌",
    claimed: false,
    expiresAt: defaultExpiryDate,
    code: "ECO-STBUS-50",
  },
];

/* ── Mock quests ──────────────────────────────── */

const mockQuests: QuestDTO[] = [
  {
    id: "q1",
    title: "Velo-Pendler",
    description: "Fahre heute mit dem Velo zur Arbeit",
    icon: "🚲",
    frequency: "daily",
    progress: 1,
    goal: 1,
    rewardCoins: 20,
    rewardXp: 30,
    completed: true,
    claimed: false,
    resetsAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
  },
  {
    id: "q2",
    title: "ÖV-Held",
    description: "Nutze diese Woche 5× den öffentlichen Verkehr",
    icon: "🚌",
    frequency: "weekly",
    progress: 3,
    goal: 5,
    rewardCoins: 50,
    rewardXp: 80,
    completed: false,
    claimed: false,
    resetsAt: new Date(Date.now() + 3 * 24 * 3600_000).toISOString(),
  },
  {
    id: "q3",
    title: "Zu Fuss Entdecker",
    description: "Lege heute 3 km zu Fuss zurück",
    icon: "🚶",
    frequency: "daily",
    progress: 2.1,
    goal: 3,
    rewardCoins: 15,
    rewardXp: 20,
    completed: false,
    claimed: false,
    resetsAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
  },
  {
    id: "q4",
    title: "Car-Free Weekend",
    description: "Nutze am Wochenende kein Auto",
    icon: "🌿",
    frequency: "weekly",
    progress: 2,
    goal: 2,
    rewardCoins: 60,
    rewardXp: 100,
    completed: true,
    claimed: false,
    resetsAt: new Date(Date.now() + 5 * 24 * 3600_000).toISOString(),
  },
];

/* ── Mock milestones ──────────────────────────── */

const mockMilestones: MilestoneDTO[] = [
  {
    id: "m1",
    title: "Erste 10 kg CO₂ gespart",
    description: "Spare insgesamt 10 kg CO₂ ein",
    icon: "🌱",
    progress: 10,
    goal: 10,
    rewardId: "r1",
    completed: true,
    claimed: false,
  },
  {
    id: "m2",
    title: "50 km mit dem Velo",
    description: "Lege insgesamt 50 km mit dem Velo zurück",
    icon: "🚴",
    progress: 37,
    goal: 50,
    rewardId: "r2",
    completed: false,
    claimed: false,
  },
  {
    id: "m3",
    title: "30 Tage Streak",
    description: "Halte 30 Tage am Stück deinen Streak",
    icon: "🔥",
    progress: 12,
    goal: 30,
    rewardId: "r3",
    completed: false,
    claimed: false,
  },
  {
    id: "m4",
    title: "100 kg CO₂ gespart",
    description: "Spare insgesamt 100 kg CO₂ ein",
    icon: "🌍",
    progress: 42,
    goal: 100,
    rewardId: "r4",
    completed: false,
    claimed: false,
  },
  {
    id: "m5",
    title: "7 Tage autofrei",
    description: "Verbringe 7 Tage komplett ohne Auto",
    icon: "🚗❌",
    progress: 7,
    goal: 7,
    rewardId: "r5",
    completed: true,
    claimed: false,
  },
];

/* ── Category config ─── */
const categoryInfo: Record<RewardCategory, { label: string; emoji: string }> = {
  gastro: { label: "Gastronomie", emoji: "🍽️" },
  mobility: { label: "Mobilität", emoji: "🚌" },
  culture: { label: "Kultur", emoji: "🎭" },
  sport: { label: "Sport", emoji: "⚽" },
  shopping: { label: "Shopping", emoji: "🛍️" },
};

/* ── Component ─────────────────────────────────── */
export default function RewardsPage() {
  const [quests, setQuests] = useState<QuestDTO[]>(mockQuests);
  const [milestones, setMilestones] = useState<MilestoneDTO[]>(mockMilestones);
  const [rewards, setRewards] = useState<RewardDTO[]>(mockRewards);
  const [tab, setTab] = useState<"quests" | "rewards">("quests");

  /* Look up reward by id */
  const getReward = (id: string) => rewards.find((r) => r.id === id);

  /* Claim a quest */
  const claimQuest = (id: string) => {
    setQuests((prev) => {
      const quest = prev.find((q) => q.id === id);
      // Only allow claiming if the quest exists, is completed, and not already claimed
      if (!quest || quest.claimed || !quest.completed) {
        return prev;
      }
      return prev.map((q) =>
        q.id === id ? { ...q, claimed: true } : q
      );
    });
  };

  /* Claim a milestone → unlock its reward */
  const claimMilestone = (id: string, rewardId: string) => {
    // Use functional updates with rewardId passed in to avoid stale state
    let shouldUpdateReward = false;
    
    setMilestones((prev) => {
      const ms = prev.find((m) => m.id === id);
      // Only allow claiming if the milestone exists, is completed, and not already claimed
      if (!ms || ms.claimed || !ms.completed) {
        return prev;
      }
      shouldUpdateReward = true;
      return prev.map((m) => (m.id === id ? { ...m, claimed: true } : m));
    });
    
    if (shouldUpdateReward) {
      setRewards((prev) =>
        prev.map((r) =>
          r.id === rewardId
            ? { ...r, claimed: true, claimedAt: new Date().toISOString() }
            : r
        )
      );
    }
  };

  /* Derived */
  const dailyQuests = quests.filter((q) => q.frequency === "daily");
  const weeklyQuests = quests.filter((q) => q.frequency === "weekly");
  const unclaimedMilestones = milestones.filter((m) => !m.claimed);
  const claimedMilestones = milestones.filter((m) => m.claimed);
  const claimedRewards = rewards.filter((r) => r.claimed);

  return (
    <div className="rewardsPage">
      {/* ── Header ── */}
      <header className="rwHeader">
        <h1>🎁 Belohnungen</h1>
        <p className="rwSubtitle">Verdiene Rewards durch nachhaltiges Handeln</p>
      </header>

      {/* ── Tab bar ── */}
      <div className="rwTabs">
        <button
          className={`rwTab ${tab === "quests" ? "active" : ""}`}
          onClick={() => setTab("quests")}
        >
          Quests
        </button>
        <button
          className={`rwTab ${tab === "rewards" ? "active" : ""}`}
          onClick={() => setTab("rewards")}
        >
          Meine Rewards
        </button>
      </div>

      {/* ── Quests tab ── */}
      {tab === "quests" && (
        <>
          {/* Daily */}
          <section className="rwSection">
            <h2 className="rwSectionTitle">📅 Tägliche Quests</h2>
            <div className="rwQuestList">
              {dailyQuests.map((q) => (
                <QuestCard key={q.id} quest={q} onClaim={claimQuest} />
              ))}
            </div>
          </section>

          {/* Weekly */}
          <section className="rwSection">
            <h2 className="rwSectionTitle">📆 Wöchentliche Quests</h2>
            <div className="rwQuestList">
              {weeklyQuests.map((q) => (
                <QuestCard key={q.id} quest={q} onClaim={claimQuest} />
              ))}
            </div>
          </section>

          {/* Milestones */}
          <section className="rwSection">
            <h2 className="rwSectionTitle">🏅 Meilensteine</h2>
            <div className="rwMilestoneList">
              {unclaimedMilestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  reward={getReward(m.rewardId)}
                  onClaim={claimMilestone}
                />
              ))}
              {claimedMilestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  reward={getReward(m.rewardId)}
                  onClaim={claimMilestone}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── My Rewards tab ── */}
      {tab === "rewards" && (
        <section className="rwSection">
          {claimedRewards.length === 0 ? (
            <div className="rwEmpty">
              <span className="rwEmptyIcon">🎯</span>
              <p>Noch keine Rewards eingelöst.</p>
              <p className="rwEmptyHint">
                Schliesse Meilensteine ab, um Rewards von lokalen Partnern zu erhalten!
              </p>
            </div>
          ) : (
            <div className="rwRewardList">
              {claimedRewards.map((r) => (
                <RewardCard key={r.id} reward={r} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ── Quest Card ──────────────────────────────── */
function QuestCard({
  quest,
  onClaim,
}: {
  quest: QuestDTO;
  onClaim: (id: string) => void;
}) {
  const pct = Math.min((quest.progress / quest.goal) * 100, 100);

  return (
    <div className={`rwQuestCard ${quest.claimed ? "claimed" : ""}`}>
      <div className="rwQuestIcon">{quest.icon}</div>
      <div className="rwQuestBody">
        <div className="rwQuestHeader">
          <strong>{quest.title}</strong>
          <span className="rwQuestPoints">+{quest.rewardCoins} 🪙</span>
        </div>
        <p className="rwQuestDesc">{quest.description}</p>
        <div className="rwProgressBar">
          <div className="rwProgressFill" style={{ width: `${pct}%` }} />
        </div>
        <div className="rwProgressLabel">
          {quest.completed
            ? `${quest.goal} / ${quest.goal}`
            : `${Number(quest.progress.toFixed(1))} / ${quest.goal}`}
        </div>
      </div>
      {quest.completed && !quest.claimed && (
        <button
          className="rwClaimBtn"
          onClick={() => onClaim(quest.id)}
          aria-label={`Quest-Belohnung für "${quest.title}" einlösen`}
        >
          ✓
        </button>
      )}
      {quest.claimed && <span className="rwClaimedBadge">✅</span>}
    </div>
  );
}

/* ── Milestone Card ──────────────────────────── */
function MilestoneCard({
  milestone,
  reward,
  onClaim,
}: {
  milestone: MilestoneDTO;
  reward: RewardDTO | undefined;
  onClaim: (id: string, rewardId: string) => void;
}) {
  const pct = Math.min((milestone.progress / milestone.goal) * 100, 100);
  const cat = reward ? categoryInfo[reward.category] : null;

  return (
    <div className={`rwMilestoneCard ${milestone.claimed ? "claimed" : ""}`}>
      <div className="rwMilestoneTop">
        <span className="rwMilestoneIcon">{milestone.icon}</span>
        <div className="rwMilestoneInfo">
          <strong>{milestone.title}</strong>
          <p className="rwMilestoneDesc">{milestone.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="rwProgressBar large">
        <div className="rwProgressFill" style={{ width: `${pct}%` }} />
      </div>
      <div className="rwProgressLabel">
        {milestone.progress} / {milestone.goal}
      </div>

      {/* Reward preview */}
      {reward && cat && (
        <>
          <div className="rwRewardPreview">
            <span className="rwRewardCat">
              {cat.emoji} {cat.label}
            </span>
            <span className="rwRewardPartner">{reward.partner}</span>
          </div>
          <p className="rwRewardTitle">{reward.title}</p>
        </>
      )}

      {milestone.completed && !milestone.claimed && (
        <button
          className="rwClaimBtnLarge"
          onClick={() => onClaim(milestone.id, milestone.rewardId)}
          aria-label="Reward einlösen"
        >
          <span aria-hidden="true">🎁</span> Reward einlösen
        </button>
      )}
      {milestone.claimed && <div className="rwClaimedLabel">✅ Eingelöst</div>}
    </div>
  );
}

/* ── Reward Card (in My Rewards) ─────────────── */
function RewardCard({ reward }: { reward: RewardDTO }) {
  const cat = categoryInfo[reward.category];

  return (
    <div className="rwRewardCard">
      <div className="rwRewardCardHeader">
        <span>{cat.emoji}</span>
        <span className="rwRewardCatLabel">{cat.label}</span>
      </div>
      <h3 className="rwRewardCardTitle">{reward.title}</h3>
      <p className="rwRewardCardDesc">{reward.description}</p>
      <div className="rwRewardCardPartner">{reward.partner}</div>
      {reward.code && (
        <div className="rwRewardCode">
          <span className="rwCodeLabel">Code:</span>
          <span className="rwCodeValue">{reward.code}</span>
        </div>
      )}
      {reward.expiresAt && (
        <p className="rwRewardExpiry">
          Gültig bis {new Date(reward.expiresAt).toLocaleDateString("de-CH")}
        </p>
      )}
    </div>
  );
}
