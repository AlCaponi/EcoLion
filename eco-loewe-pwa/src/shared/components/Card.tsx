import type { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return <section className="card">{children}</section>;
}
