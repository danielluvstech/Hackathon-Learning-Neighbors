import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Register from './Register.jsx';
import Login from './Login.jsx';
import Profile from './Profile.jsx';
import SwapRequests from './pages/SwapRequests';

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <nav>
        <div className="nav-left">
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="nav-title">Neighbor Skill Swap</div>

        <div className="nav-right">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/swap-requests" element={<SwapRequests />} />
      </Routes>
    </div>
  );
}

export default App;
