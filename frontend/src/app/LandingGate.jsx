import { useState } from "react";
import AuthForm from "../AuthForm";
import sigil from "../assets/sigils/LQSigil.png";

/* Entry gate for unauthenticated users */
export default function LandingGate({ onAuth }) {
  /* null = idle landing
     "login" | "signup" = auth card active */
  const [mode, setMode] = useState(null);

  function handleDismiss() {
    setMode(null);
  }

  return (
    <div className="stage">
      {/* Idle landing state */}
      {!mode && (
        <div className="planner-stage">
          <div className="card card-selected">
            {/* Sigil */}
            <div className="landing-sigil">
              <img src={sigil} alt="LifeQuest Sigil" />
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button
                style={{ width: "100%", marginBottom: "1rem" }}
                onClick={() => setMode("signup")}
              >
                SIGN UP
              </button>

              <button
                style={{ width: "100%" }}
                onClick={() => setMode("login")}
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth overlay */}
      {mode && (
        <div className="stage" onClick={handleDismiss}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="planner-stage">
              <div className="card card-selected">
                {/* Sigil remains visible during auth */}
                <div className="landing-sigil">
                  <img src={sigil} alt="LifeQuest Sigil" />
                </div>

                <AuthForm mode={mode} onAuth={onAuth} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
