import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Trade from "../pages/Trade";
import Wallet from "../pages/Wallet";
import Swap from '../pages/Swap';
import Navbar from "./Navbar";
import Auth from "../pages/Auth";
import Settings from "../pages/Settings";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/profile";
import About from "../pages/about";
import FAQ from "../pages/FAQ";
import CreateToken from "../pages/CreateToken";
import Merchant from "../pages/Merchant";
import Notifications from "../pages/Notifications";
import FirebaseService from "../services/firebaseService";
import useAutoLogout from "../hooks/useAutoLogout";
import TermsModal from './TermsModal';
import Condition from '../pages/condition';
import CashbackTerms from "../pages/CashbackTerms";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [fcmInitialized, setFcmInitialized] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const showNavbar = token && !hideNavbarRoutes.includes(location.pathname);

  // Perform logout operations - wrapped in useCallback to prevent unnecessary re-renders
  const performLogout = useCallback(async () => {
    try {
      // Cleanup Firebase before logout
      await cleanupFirebase();
      
      // Call backend logout if token exists
      if (token) {
        try {
          await fetch(`${process.env.REACT_APP_API_BASE_URL}/logout/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Error during backend logout:', error);
        }
      }
      
      // Clear all session data
      localStorage.removeItem('token');
      localStorage.removeItem('leftAppTime');
      localStorage.removeItem('user');
      localStorage.removeItem('fcm_token');
      
      setToken(null);
      
      // Navigate to login with session expired flag if auto-logged out
      if (sessionExpired) {
        navigate('/?expired=true', { replace: true });
        setSessionExpired(false);
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local data even if there's an error
      localStorage.clear();
      setToken(null);
      navigate('/', { replace: true });
    }
  }, [token, sessionExpired, navigate]);

  // Auto-logout handler
  const handleAutoLogout = useCallback(async () => {
    console.log('Auto-logout triggered - user was away too long');
    setSessionExpired(true);
    await performLogout();
  }, [performLogout]);

  // Initialize auto-logout hook (only when user has token)
  useAutoLogout(
    token ? handleAutoLogout : null
  );

  const cleanupFirebase = async () => {
    try {
      console.log('Cleaning up Firebase...');
      await FirebaseService.cleanup();
      setFcmInitialized(false);
      console.log('Firebase cleanup completed');
    } catch (error) {
      console.error('Error during Firebase cleanup:', error);
    }
  };

  // Monitor token changes (for login/logout)
  useEffect(() => {
    const checkToken = () => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };

    // Check token on storage changes (handles login/logout in other tabs)
    window.addEventListener('storage', checkToken);
    
    // Check token periodically (handles programmatic token changes)
    const tokenCheck = setInterval(checkToken, 1000);

    return () => {
      window.removeEventListener('storage', checkToken);
      clearInterval(tokenCheck);
    };
  }, [token]);

  // Check session validity on app load
  useEffect(() => {
    const checkSessionValidity = () => {
      if (token) {
        const leftAppTime = localStorage.getItem('leftAppTime');
        if (leftAppTime) {
          const now = Date.now();
          const awayDuration = now - parseInt(leftAppTime);
          const AWAY_TIMEOUT = 3600000; // 1 hour
          
          if (awayDuration > AWAY_TIMEOUT) {
            console.log('Session expired - user was away too long');
            setSessionExpired(true);
            performLogout();
            return;
          } else {
            // User returned within time limit, clear the away time
            localStorage.removeItem('leftAppTime');
          }
        }
      }
    };

    checkSessionValidity();
  }, [token, performLogout]);

  // Initialize Firebase when user is authenticated
  useEffect(() => {
    if (token && !fcmInitialized) {
      initializeFirebase();
    } else if (!token && fcmInitialized) {
      // User logged out, cleanup Firebase
      cleanupFirebase();
    }
  }, [token, fcmInitialized]);

  const initializeFirebase = async () => {
    try {
      console.log('Initializing Firebase...');
      const success = await FirebaseService.initializeFCM();
      if (success) {
        console.log('Firebase initialized successfully');
        setFcmInitialized(true);
      } else {
        console.log('Firebase initialization failed');
      }
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  };

  // Function to handle successful login (call this from Auth component)
  const handleLogin = async (loginData) => {
    try {
      localStorage.setItem('token', loginData.token);
      
      // Store user data
      if (loginData.username || loginData.email) {
        localStorage.setItem('user', JSON.stringify({
          username: loginData.username,
          email: loginData.email
        }));
      }
      
      // Clear any leftover away time from previous sessions
      localStorage.removeItem('leftAppTime');
      
      setToken(loginData.token);
      
      console.log('Login successful, session initialized');
      // Firebase will be initialized by the useEffect above
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Function to handle manual logout (call this from Navbar or wherever logout happens)
  const handleLogout = async () => {
    setSessionExpired(false); // This is a manual logout, not due to expiry
    await performLogout();
  };

  return (
    <div className="app-container">
      {showNavbar && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Auth onLogin={handleLogin} />} />
        <Route path="/login" element={<Auth onLogin={handleLogin} />} />
        <Route path="/signup" element={<Auth onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/trade" element={<PrivateRoute><Trade /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/swap" element={<PrivateRoute><Swap /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
        <Route path="/FAQ" element={<PrivateRoute><FAQ /></PrivateRoute>} />
        <Route path="/create-token" element={<PrivateRoute><CreateToken /></PrivateRoute>} />
        <Route path="/merchant" element={<PrivateRoute><Merchant /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/terms" element={<PrivateRoute><TermsModal /></PrivateRoute>} />
        <Route path="/condition" element={<PrivateRoute><Condition /></PrivateRoute>} />
        <Route path="/cashback-terms" element={<PrivateRoute><CashbackTerms /></PrivateRoute>} />
        
      </Routes>
    </div>
  );
};

export default MainLayout;