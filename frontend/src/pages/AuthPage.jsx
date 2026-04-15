import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { login, signup } from "../api/filesApi";

function AuthPage({ onAuthSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const runAuthAction = async (action, payload, successMessage) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await action(payload);
      setMessage(successMessage);
      // Keep stored session email clean even if user pasted endpoint-like text.
      const cleanEmail = payload.email.includes("email=")
        ? decodeURIComponent(payload.email.split("email=")[1].split("&")[0]).trim()
        : payload.email.trim();
      onAuthSuccess(cleanEmail);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (payload) => {
    await runAuthAction(login, payload, "Login successful");
  };

  const handleSignup = async (payload) => {
    await runAuthAction(signup, payload, "Signup successful");
  };

  return (
    <main className="auth-layout">
      <div className="bg-blob blob-auth-left" />
      <div className="bg-blob blob-auth-right" />
      <AuthForm onLogin={handleLogin} onSignup={handleSignup} loading={loading} />
      {message ? <p className="toast success">{message}</p> : null}
      {error ? <p className="toast error">{error}</p> : null}
    </main>
  );
}

export default AuthPage;
