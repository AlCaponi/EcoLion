import type { CSSProperties } from "react";
// Import the default lion image
import idleParams from "../../assets/mascot/idle.png";
import bikingDisplay from "../../assets/mascot/biking.png";
import carDisplay from "../../assets/mascot/car.png";
import carPoolingDisplay from "../../assets/mascot/carPooling.png";
import homeOfficeDisplay from "../../assets/mascot/homeOffice.png";
import publicTransportDisplay from "../../assets/mascot/public_transport.png";
import walkingDisplay from "../../assets/mascot/walking.png";

// Import accessories
// (Removed imports in favor of public paths)

type Movement = "idle" | "walk" | "bike" | "transit" | "drive" | "wfh" | "pool";

const MOTIVATIONAL_MESSAGES = [
  "Let's go green today! 🌿",
  "It's nice weather today, perfect for biking! 🚴",
  "Every step counts towards a better planet! 🌍",
  "Ready to make a difference? Let's move! 💚",
  "Your eco-journey starts now! 🦁✨",
];

interface MascotDisplayProps {
  movement?: Movement;
  level?: number;
  xp?: number;
  accessories?: string[]; // IDs of equipped accessories
  className?: string;
  style?: CSSProperties;
  compact?: boolean; // New prop for compact recording mode
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
  "hat-birthday": "/assets/articles/hats/birthday_hat/birthday_hat.png",
  "hat-detective": "/assets/articles/hats/detective_hat/DetectiveHat.png",
  "hat-cap": "/assets/articles/hats/cap/Cap.png",
  "hat-fedora": "/assets/articles/hats/fedora/fedora_hat.png",
  "outfit-scarf": "/assets/articles/scarfs/FC_Winterthur_scarf/scarf.png",
  // Add other mappings as needed
};

export default function MascotDisplay({
  movement = "idle",
  level = 1,
  xp = 0,
  accessories = [],
  className = "",
  style,
  compact = false,
}: MascotDisplayProps) {
  const baseImageSrc = MOVEMENT_IMAGES[movement] || idleParams;
  
  // Select motivational message based on level and xp for consistency
  const messageIndex = (level + xp) % MOTIVATIONAL_MESSAGES.length;
  const motivationalMessage = MOTIVATIONAL_MESSAGES[messageIndex] || "Let's go green today! 🌿";
  
  const visualWrapperStyle = compact
    ? { ...styles.visualWrapper, width: "180px", height: "180px" }
    : styles.visualWrapper;

  return (
    <div
      className={`mascot-container ${className}`}
      style={{ ...styles.container, ...(compact ? styles.compactContainer : {}), ...style }}
    >
      {/* Optional Speech Bubble for Idle state - ABOVE the lion */}
      {movement === "idle" && (
        <div style={styles.speechBubble}>
          {motivationalMessage}
        </div>
      )}

      <div className="mascot-visual" style={visualWrapperStyle}>
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
      </div>

      {!compact && (
        <div className="mascot-stats" style={styles.statsContainer}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Level {level}</span>
            <span style={styles.statValue}>{xp} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "4rem 1rem 0.5rem 1rem", // Extra top padding for speech bubble
    marginBottom: "0",
    overflow: "visible", // Allow speech bubble to overflow
  },
  compactContainer: {
    gap: "0.25rem",
    padding: "0.25rem 0.5rem",
  },
  visualWrapper: {
    position: "relative",
    width: "280px",
    height: "280px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible", // Allow speech bubble to overflow
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
    backgroundColor: "white",
    padding: "0.75rem 1.25rem",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#333",
    whiteSpace: "nowrap",
    border: "2px solid #e0e0e0",
    marginBottom: "0.5rem",
    textAlign: "center",
  } as CSSProperties,
  statsContainer: {
    display: "flex",
    gap: "0.8rem",
    alignItems: "center",
  },
  statRow: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: "0.4rem 0.8rem",
    borderRadius: "12px",
    backdropFilter: "blur(4px)",
    display: "flex",
    gap: "0.5rem",
    color: "#333",
    fontWeight: "500",
  },
  statLabel: {},
  statValue: {},
};
