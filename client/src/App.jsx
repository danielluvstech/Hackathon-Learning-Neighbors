import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Register from './Register.jsx';
import Login from './Login.jsx';
import Profile from './Profile.jsx';
import PrivateRoute from './components/PrivateRoute'; // if not already added, do it!

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <nav>
        <Link to="/register">Register</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/profile">Profile</Link> |{' '}
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
