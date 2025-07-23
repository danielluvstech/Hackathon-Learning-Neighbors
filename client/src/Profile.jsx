import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [skillData, setSkillData] = useState({
    skill_name: '',
    type: 'offered',
    description: ''
  });
  const [otherSkills, setOtherSkills] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate('/login');

    // Fetch own profile
    axios.get('http://localhost:3001/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => setProfile(response.data))
    .catch((error) => {
      console.error('Error fetching profile:', error);
      navigate('/login');
    });

    // Fetch other users’ skills
    axios.get('http://localhost:3001/api/other-skills', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => setOtherSkills(response.data.otherSkills))
    .catch((error) => {
      console.error('Error fetching other users’ skills:', error);
    });

    // Fetch received reviews
    axios.get('http://localhost:3001/api/reviews/received', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => setReceivedReviews(res.data.reviews))
    .catch((err) => console.error('Error fetching reviews:', err));
  }, [navigate, token]);

  const handleSkillChange = (e) => {
    setSkillData({ ...skillData, [e.target.name]: e.target.value });
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
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

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Username: {profile.user.username}</p>
      <p>Email: {profile.user.email}</p>
      <p>Karma Points: {profile.user.karma_points || 0}</p>

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

      <h3>Received Reviews</h3>
      {receivedReviews.length === 0 ? (
        <p>No reviews received yet.</p>
      ) : (
        <ul>
          {receivedReviews.map((review) => (
            <li key={review.id}>
              From: <strong>{review.reviewer_username}</strong> — Rating: {review.rating}/5
              <br />
              <em>{review.comment}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Profile;
