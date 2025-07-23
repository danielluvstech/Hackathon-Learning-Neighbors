import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Register from './Register.jsx';
import Login from './Login.jsx';
import Profile from './Profile';
import SwapRequests from './pages/SwapRequests';
import SubmitReview from './pages/SubmitReview';

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/register">Register</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/profile">Profile</Link> |{' '}
        <Link to="/swap-requests">Swap Requests</Link> |{' '}
        <Link to="/submit-review">Submit Review</Link> |{' '}
        <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
          Logout
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/swap-requests" element={<SwapRequests />} />
        <Route path="/submit-review" element={<SubmitReview />} />
      </Routes>
    </div>
  );
}

export default App;
