import { useState } from "react";
import { apiFetch } from "./api";

export default function AuthForm({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const endpoint = mode === "login" ? "/login" : "/signup";

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
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />

        <button type="submit">
          {mode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>

      <button
        onClick={() =>
          setMode(mode === "login" ? "signup" : "login")
        }
        style={{ marginTop: "1rem" }}
      >
        Switch to {mode === "login" ? "Sign Up" : "Login"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
