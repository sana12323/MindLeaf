import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import mindLeafLogo from './mind-leaf-logo.png';
import './App.css';
import FeatureGrid from './FeatureGrid';
import DailyJournal from './DailyJournal';
import ToDoList from './ToDoList';
import GratitudeJournal from './GratitudeJournal';
import Affirmations from './Affirmations';
import MoodTracker from './MoodTracker';
import Login from './Login';
import Signup from './Signup';
import { useAuth } from './AuthContext';

function Home() {
  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      alert('Logout failed.');
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <button className="logout-btn" onClick={handleLogout} style={{position:'absolute',top:24,right:36,padding:'10px 22px',borderRadius:12,background:'linear-gradient(90deg,#f9b1e3,#fa77b6)',color:'#fff',fontWeight:600,border:'none',boxShadow:'0 2px 8px #e3e0ff33',fontSize:'1.1rem',cursor:'pointer'}}>Logout</button>
        {/* Removed duplicate logo and title */}
        <p style={{ maxWidth: 500, margin: '16px auto', fontSize: '1.2em' }}>
          Welcome to <b>MindLeaf</b> — your companion for mental wellness. Track your mood, journal your thoughts, and explore resources for a healthier mind.
        </p>
        <FeatureGrid />
      </header>
    </div>
  );
}

function MindLeafLogoBar() {
  return (
    <div className="mindleaf-logo-bar">
      <img src={mindLeafLogo} alt="MindLeaf Logo" />
      <span className="mindleaf-logo-bar-title">MindLeaf</span>
    </div>
  );
}

const Placeholder = ({ title }) => (
  <div className="App">
    <header className="App-header">
      <h2>{title}</h2>
      <p>This page is under construction.</p>
    </header>
  </div>
);

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MindLeafLogoBar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/journal" element={<DailyJournal />} />
                <Route path="/todo" element={<ToDoList />} />
                <Route path="/gratitude" element={<GratitudeJournal />} />
                <Route path="/affirmations" element={<Affirmations />} />
                <Route path="/mood" element={<MoodTracker />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
