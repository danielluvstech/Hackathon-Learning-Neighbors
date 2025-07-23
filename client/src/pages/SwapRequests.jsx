import { useEffect, useState } from 'react';
import axios from 'axios';

function SwapRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/swap-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setRequests(res.data.requests))
      .catch((err) => console.error('Error loading requests', err));
  }, [token]);

  const handleDecision = async (id, decision) => {
    try {
      await axios.patch(
        `http://localhost:3001/api/swap-requests/${id}`,
        { status: decision },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert(`Request ${decision}`);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: decision } : req
        )
      );
    } catch (err) {
      alert('Error updating request');
      console.error(err);
    }
  };

  const sent = requests.filter((r) => r.from_user_id === user.id);
  const received = requests.filter((r) => r.to_user_id === user.id);

  return (
    <div>
      <h2>Swap Requests</h2>

      <h3>Requests You Sent</h3>
      <ul>
        {sent.map((r) => (
          <li key={r.id}>
            To <strong>{r.to_username}</strong> about <em>{r.skill_name}</em> — Status: <strong>{r.status}</strong>
            <br />
            <small>Message: {r.message}</small>
          </li>
        ))}
      </ul>

      <h3>Requests You Received</h3>
      <ul>
        {received.map((r) => (
          <li key={r.id}>
            From <strong>{r.from_username}</strong> about <em>{r.skill_name}</em> — Status: <strong>{r.status}</strong>
            <br />
            <small>Message: {r.message}</small>
            {r.status === 'pending' && (
              <div>
                <button onClick={() => handleDecision(r.id, 'accepted')}>Accept</button>
                <button onClick={() => handleDecision(r.id, 'rejected')}>Reject</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SwapRequests;
