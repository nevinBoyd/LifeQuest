import { useEffect, useState } from "react";
import { apiFetch } from "./api";

export default function AuthForm({ mode: initialMode = "login", onAuth }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const endpoint = mode === "login" ? "/login" : "/signup";

    try {
      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      onAuth(data);
    } catch (err) {
      setError("Authentication failed");
    }
  }

  return (
    <div className="auth-form">
      <h2 className="auth-title">{mode === "login" ? "Login" : "Sign Up"}</h2>

      <form onSubmit={handleSubmit} className="auth-fields">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        <button type="submit" className="auth-primary">
          {mode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>

      <button
        type="button"
        className="auth-switch"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        Switch to {mode === "login" ? "Sign Up" : "Login"}
      </button>

      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
