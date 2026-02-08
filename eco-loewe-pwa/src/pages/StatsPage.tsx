import { useEffect, useState } from "react";
import Card from "../shared/components/Card";
import { Api } from "../shared/api/endpoints";
import type { ActivityListItemDTO, ActivityType } from "../shared/api/types";


const ACTIVITY_LABELS: Record<ActivityType, { label: string; emoji: string }> = {
  walk: { label: "Zu Fuß", emoji: "🚶" },
  bike: { label: "Velo", emoji: "🚲" },
  transit: { label: "ÖV", emoji: "🚌" },
  drive: { label: "Auto", emoji: "🚗" },
  wfh: { label: "Home Office", emoji: "🏠" },
  pool: { label: "Pooling", emoji: "🤝" },
};

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 min";
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return hrs > 0 ? `${hrs} h ${remMins} min` : `${mins} min`;
}

export default function StatsPage() {
  const [activities, setActivities] = useState<ActivityListItemDTO[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await Api.activities();
        if (isMounted) {
          setActivities(data ?? []);
        }
      } catch (error) {
        console.error("Failed to load activities", error);
        if (isMounted) {
          setActivitiesError("Aktivitäten konnten nicht geladen werden.");
        }
      } finally {
        if (isMounted) {
          setActivitiesLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

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
        <div className="sectionTitle">Aktivitätsverlauf</div>
        {activitiesLoading ? (
          <div className="activityEmpty">Lade Aktivitäten…</div>
        ) : activitiesError ? (
          <div className="activityEmpty">{activitiesError}</div>
        ) : activities.length === 0 ? (
          <div className="activityEmpty">Noch keine Aktivitäten erfasst.</div>
        ) : (
          <div className="activityList">
            {activities.map((activity) => {
              const meta = ACTIVITY_LABELS[activity.activityType];
              const dateLabel = new Date(activity.startTime).toLocaleString("de-CH", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const durationLabel = formatDuration(activity.durationSeconds);
              const statusLabel = activity.state === "running" ? "Läuft" : "Beendet";
              return (
                <div
                  key={activity.activityId}
                  className={`activityRow${activity.state === "running" ? " activityRowRunning" : ""}`}
                >
                  <div className="activityIcon">{meta.emoji}</div>
                  <div className="activityInfo">
                    <div className="activityTitle">{meta.label}</div>
                    <div className="activityMeta">
                      {dateLabel} · {durationLabel} · {statusLabel}
                    </div>
                  </div>
                  <div className="activityMetric">
                    {activity.co2SavedKg.toFixed(2)} kg
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add padding to bottom to account for nav */}
      <div style={{ height: "80px" }} />
    </div>
  );
}
