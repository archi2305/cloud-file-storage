import { useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
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

  return !isLoggedIn ? (
    <AuthPage onAuthSuccess={handleAuthSuccess} />
  ) : (
    <DashboardPage email={currentEmail} onLogout={handleLogout} />
  );
}

export default App;
