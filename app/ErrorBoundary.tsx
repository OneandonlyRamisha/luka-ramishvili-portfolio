"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0A0A0A",
            color: "#F5F5F0",
            fontFamily: "var(--font-display)",
            gap: "1.5rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "clamp(1.2rem, 3vw, 2rem)",
              letterSpacing: "0.15em",
            }}
          >
            SOMETHING WENT WRONG
          </span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "none",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#D4AF37",
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              padding: "0.75rem 2rem",
              cursor: "pointer",
            }}
          >
            RELOAD PAGE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
