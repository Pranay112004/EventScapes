import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import ProfilePage from "./pages/ProfilePage"; // 1. Import new page
import PrivateRoute from "./components/PrivateRoute"; // 2. Import PrivateRoute
import "./App.css";

function App() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <Router>
      <div className="app">
        <header>
          <nav>
            <Link to="/" className="logo">
              EventScapes
            </Link>
            <div className="nav-links">
              {token ? (
                <>
                  <Link to="/profile">My Profile</Link>{" "}
                  {/* 3. Add Profile link */}
                  <Link to="/create-event">Create Event</Link>
                  <button onClick={handleLogout} className="button-primary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register">Register</Link>
                  <Link to="/login" className="button-primary">
                    Login
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />

            {/* Private Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <PrivateRoute>
                  <CreateEventPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/event/:id/edit"
              element={
                <PrivateRoute>
                  <EditEventPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
