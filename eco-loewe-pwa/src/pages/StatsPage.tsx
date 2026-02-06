import Card from "../shared/components/Card";

const MOCK_QUARTIERS = [
  { id: "seen", name: "Seen", co2SavedKg: 520, rank: 1, isMe: false },
  { id: "hegi", name: "Hegi", co2SavedKg: 480, rank: 2, isMe: false },
  { id: "toss", name: "Töss", co2SavedKg: 470, rank: 3, isMe: true },
  { id: "oberi", name: "Oberwinterthur", co2SavedKg: 430, rank: 4, isMe: false },
];

export default function StatsPage() {
  return (
    <div className="page statsPage">
      <h1>Statistiken</h1>

      <Card>
        <div className="sectionTitle">Monatsübersicht</div>
        <div className="statsGrid">
          <div className="statBlock">
            <div className="label">CO₂ gespart</div>
            <div className="statValue">12.4 kg</div>
          </div>
          <div className="statBlock">
            <div className="label">Zu Fuß</div>
            <div className="statValue">34 km</div>
          </div>
          <div className="statBlock">
            <div className="label">ÖV Fahrten</div>
            <div className="statValue">18</div>
          </div>
          <div className="statBlock">
            <div className="label">Auto</div>
            <div className="statValue">2 km</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="sectionTitle">Wochenverlauf</div>
        <div className="weekChart">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
            <div key={day} className="weekDay">
              <div className="weekBar" />
              <span className="weekLabel">{day}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="sectionTitle">Dein Quartier</div>
        <div className="quartierMap">
          <svg viewBox="0 0 320 180" role="img" aria-label="Quartiere Karte">
            <rect x="8" y="8" width="304" height="164" rx="14" />
            {MOCK_QUARTIERS.map((q, idx) => {
              const points = [
                { x: 70, y: 70 },
                { x: 230, y: 75 },
                { x: 90, y: 120 },
                { x: 240, y: 125 },
              ];
              const p = points[idx] ?? { x: 160, y: 95 };
              return (
                <g key={q.id}>
                  <circle cx={p.x} cy={p.y} r={q.isMe ? 13 : 10} className={q.isMe ? "pinMe" : ""} />
                  <text x={p.x + 16} y={p.y + 5}>
                    {q.rank}. {q.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="quartierList">
            {MOCK_QUARTIERS.map((q) => (
              <div key={q.id} className={`quartierRow${q.isMe ? " quartierRowMe" : ""}`}>
                <div className="quartierRank">{q.rank}</div>
                <div className="quartierName">{q.name}{q.isMe ? " ⭐" : ""}</div>
                <div className="quartierMetric">{q.co2SavedKg} kg CO₂</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
