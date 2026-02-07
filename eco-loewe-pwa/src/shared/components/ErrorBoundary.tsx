import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> { // eslint-disable-line @typescript-eslint/no-explicit-any
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for now — could send to remote logging service
    // eslint-disable-next-line no-console
    console.error("Unhandled React error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Etwas ist schiefgelaufen.</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
