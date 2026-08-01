import React, { useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import { PriceProvider } from "./context/PriceContext";
import "./App.css";

const App = () => {
  // Set up auto-refresh every 1 hour (3,600,000 milliseconds)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // Only refresh if user is authenticated to avoid disrupting login flow
      const token = localStorage.getItem('token');
      if (token) {
        // Update activity before refresh to maintain session
        localStorage.setItem('lastActivity', Date.now().toString());
        console.log('Auto-refreshing app after 1 hour');
        window.location.reload();
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <Router>
      <PriceProvider>
        <MainLayout />
      </PriceProvider>
    </Router>
  );
};

export default App;