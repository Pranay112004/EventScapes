import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Page Imports
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./components/PublicProfilePage";
import GroupDetailPage from "./pages/GroupDetailPage";

// Component Imports
import PrivateRoute from "./components/PrivateRoute";

// CSS Import
import "./index.css";

function App() {
  const token = localStorage.getItem("token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="app">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />

        <header>
          <nav>
            <Link to="/" className="logo" onClick={closeMobileMenu}>
              EventScapes
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            
            <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              {token ? (
                <>
                  <Link to="/profile" onClick={closeMobileMenu}>My Profile</Link>
                  <Link to="/create-event" onClick={closeMobileMenu}>Create Event</Link>
                  <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="button-primary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" onClick={closeMobileMenu}>Register</Link>
                  <Link to="/login" className="button-primary" onClick={closeMobileMenu}>
                    Login
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div 
                className="mobile-menu-overlay" 
                onClick={closeMobileMenu}
              ></div>
            )}
          </nav>
        </header>
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/users/:id" element={<PublicProfilePage />} />

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
