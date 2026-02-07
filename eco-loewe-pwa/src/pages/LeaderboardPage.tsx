import { useEffect, useMemo, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { LeaderboardDTO, LeaderboardEntry, QuartierEntry } from "../shared/api/types";

type Tab = "quartiere" | "stadt" | "freund";

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
  friends: [
    { user: { id: "c2", displayName: "EcoQueen" }, score: 195, rank: 1 },
    { user: { id: "c41", displayName: "SolarSam" }, score: 78, rank: 2 },
    { user: { id: "c44", displayName: "GreenRookie" }, score: 71, rank: 3 },
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
  const [friendName, setFriendName] = useState("");
  const [friendQuery, setFriendQuery] = useState("");
  const [friendsPool, setFriendsPool] = useState<
    { id: string; displayName: string }[]
  >([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [addingFriend, setAddingFriend] = useState(false);

  const loadLeaderboard = async () => {
    try {
      const res = await Api.leaderboard();
      setData(res);
    } catch {
      setData(MOCK);
    }
  };

  useEffect(() => {
    void loadLeaderboard();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await Api.users();
        setFriendsPool(res);
      } catch {
        setFriendsPool([]);
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

  const friendEntries = useMemo<LeaderboardEntry[]>(() => {
    if (!data) return [];
    const friends = Array.isArray(data.friends) ? data.friends : [];
    return friends.map((entry) => ({
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
        : tab === "freund"
          ? friendEntries
          : userEntries;
    return splitPodiumAndList(entries);
  }, [data, tab, userEntries, friendEntries]);

  const myEntry = useMemo(() => {
    if (!data) return null;
    const entries =
      tab === "quartiere"
        ? (Array.isArray(data.quartiers) ? data.quartiers : [])
        : tab === "freund"
          ? friendEntries
          : userEntries;
    return (entries as LeaderboardEntry[]).find((e) => e.isMe) ?? null;
  }, [data, tab, userEntries, friendEntries]);

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

  async function addFriend() {
    const userId = selectedFriendId;
    if (!userId || addingFriend) return;
    try {
      setAddingFriend(true);
      await Api.addFriend({ userId });
      setFriendName("");
      setFriendQuery("");
      setSelectedFriendId(null);
      await loadLeaderboard();
    } catch {
      /* ignore in mock mode */
    } finally {
      setAddingFriend(false);
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

  function matchScore(name: string, query: string) {
    const n = name.toLowerCase();
    const q = query.trim().toLowerCase();
    if (!q) return -1;
    if (n.includes(q)) {
      return 20 + q.length;
    }
    let qi = 0;
    for (let i = 0; i < n.length && qi < q.length; i++) {
      if (n[i] === q[qi]) {
        qi += 1;
      }
    }
    if (qi === q.length) {
      return 10 + q.length;
    }
    return -1;
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
          ["freund", "Freunde"],
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

      {tab === "freund" && (
        <Card>
          <div className="friendAdd">
            <div className="friendSearch">
              <input
                type="text"
                placeholder="Freund:in suchen"
                value={friendQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setFriendQuery(value);
                  setFriendName(value);
                  setSelectedFriendId(null);
                }}
              />
              {friendQuery.trim().length > 0 && (
                <div className="friendDropdown">
                  {friendsPool
                    .filter((user) => user.displayName !== friendName)
                    .map((user) => ({
                      user,
                      score: matchScore(user.displayName, friendQuery),
                    }))
                    .filter(({ score }) => score >= 0)
                    .sort(
                      (a, b) =>
                        b.score - a.score ||
                        a.user.displayName.localeCompare(b.user.displayName),
                    )
                    .slice(0, 6)
                    .map(({ user }) => (
                      <button
                        key={user.id}
                        type="button"
                        className="friendOption"
                        onClick={() => {
                          setFriendName(user.displayName);
                          setFriendQuery(user.displayName);
                          setSelectedFriendId(user.id);
                        }}
                      >
                        <span className="friendOptionName">{user.displayName}</span>
                        <span className="friendOptionId">{user.id}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
            <PrimaryButton
              small
              onClick={addFriend}
              disabled={addingFriend || !selectedFriendId}
            >
              {addingFriend ? "…" : "Hinzufügen"}
            </PrimaryButton>
          </div>
        </Card>
      )}

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
