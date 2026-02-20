import { useState } from "react";
import AuthForm from "../AuthForm";
import sigil from "../assets/sigils/LQSigil.png";

export default function LandingGate({ onAuth }) {
  const [mode, setMode] = useState(null);

  function closeAuth() {
    setMode(null);
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      {/* Sigil background (always centered) */}
      <img
        src={sigil}
        alt="LifeQuest Sigil"
        className="pointer-events-none select-none opacity-25 w-40 sm:w-56 md:w-64"
      />

      {/* Idle actions (no card visible) */}
      {!mode && (
        <div className="absolute bottom-24 sm:bottom-28 flex flex-col gap-3 w-[min(360px,92vw)]">
          <button
            className="h-11 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-fg))] font-semibold tracking-wide hover:opacity-95 active:opacity-90"
            onClick={() => setMode("signup")}
          >
            SIGN UP
          </button>

          <button
            className="h-11 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--fg))] font-semibold tracking-wide hover:opacity-95 active:opacity-90"
            onClick={() => setMode("login")}
          >
            LOGIN
          </button>
        </div>
      )}

      {/* Auth modal */}
      {mode && (
        <div
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
          onClick={closeAuth}
        >
          {/* Sigil behind the card */}
          <img
            src={sigil}
            alt=""
            aria-hidden="true"
            className="absolute pointer-events-none select-none opacity-20 w-56 sm:w-72 md:w-80"
          />

          <div
            className="relative w-[min(420px,92vw)] aspect-square rounded-xl bg-[hsl(var(--card))]/90 text-[hsl(var(--card-fg))] border border-[hsl(var(--border))] shadow-xl p-6 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AuthForm mode={mode} onAuth={onAuth} />
          </div>
        </div>
      )}
    </div>
  );
}
