import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './Register.jsx';
import Login from './Login.jsx';
import Profile from './Profile.jsx';

function App() {
  return (
    <div>
      <nav>
        <Link to="/register">Register</Link> | <Link to="/login">Login</Link> | <Link to="/profile">Profile</Link> | <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
