import { useState, useEffect } from 'react';
import axios from 'axios';

function SwapRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/swap-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('❌ Error fetching swap requests:', err);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:3001/api/swap-requests/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert(`Request ${status}`);
      fetchRequests(); // refresh requests
    } catch (err) {
      console.error('❌ Error updating swap request:', err);
      alert('Failed to update request.');
    }
  };

  return (
    <div>
      <h2>Swap Requests</h2>
      {requests.length === 0 ? (
        <p>No swap requests yet.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req.id}>
              <strong>{req.skill_name}</strong> — from <strong>{req.from_username}</strong> to <strong>{req.to_username}</strong>
              <p><em>{req.message}</em></p>
              <p>Status: {req.status}</p>

              {/* ✅ If request is TO the logged-in user → show Accept/Reject */}
              {req.to_user_id === user.id && req.status === 'pending' && (
                <div>
                  <button onClick={() => handleAction(req.id, 'accepted')}>✅ Accept</button>
                  <button onClick={() => handleAction(req.id, 'rejected')}>❌ Reject</button>
                </div>
              )}

              {/* ✅ If request is FROM the logged-in user → show waiting message */}
              {req.from_user_id === user.id && req.status === 'pending' && (
                <p>⏳ Waiting for response...</p>
              )}

              {/* ✅ If request is completed → show final status */}
              {req.status !== 'pending' && (
                <p><strong>✔ This request has been {req.status}</strong></p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SwapRequests;
