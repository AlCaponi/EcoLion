import { useEffect, useMemo, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { LeaderboardDTO, LeaderboardEntry, QuartierEntry } from "../shared/api/types";

type Tab = "freunde" | "quartiere" | "stadt";

const MOCK: LeaderboardDTO = {
  streakDays: 8,
  quartiers: [
    { id: "k3", name: "Seen",            co2SavedKg: 520, rank: 1 },
    { id: "k1", name: "Stadt",           co2SavedKg: 495, rank: 2 },
    { id: "k4", name: "Töss",            co2SavedKg: 470, rank: 3, isMe: true },
    { id: "k2", name: "Oberwinterthur",  co2SavedKg: 450, rank: 4 },
    { id: "k5", name: "Veltheim",        co2SavedKg: 420, rank: 5 },
    { id: "k7", name: "Mattenbach",      co2SavedKg: 390, rank: 6 },
    { id: "k6", name: "Wülflingen",      co2SavedKg: 350, rank: 7 },
  ],
  friends: [
    { id: "p1", name: "Paul",  co2SavedKg: 95, rank: 1 },
    { id: "p2", name: "Alex",  co2SavedKg: 80, rank: 2 },
    { id: "me", name: "Du",    co2SavedKg: 74, rank: 3, isMe: true },
    { id: "p3", name: "Sarah", co2SavedKg: 70, rank: 4 },
    { id: "p4", name: "Lisa",  co2SavedKg: 62, rank: 5 },
  ],
  city: [
    { id: "c1",  name: "MaxGreen",    co2SavedKg: 210, rank: 1 },
    { id: "c2",  name: "EcoQueen",    co2SavedKg: 195, rank: 2 },
    { id: "c3",  name: "BikeHero",    co2SavedKg: 180, rank: 3 },
    { id: "c4",  name: "TrainLover",  co2SavedKg: 160, rank: 4 },
    { id: "c5",  name: "WalkFan",     co2SavedKg: 145, rank: 5 },
    // gap — neighbors around the user
    { id: "c41", name: "SolarSam",    co2SavedKg: 78,  rank: 41 },
    { id: "c42", name: "GreenStep",   co2SavedKg: 76,  rank: 42 },
    { id: "me",  name: "Du",          co2SavedKg: 74,  rank: 43, isMe: true },
    { id: "c44", name: "GreenRookie", co2SavedKg: 71,  rank: 44 },
    { id: "c45", name: "Newbie123",   co2SavedKg: 68,  rank: 45 },
  ],
};

/** Split entries into podium (top 3) and the rest, with gap logic for "me" */
function splitPodiumAndList(entries: LeaderboardEntry[]) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const meIdx = rest.findIndex((e) => e.isMe);

  // If the rest is small enough or "me" is near the top, show everything
  if (rest.length <= 6 || meIdx < 0 || meIdx <= 3) {
    return { podium, list: rest };
  }

  // Otherwise: show first 2 below podium + gap + neighbors around me
  const top = rest.slice(0, 2);
  const neighborStart = Math.max(meIdx - 1, 2);
  const neighborEnd = Math.min(meIdx + 2, rest.length);
  const neighbors = rest.slice(neighborStart, neighborEnd);

  const list: (LeaderboardEntry | "gap")[] = [...top, "gap", ...neighbors];
  return { podium, list };
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardDTO | null>(null);
  const [tab, setTab] = useState<Tab>("freunde");
  const [poking, setPoking] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await Api.leaderboard();
        setData(res);
      } catch {
        setData(MOCK);
      }
    })();
  }, []);

  const { podium, list } = useMemo(() => {
    if (!data) return { podium: [], list: [] };
    const entries =
      tab === "quartiere"
        ? (data.quartiers as LeaderboardEntry[])
        : tab === "stadt"
          ? data.city
          : data.friends;
    return splitPodiumAndList(entries);
  }, [data, tab]);

  const myEntry = useMemo(() => {
    if (!data) return null;
    const entries =
      tab === "quartiere" ? data.quartiers : tab === "stadt" ? data.city : data.friends;
    return (entries as LeaderboardEntry[]).find((e) => e.isMe) ?? null;
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

  // Podium order: 2nd – 1st – 3rd (classic grandstand layout)
  const podiumOrder = podium.length >= 3
    ? [podium[1], podium[0], podium[2]]
    : podium;
  const podiumPlaces = ["second", "first", "third"];

  function entryLabel(entry: LeaderboardEntry) {
    if (tab === "quartiere") return (entry as QuartierEntry).name;
    return entry.name;
  }

  return (
    <div className="page leaderboardPage">
      <div className="lbHeader">
        <h1>🏆 Leaderboard</h1>
        <p className="lbSubtitle">Wer spart am meisten CO₂?</p>
      </div>

      {/* ── Tab bar ── */}
      <div className="segmented full">
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
              <div className="myRankName">{entryLabel(myEntry)}</div>
              <div className="myRankStat">{myEntry.co2SavedKg} kg CO₂ gespart</div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Podium / Grandstand ── */}
      {podiumOrder.length >= 3 && (
        <div className="podium">
          {podiumOrder.map((entry, i) => {
            if (!entry) return null;
            const place = podiumPlaces[i];
            const isMe = entry.isMe ?? false;
            return (
              <div key={entry.id} className={`podiumSlot ${place}${isMe ? " podiumMe" : ""}`}>
                <div className="podiumRank">
                  {place === "first" ? "🥇" : place === "second" ? "🥈" : "🥉"}
                </div>
                <div className={`podiumBar ${place}`} />
                <div className="podiumAvatar">{entry.name.slice(0, 1)}</div>
                <div className="podiumName">{entryLabel(entry)}</div>
                <div className="podiumMetric">{entry.co2SavedKg} kg</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rank 4+ list ── */}
      {list.length > 0 && (
        <Card>
          <div className="rankList">
            {list.map((entry, i) => {
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
                    {entryLabel(entry)}
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
      )}
    </div>
  );
}
