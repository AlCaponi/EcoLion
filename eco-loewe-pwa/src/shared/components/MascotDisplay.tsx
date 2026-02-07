import type { CSSProperties } from "react";

// Import base movements
import idleParams from "../../assets/mascot/idle.png";
import bikingDisplay from "../../assets/mascot/biking.png";
import carDisplay from "../../assets/mascot/car.png";
import carPoolingDisplay from "../../assets/mascot/carPooling.png";
import homeOfficeDisplay from "../../assets/mascot/homeOffice.png";
import publicTransportDisplay from "../../assets/mascot/public_transport.png";
import walkingDisplay from "../../assets/mascot/walking.png";

// Import accessories
import birthdayHat from "../../assets/articles/hats/birthday_hat/birthday_hat.png";
import detectiveHat from "../../assets/articles/hats/detective_hat/DetectiveHat.png";

type Movement = "idle" | "walk" | "bike" | "transit" | "drive" | "wfh" | "pool";

interface MascotDisplayProps {
  movement?: Movement;
  level?: number;
  xp?: number;
  accessories?: string[]; // IDs of equipped accessories
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

const ACCESSORY_IMAGES: Record<string, string> = {
  "hat-birthday": birthdayHat,
  "hat-detective": detectiveHat,
  // Add other mappings as needed
};

export default function MascotDisplay({
  movement = "idle",
  level = 1,
  xp = 0,
  accessories = [],
  className = "",
  style,
}: MascotDisplayProps) {
  const baseImageSrc = MOVEMENT_IMAGES[movement] || idleParams;

  return (
    <div className={`mascot-container ${className}`} style={{ ...styles.container, ...style }}>
      <div className="mascot-visual" style={styles.visualWrapper}>
        {/* Base Layer (Z-Index 1) */}
        <img src={baseImageSrc} alt={`Eco-Lion is ${movement}`} style={{ ...styles.layer, ...styles.baseLayer }} />

        {/* Accessory Layer (Z-Index 2+) */}
        {accessories.map((accId, index) => {
          const src = ACCESSORY_IMAGES[accId];
          if (!src) return null;
          return (
            <img
              key={accId}
              src={src}
              alt={`Accessory ${accId}`}
              style={{ ...styles.layer, zIndex: 10 + index }} // Stack in order
            />
          );
        })}

        {/* Optional Speech Bubble for Idle state */}
        {movement === "idle" && <div style={styles.speechBubble}>Let's go green today! 🌿</div>}
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
    width: "280px",
    height: "280px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  baseLayer: {
    zIndex: 1,
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
    zIndex: 100, // Always on top
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
    color: "#fff",
    fontWeight: "500",
  },
  statLabel: {},
  statValue: {},
};
