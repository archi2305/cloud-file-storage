import { useState } from "react";

function AuthForm({ onLogin, onSignup, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitLogin = (event) => {
    event.preventDefault();
    onLogin({ email, password });
  };

  const submitSignup = () => {
    onSignup({ email, password });
  };

  return (
    <form className="auth-card fade-in" onSubmit={submitLogin}>
      <div className="auth-logo" aria-hidden="true">☁</div>
      <h1>Cloud Storage</h1>
      <p className="subtitle">Securely manage files in AWS S3.</p>

      <label className="auth-label" htmlFor="email">
        Email
      </label>
      <input
        className="auth-input"
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />

      <label className="auth-label" htmlFor="password">
        Password
      </label>
      <input
        className="auth-input"
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter password"
        required
      />

      <div className="auth-buttons">
        <button className="btn-gradient" type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
        <button
          className="btn-outline"
          type="button"
          onClick={submitSignup}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Signup"}
        </button>
      </div>
    </form>
  );
}

export default AuthForm;
