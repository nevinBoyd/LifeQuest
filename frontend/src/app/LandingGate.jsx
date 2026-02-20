import { useState } from "react";
import AuthForm from "../AuthForm";
import sigil from "../assets/sigils/LQSigil.png";

/* Entry gate for unauthenticated users */
export default function LandingGate({ onAuth }) {
  const [mode, setMode] = useState(null);

  function closeAuth() {
    setMode(null);
  }

  return (
    <div className="stage">
      {/* Idle landing (NO card visible) */}
      {!mode && (
        <div className="landing-gate">
          <div className="landing-sigil">
            <img src={sigil} alt="LifeQuest Sigil" />
          </div>

          <div className="landing-actions">
            <button onClick={() => setMode("signup")}>SIGN UP</button>
            <button onClick={() => setMode("login")}>LOGIN</button>
          </div>
        </div>
      )}

      {/* Auth modal (card appears ONLY after click) */}
      {mode && (
        <div className="auth-overlay" onClick={closeAuth}>
          {/* Sigil behind the card */}
          <img
            className="auth-sigil-bg"
            src={sigil}
            alt="LifeQuest Sigil Background"
            aria-hidden="true"
          />

          {/* Square card on top */}
          <div className="auth-card" onClick={(e) => e.stopPropagation()}>
            <AuthForm mode={mode} onAuth={onAuth} />
          </div>
        </div>
      )}
    </div>
  );
}
