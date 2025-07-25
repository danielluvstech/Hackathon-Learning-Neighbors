import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [skillData, setSkillData] = useState({ skill_name: '', type: 'offered', description: '' });
  const [otherSkills, setOtherSkills] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const fetchData = async () => {
      try {
        // ✅ Fetch logged-in user profile
        const profileRes = await axios.get('http://localhost:3001/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        // ✅ Fetch other users’ skills
        const skillsRes = await axios.get('http://localhost:3001/api/other-skills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOtherSkills(skillsRes.data.otherSkills);

        // ✅ Fetch swap requests (for this user)
        const requestsRes = await axios.get('http://localhost:3001/api/swap-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userId = profileRes.data.user.id;

        // ✅ Filter requests
        const accepted = requestsRes.data.requests.filter(r => r.status === 'accepted');
        const incoming = requestsRes.data.requests.filter(r => r.to_user_id === userId && r.status === 'pending');
        const sent = requestsRes.data.requests.filter(r => r.from_user_id === userId && r.status === 'pending');

        setConnections(accepted);
        setIncomingRequests(incoming);
        setSentRequests(sent);

      } catch (error) {
        console.error('❌ Error fetching data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSkillChange = (e) => {
    setSkillData({ ...skillData, [e.target.name]: e.target.value });
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:3001/api/skills', skillData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Skill added!');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add skill');
    }
  };

  const handleSwapRequestSubmit = async (e, skill) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const message = e.target.elements[`message-${skill.id}`].value;

    try {
      await axios.post('http://localhost:3001/api/swap-requests', {
        to_user_id: skill.user_id,
        skill_id: skill.id,
        message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Swap request sent!');
      e.target.reset();
    } catch (err) {
      console.error('Error sending swap request:', err);
      alert('Failed to send swap request.');
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await axios.patch(`http://localhost:3001/api/swap-requests/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert(`Request ${status}`);

      // ✅ Update state instantly
      setIncomingRequests(prev => prev.filter(req => req.id !== id));
      if (status === 'accepted') {
        const acceptedReq = incomingRequests.find(req => req.id === id);
        setConnections(prev => [...prev, { ...acceptedReq, status: 'accepted' }]);
      }
    } catch (err) {
      console.error('Error updating request:', err);
      alert('Failed to update request.');
    }
  };

  if (loading) return <div className="spinner">Loading...</div>;
  if (!profile) return <div>Error loading profile.</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p><strong>Username:</strong> {profile.user.username}</p>
      <p><strong>Email:</strong> {profile.user.email}</p>
      <p><strong>Karma Points:</strong> {profile.user.karma_points || 0}</p>

      {/* ✅ Connections Section */}
      <h3>Connected Users</h3>
      <ul>
        {connections.length === 0 ? (
          <p>No connections yet.</p>
        ) : (
          connections.map(conn => (
            <li key={conn.id}>
              ✅ Connected with {conn.from_username === profile.user.username ? conn.to_username : conn.from_username} for skill <strong>{conn.skill_name}</strong>
            </li>
          ))
        )}
      </ul>

      {/* ✅ Pending Requests Section */}
      <h3>Incoming Swap Requests</h3>
      <ul>
        {incomingRequests.length === 0 ? (
          <p>No incoming requests.</p>
        ) : (
          incomingRequests.map(req => (
            <li key={req.id}>
              📩 <strong>{req.from_username}</strong> wants to swap for <strong>{req.skill_name}</strong>  
              <div>
                <button onClick={() => handleRespond(req.id, 'accepted')}>✅ Accept</button>
                <button onClick={() => handleRespond(req.id, 'rejected')}>❌ Reject</button>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* ✅ Sent Requests Section */}
      <h3>Sent Swap Requests</h3>
      <ul>
        {sentRequests.length === 0 ? (
          <p>You haven’t sent any requests.</p>
        ) : (
          sentRequests.map(req => (
            <li key={req.id}>
              📤 Sent to {req.to_username} for <strong>{req.skill_name}</strong> — Status: {req.status}
            </li>
          ))
        )}
      </ul>

      {/* ✅ Skills Section */}
      <h3>Your Skills</h3>
      <ul>
        {profile.skills.map((skill) => (
          <li key={skill.id}>
            {skill.skill_name} ({skill.type}) - {skill.description}
          </li>
        ))}
      </ul>

      <h3>Add Skill</h3>
      <form onSubmit={handleSkillSubmit}>
        <input
          name="skill_name"
          placeholder="Skill Name"
          onChange={handleSkillChange}
          required
        />
        <select name="type" onChange={handleSkillChange}>
          <option value="offered">Offered</option>
          <option value="requested">Requested</option>
        </select>
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleSkillChange}
        />
        <button type="submit">Add Skill</button>
      </form>

      {/* ✅ Other Users’ Skills Section */}
      <h3>Other Users' Skills</h3>
      <ul>
        {otherSkills.map((skill) => (
          <li key={skill.id}>
            {skill.skill_name} ({skill.type}) - {skill.description} — by <strong>{skill.username}</strong>
            <form onSubmit={(e) => handleSwapRequestSubmit(e, skill)}>
              <input
                type="text"
                name={`message-${skill.id}`}
                placeholder="Message"
                required
              />
              <button type="submit">Request Swap</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Profile;