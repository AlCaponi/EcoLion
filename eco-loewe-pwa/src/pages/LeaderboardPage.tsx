import { useEffect, useMemo, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { LeaderboardDTO, LeaderboardEntry, QuartierEntry } from "../shared/api/types";

type Tab = "quartiere" | "freunde" | "stadt";

const MOCK: LeaderboardDTO = {
  streakDays: 8,
  quartiers: [
    { id: "seen", name: "Seen", co2SavedKg: 520, rank: 1 },
    { id: "hegi", name: "Hegi", co2SavedKg: 480, rank: 2 },
    { id: "toss", name: "Töss", co2SavedKg: 470, rank: 3, isMe: true },
    { id: "oberi", name: "Oberwinterthur", co2SavedKg: 430, rank: 4 },
    { id: "wulfl", name: "Wülflingen", co2SavedKg: 390, rank: 5 },
    { id: "velt", name: "Veltheim", co2SavedKg: 350, rank: 6 },
  ],
  friends: [
    { id: "p1", name: "Paul", co2SavedKg: 95, rank: 1 },
    { id: "p2", name: "Alex", co2SavedKg: 80, rank: 2 },
    { id: "me", name: "Du", co2SavedKg: 74, rank: 3, isMe: true },
    { id: "p3", name: "Sarah", co2SavedKg: 70, rank: 4 },
    { id: "p4", name: "Lisa", co2SavedKg: 62, rank: 5 },
  ],
  city: [
    { id: "c1", name: "MaxGreen", co2SavedKg: 210, rank: 1 },
    { id: "c2", name: "EcoQueen", co2SavedKg: 195, rank: 2 },
    { id: "c3", name: "BikeHero", co2SavedKg: 180, rank: 3 },
    // gap — show neighbors around the user
    { id: "c41", name: "WalkFan", co2SavedKg: 78, rank: 41 },
    { id: "c42", name: "TrainLover", co2SavedKg: 76, rank: 42 },
    { id: "me", name: "Du", co2SavedKg: 74, rank: 43, isMe: true },
    { id: "c44", name: "GreenRookie", co2SavedKg: 71, rank: 44 },
    { id: "c45", name: "Newbie123", co2SavedKg: 68, rank: 45 },
  ],
};

/** Build a display list: top 3 + gap + neighbors around "me" */
function buildDisplayList(entries: LeaderboardEntry[]): (LeaderboardEntry | "gap")[] {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const meIdx = sorted.findIndex((e) => e.isMe);

  // If all entries fit easily or "me" is in top 5, just return all
  if (sorted.length <= 7 || meIdx <= 4) return sorted;

  const top3 = sorted.slice(0, 3);
  const neighborStart = Math.max(meIdx - 1, 3);
  const neighborEnd = Math.min(meIdx + 2, sorted.length);
  const neighbors = sorted.slice(neighborStart, neighborEnd);

  return [...top3, "gap" as const, ...neighbors];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("freunde");
  const [poking, setPoking] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await Api.leaderboard();
        setData(res);
      } catch (e) {
        setData(MOCK);
        setError((e as Error).message);
      }
    })();
  }, []);

  const displayList = useMemo(() => {
    if (!data) return [];
    if (tab === "quartiere") return buildDisplayList(data.quartiers as LeaderboardEntry[]);
    if (tab === "stadt") return buildDisplayList(data.city);
    return buildDisplayList(data.friends);
  }, [data, tab]);

  const myEntry = useMemo(() => {
    if (!data) return null;
    const list = tab === "quartiere" ? data.quartiers : tab === "stadt" ? data.city : data.friends;
    return (list as LeaderboardEntry[]).find((e) => e.isMe) ?? null;
  }, [data, tab]);

  async function poke(friendId: string) {
    try {
      setPoking(friendId);
      await Api.pokeFriend(friendId);
    } catch {
      /* ignore in mock mode */
    } finally {
      setPoking(null);
    }
  }

  return (
    <div className="page leaderboardPage">
      <h1>Leaderboard</h1>
      {error && <p className="hint">Demo-Daten — Backend nicht erreichbar.</p>}

      {/* ── Tab bar ── */}
      <div className="segmented">
        {([
          ["freunde", "Freunde"],
          ["quartiere", "Quartiere"],
          ["stadt", "Stadt"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
            aria-selected={tab === key}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Your position summary ── */}
      {myEntry && (
        <Card>
          <div className="myRankCard">
            <div className="myRankPos">#{myEntry.rank}</div>
            <div className="myRankDetails">
              <div className="myRankName">{tab === "quartiere" ? (myEntry as QuartierEntry).name : "Du"}</div>
              <div className="myRankStat">{myEntry.co2SavedKg} kg CO₂ gespart</div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Ranking list ── */}
      <Card>
        <div className="rankList">
          {displayList.map((entry, i) => {
            if (entry === "gap") {
              return <div key={`gap-${i}`} className="rankGap">···</div>;
            }
            const isMe = entry.isMe ?? false;
            const showPoke = tab === "freunde" && !isMe;

            return (
              <div key={entry.id} className={`rankRow${isMe ? " rankRowMe" : ""}`}>
                <div className="rankPos">{entry.rank}</div>
                <div className="rankAvatar">{entry.name.slice(0, 1)}</div>
                <div className="rankName">
                  {entry.name}
                  {isMe && tab !== "quartiere" && <span className="youBadge">Du</span>}
                </div>
                <div className="rankMetric">{entry.co2SavedKg} kg</div>
                {showPoke && (
                  <PrimaryButton
                    small
                    onClick={() => poke(entry.id)}
                    disabled={poking === entry.id}
                  >
                    {poking === entry.id ? "…" : "🫳"}
                  </PrimaryButton>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
