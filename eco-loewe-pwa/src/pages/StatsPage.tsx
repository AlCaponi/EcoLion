// import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"; // TODO: install react-leaflet when backend ready
// import "leaflet/dist/leaflet.css";
// import kreiseData from "../assets/winterthur_kreise.json"; // TODO: use when Leaflet is ready
import Card from "../shared/components/Card";


// const KREIS_NAMES: Record<number, string> = {
//   1: "Stadt",
//   2: "Oberwinterthur",
//   3: "Seen",
//   4: "Töss",
//   5: "Veltheim",
//   6: "Wülflingen",
//   7: "Mattenbach",
// };

// const KREIS_CO2: Record<number, number> = {
//   1: 1250,
//   2: 890,
//   3: 1100,
//   4: 3200, // Active user
//   5: 650,
//   6: 920,
//   7: 1540,
// };

export default function StatsPage() {
  // TODO: Map integration with Leaflet when backend ready
  // const center: [number, number] = [47.5, 8.72];
  // const getColor = (co2: number) => { ... }
  // const geoJsonStyle = (feature: any) => { ... }
  // const onEachFeature = (feature: any, layer: any) => { ... }

  return (
    <div className="page statsPage">
      {/* ── Header ── */}
      <header className="stHeader">
        <h1>📊 Deine Statistik</h1>
        <p className="stSubtitle">Dein Impact in Winterthur</p>
      </header>

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
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => (
            <div key={day} className="weekDay">
              <div
                className="weekBar"
                style={{ height: `${[40, 65, 30, 80, 50, 90, 20][i]}%` }}
              />
              <span className="weekLabel">{day}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="sectionTitle">Dein Quartier</div>
        <div
          className="quartierMapContainer"
          style={{
            height: "300px",
            borderRadius: "12px",
            overflow: "hidden",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          🗺️ Karte wird bald geladen...
        </div>
        <div className="quartierHighlight" style={{ marginTop: "1rem" }}>
          Du bist im Quartier <strong>Töss</strong> aktiv!
        </div>
      </Card>

      {/* Add padding to bottom to account for nav */}
      <div style={{ height: "80px" }} />
    </div>
  );
}
