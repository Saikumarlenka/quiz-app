import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./context/UserContext"; 

function App() {
  return (
    <AuthProvider> 
      <HomePage />
    </AuthProvider>
  );
}

export default App;
