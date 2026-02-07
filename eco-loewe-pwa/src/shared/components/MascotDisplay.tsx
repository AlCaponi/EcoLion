import type { CSSProperties } from "react";
// Import the default lion image
import idleParams from "../../assets/mascot/idle.png";
import bikingDisplay from "../../assets/mascot/biking.png";
import carDisplay from "../../assets/mascot/car.png";
import carPoolingDisplay from "../../assets/mascot/carPooling.png";
import homeOfficeDisplay from "../../assets/mascot/homeOffice.png";
import publicTransportDisplay from "../../assets/mascot/public_transport.png";
import walkingDisplay from "../../assets/mascot/walking.png";

type Mood = "happy" | "sad" | "determined" | "angry";
type Movement = "idle" | "walk" | "bike" | "transit" | "drive" | "wfh" | "pool";

interface MascotDisplayProps {
  movement?: Movement;
  level?: number;
  xp?: number;
  className?: string;
  style?: CSSProperties;
}

const MOVEMENT_IMAGES: Record<Movement, string> = {
  idle: idleParams,
  walk: walkingDisplay,
  bike: bikingDisplay,
  transit: publicTransportDisplay,
  drive: carDisplay,
  wfh: homeOfficeDisplay,
  pool: carPoolingDisplay,
};

export default function MascotDisplay({
  movement = "idle",
  level = 1,
  xp = 0,
  className = "",
  style,
}: MascotDisplayProps) {
  const imageSrc = MOVEMENT_IMAGES[movement] || idleParams;

  return (
    <div className={`mascot-container ${className}`} style={{ ...styles.container, ...style }}>
      <div className="mascot-visual" style={styles.visualWrapper}>
         {/* Base Layer */}
        <img 
          src={imageSrc} 
          alt={`Eco-Lion is ${movement}`} 
          style={styles.lionImage} 
        />
        
        {/* Simple speech bubble for "Duolingo" feel */}
        <div style={styles.speechBubble}>
          Let's go green today! 🌿
        </div>
      </div>

      <div className="mascot-stats" style={styles.statsContainer}>
        <div style={styles.statRow}>
            <span style={styles.statLabel}>Level {level}</span>
            <span style={styles.statValue}>{xp} XP</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
  },
  visualWrapper: {
    position: "relative",
    width: "280px", // adjust based on image natural size
    height: "280px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  lionImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  speechBubble: {
    position: "absolute",
    top: "-10px",
    right: "-20px",
    backgroundColor: "white",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#333",
    zIndex: 10,
    animation: "float 3s ease-in-out infinite",
  },
  statsContainer: {
    display: "flex",
    gap: "0.8rem",
    alignItems: "center",
  },
  statRow: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "0.4rem 0.8rem",
    borderRadius: "12px",
    backdropFilter: "blur(4px)",
    display: "flex",
    gap: "0.5rem",
    color: "#fff", // Assuming dark background or card
    fontWeight: "500",
  },
};
