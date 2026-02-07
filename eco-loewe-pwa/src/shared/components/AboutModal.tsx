import React from "react";

export default function AboutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <h3>Über uns</h3>
          <button aria-label="Schließen" className="modalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modalBody">
          <p>
            Diese Anwendung ist das Ergebnis einer Kooperation zwischen
            unterschiedlichen Abteilungen. Ziel ist es, nachhaltige Mobilität
            spielerisch zu fördern und Bürgerinnen und Bürgern in Winterthur
            einfache Werkzeuge zum Tracking und zur Belohnung von Fuß- und
            ÖV-Nutzung bereitzustellen.
          </p>

          <p>
            Bei Fragen oder Interesse an einer Zusammenarbeit erreichen Sie uns
            über die üblichen Kanäle.
          </p>
        </div>
      </div>
    </div>
  );
}
