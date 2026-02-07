import { useEffect, useMemo, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { LeaderboardDTO, LeaderboardEntry, QuartierEntry } from "../shared/api/types";

type Tab = "quartiere" | "stadt";

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
  users: [
    { user: { id: "c1", displayName: "MaxGreen" }, score: 210, rank: 1 },
    { user: { id: "c2", displayName: "EcoQueen" }, score: 195, rank: 2 },
    { user: { id: "c3", displayName: "BikeHero" }, score: 180, rank: 3 },
    { user: { id: "c4", displayName: "TrainLover" }, score: 160, rank: 4 },
    { user: { id: "c5", displayName: "WalkFan" }, score: 145, rank: 5 },
    // gap — neighbors around the user
    { user: { id: "c41", displayName: "SolarSam" }, score: 78, rank: 41 },
    { user: { id: "c42", displayName: "GreenStep" }, score: 76, rank: 42 },
    { user: { id: "me", displayName: "Du" }, score: 74, rank: 43, isMe: true },
    { user: { id: "c44", displayName: "GreenRookie" }, score: 71, rank: 44 },
    { user: { id: "c45", displayName: "Newbie123" }, score: 68, rank: 45 },
  ],
};

/** Split entries into podium (top 3) and the rest, with gap logic for "me" */
function splitPodiumAndList(entries: LeaderboardEntry[] = []) {
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
  const [tab, setTab] = useState<Tab>("stadt");
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

  const userEntries = useMemo<LeaderboardEntry[]>(() => {
    if (!data) return [];
    const users = Array.isArray(data.users) ? data.users : [];
    return users.map((entry) => ({
      id: entry.user.id,
      name: entry.user.displayName,
      co2SavedKg: entry.score,
      rank: entry.rank,
      isMe: entry.isMe,
    }));
  }, [data]);

  const { podium, list } = useMemo(() => {
    if (!data) return { podium: [], list: [] };
    const entries =
      tab === "quartiere"
        ? ((Array.isArray(data.quartiers) ? data.quartiers : []) as LeaderboardEntry[])
        : userEntries;
    return splitPodiumAndList(entries);
  }, [data, tab, userEntries]);

  const myEntry = useMemo(() => {
    if (!data) return null;
    const entries = tab === "quartiere" ? (Array.isArray(data.quartiers) ? data.quartiers : []) : userEntries;
    return (entries as LeaderboardEntry[]).find((e) => e.isMe) ?? null;
  }, [data, tab, userEntries]);

  async function poke(userId: string) {
    try {
      setPoking(userId);
      await Api.pokeUser(userId);
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
          ["stadt", "Stadt"],
          ["quartiere", "Quartiere"],
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
              const showPoke = tab === "stadt" && !isMe;

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
