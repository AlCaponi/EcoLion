import Card from "../shared/components/Card";

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
    </div>
  );
}
