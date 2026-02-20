import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export default function AuthForm({ mode = "login", onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localMode, setLocalMode] = useState(mode);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalMode(mode);
    setError(null);
  }, [mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const endpoint = localMode === "login" ? "/login" : "/signup";

    const res = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setError("Authentication failed");
      return;
    }

    const data = await res.json();
    onAuth(data);
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">
        {localMode === "login" ? "Login" : "Sign Up"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="h-11 rounded-lg px-3 bg-black/20 border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <input
          className="h-11 rounded-lg px-3 bg-black/20 border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={localMode === "login" ? "current-password" : "new-password"}
        />

        <button
          type="submit"
          className="h-11 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-fg))] font-semibold"
        >
          {localMode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>

      <button
        type="button"
        className="mt-3 text-sm text-[hsl(var(--muted-fg))] hover:opacity-90"
        onClick={() => setLocalMode(localMode === "login" ? "signup" : "login")}
      >
        Switch to {localMode === "login" ? "Sign Up" : "Login"}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
