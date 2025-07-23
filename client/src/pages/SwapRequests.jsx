import { useEffect, useState } from 'react';
import axios from 'axios';

function SwapRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3001/api/swap-requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setRequests(res.data.requests))
    .catch(err => console.error('Error fetching requests:', err));
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3001/api/swap-requests/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(prev =>
        prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update request status.');
    }
  };

  return (
    <div>
      <h2>Swap Requests</h2>
      {requests.length === 0 ? (
        <p>No swap requests.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req.id}>
              Skill ID: {req.skill_id} | From User: {req.from_user_id} → To User: {req.to_user_id}
              <br />
              Message: {req.message}
              <br />
              Status: {req.status || 'pending'}
              {req.to_user_id === JSON.parse(localStorage.getItem("user"))?.id && req.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusUpdate(req.id, 'accepted')}>Accept</button>
                  <button onClick={() => handleStatusUpdate(req.id, 'rejected')}>Reject</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SwapRequests;
