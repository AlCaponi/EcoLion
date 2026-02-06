import { useEffect, useMemo, useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { LeaderboardDTO } from "../shared/api/types";

const MOCK: LeaderboardDTO = {
  streakDays: 8,
  quartiers: [
    { id: "seen", name: "Seen", co2SavedKg: 520, rank: 1 },
    { id: "hegi", name: "Hegi", co2SavedKg: 480, rank: 2 },
    { id: "toss", name: "Töss", co2SavedKg: 470, rank: 3 },
    { id: "oberi", name: "Oberwinterthur", co2SavedKg: 430, rank: 4 }
  ],
  friends: [
    { id: "p1", name: "Paul", co2SavedKg: 95, streakDays: 6 },
    { id: "p2", name: "Alex", co2SavedKg: 80, streakDays: 4 },
    { id: "p3", name: "Sarah", co2SavedKg: 70, streakDays: 7 },
    { id: "p4", name: "Lisa", co2SavedKg: 62, streakDays: 3 }
  ]
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [poking, setPoking] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await Api.leaderboard();
        setData(res);
      } catch (e) {
        // Hackathon fallback
        setData(MOCK);
        setError((e as Error).message);
      }
    })();
  }, []);

  const quartiersSorted = useMemo(
    () => (data ? [...data.quartiers].sort((a, b) => a.rank - b.rank) : []),
    [data]
  );

  async function poke(friendId: string) {
    try {
      setPoking(friendId);
      await Api.pokeFriend(friendId);
    } catch {
      // ignore in mock mode
    } finally {
      setPoking(null);
    }
  }

  return (
    <div className="page leaderboardPage">
      <h1>Leaderboard</h1>
      {error && <p className="hint">Hinweis: Backend nicht erreichbar → Demo-Daten werden verwendet.</p>}

      <Card>
        <div className="row between">
          <div>
            <div className="label">Streak</div>
            <div className="streakValue">{data?.streakDays ?? 0} Tage 🔥</div>
          </div>
          <div className="streakHint">Halte deine Serie am Leben</div>
        </div>
        <div className="streakBar" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={i < (data?.streakDays ?? 0) ? "dot on" : "dot"} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="sectionTitle">Quartiere (Map)</div>
        <div className="quartierMap">
          {/* Simple stylized SVG map placeholder for hackathon */}
          <svg viewBox="0 0 320 180" role="img" aria-label="Quartiere Karte">
            <rect x="8" y="8" width="304" height="164" rx="14" />
            {/* pins */}
            {quartiersSorted.map((q, idx) => {
              const points = [
                { x: 70, y: 70 },
                { x: 230, y: 75 },
                { x: 90, y: 120 },
                { x: 240, y: 125 }
              ];
              const p = points[idx] ?? { x: 160, y: 95 };
              return (
                <g key={q.id}>
                  <circle cx={p.x} cy={p.y} r="10" />
                  <text x={p.x + 14} y={p.y + 5}>
                    {q.rank}. {q.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="quartierList">
            {quartiersSorted.map((q) => (
              <div key={q.id} className="quartierRow">
                <div className="quartierRank">{q.rank}</div>
                <div className="quartierName">{q.name}</div>
                <div className="quartierMetric">{q.co2SavedKg} kg CO₂</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="row between">
          <div className="sectionTitle">Friends-Quest</div>
          <PrimaryButton onClick={() => { /* later: create quest */ }}>Neue Challenge</PrimaryButton>
        </div>

        <div className="friendsRow">
          {(data?.friends ?? []).slice(0, 4).map((f) => (
            <button
              key={f.id}
              className="friendChip"
              onClick={() => poke(f.id)}
              disabled={poking === f.id}
              title="Anstupsen"
            >
              <span className="avatar">{f.name.slice(0, 1)}</span>
              <span className="name">{f.name}</span>
              <span className="mini">🔥 {f.streakDays}</span>
              <span className="mini">{f.co2SavedKg}kg</span>
              <span className="poke">{poking === f.id ? "…" : "Anstupsen"}</span>
            </button>
          ))}
        </div>

        <div className="friendsTable">
          {(data?.friends ?? []).map((f, i) => (
            <div key={f.id} className="friendsTableRow">
              <div className="pos">{i + 1}</div>
              <div className="who">{f.name}</div>
              <div className="stat">🔥 {f.streakDays}</div>
              <div className="stat">{f.co2SavedKg} kg CO₂</div>
              <PrimaryButton small onClick={() => poke(f.id)} disabled={poking === f.id}>
                Anstupsen
              </PrimaryButton>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
