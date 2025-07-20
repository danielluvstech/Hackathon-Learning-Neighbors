import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './Register.jsx';
import Login from './Login.jsx';

function App() {
  return (
    <div>
      <nav>
        <Link to="/register">Register</Link> | <Link to="/login">Login</Link> | <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
