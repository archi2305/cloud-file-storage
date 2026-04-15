import { useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  console.log("[DEBUG] App.jsx is rendering from frontend/src/App.jsx");
  const [currentEmail, setCurrentEmail] = useState(
    localStorage.getItem("currentEmail") || ""
  );

  const isLoggedIn = useMemo(() => Boolean(currentEmail), [currentEmail]);

  const handleAuthSuccess = (email) => {
    setCurrentEmail(email);
    localStorage.setItem("currentEmail", email);
  };

  const handleLogout = () => {
    setCurrentEmail("");
    localStorage.removeItem("currentEmail");
  };

  return (
    <>
      <h1 style={{ color: "red", textAlign: "center", margin: "12px 0" }}>
        UI UPDATED
      </h1>
      {!isLoggedIn ? (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      ) : (
        <DashboardPage email={currentEmail} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
