import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./context/UserContext"; // Import AuthProvider

function App() {
  return (
    <AuthProvider> {/* ✅ Wrap the app with AuthProvider */}
      <HomePage />
    </AuthProvider>
  );
}

export default App;
