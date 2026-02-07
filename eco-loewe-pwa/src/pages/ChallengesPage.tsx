import Card from "../shared/components/Card";

export default function ChallengesPage() {
  return (
    <div className="page challengesPage">
      <h1>Challenges</h1>
      <Card>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
          <p>Kommende Challenges werden hier angezeigt!</p>
        </div>
      </Card>
    </div>
  );
}
