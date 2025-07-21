import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SkillForm from "./components/SkillForm";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  return (
    <div className="App">
      <h1>Hackathon: Learning Neighbors</h1>

      {user && token ? (
        <SkillForm userId={user.id} token={token} />
      ) : (
        <p>Please log in to access skill features.</p>
      )}
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [skillData, setSkillData] = useState({ skill_name: '', type: 'offered', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    axios.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => setProfile(response.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleSkillChange = (e) => {
    setSkillData({ ...skillData, [e.target.name]: e.target.value });
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/skills', skillData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Skill added!');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add skill');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Username: {profile.user.username}</p>
      <p>Email: {profile.user.email}</p>
      <h3>Skills</h3>
      <ul>
        {profile.skills.map(skill => (
          <li key={skill.id}>{skill.skill_name} ({skill.type}) - {skill.description}</li>
        ))}
      </ul>
      <h3>Add Skill</h3>
      <form onSubmit={handleSkillSubmit}>
        <input name="skill_name" placeholder="Skill Name" onChange={handleSkillChange} required />
        <select name="type" onChange={handleSkillChange}>
          <option value="offered">Offered</option>
          <option value="requested">Requested</option>
        </select>
        <textarea name="description" placeholder="Description" onChange={handleSkillChange} />
        <button type="submit">Add Skill</button>
      </form>
    </div>
  );
}

export default Profile;