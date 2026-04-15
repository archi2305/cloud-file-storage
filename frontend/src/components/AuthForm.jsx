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
    <form className="card auth-card" onSubmit={submitLogin}>
      <div className="auth-logo" aria-hidden="true">
        ☁
      </div>
      <h1>Cloud File Storage</h1>
      <p className="subtitle">Login or create an account to continue.</p>

      <label className="field-label" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />

      <label className="field-label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter password"
        required
      />

      <div className="button-row">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
        <button
          className="btn btn-secondary"
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
