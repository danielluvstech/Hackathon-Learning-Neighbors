import { useEffect, useState } from 'react';
import axios from 'axios';

function SubmitReview() {
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token) return;

    // Get accepted swaps
    axios
      .get('http://localhost:3001/api/swap-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const completed = res.data.requests.filter(r => r.status === 'accepted');
        setCompletedSwaps(completed);
      })
      .catch(console.error);

    // Get reviews submitted by this user
    axios
      .get(`http://localhost:3001/api/reviews/from-user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setSubmittedReviews(res.data.reviews.map(r => r.swap_request_id));
      })
      .catch(console.error);
  }, [token, user?.id]);

  const handleChange = (swapId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [swapId]: { ...prev[swapId], [field]: value }
    }));
  };

  const handleSubmit = async (e, swap) => {
    e.preventDefault();
    const data = formData[swap.id];
    if (!data || !data.rating) return alert('Rating is required');

    try {
      await axios.post(
        'http://localhost:3001/api/reviews',
        {
          to_user_id: swap.from_user_id === user.id ? swap.to_user_id : swap.from_user_id,
          swap_request_id: swap.id,
          rating: Number(data.rating),
          comment: data.comment || ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Review submitted!');
      setSubmittedReviews(prev => [...prev, swap.id]);
    } catch (err) {
      alert('Error submitting review');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Submit a Review</h2>
      {completedSwaps.length === 0 && <p>No completed swaps available for review.</p>}

      {completedSwaps.map(swap => {
        const alreadyReviewed = submittedReviews.includes(swap.id);
        return (
          <div key={swap.id} style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem' }}>
            <p>
              Swap with: {swap.from_user_id === user.id ? swap.to_username : swap.from_username} <br />
              Skill: {swap.skill_name}
            </p>

            {alreadyReviewed ? (
              <p style={{ color: 'green' }}>Review already submitted ✅</p>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, swap)}>
                <label>
                  Rating (1–5):{' '}
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    onChange={(e) => handleChange(swap.id, 'rating', e.target.value)}
                  />
                </label>
                <br />
                <label>
                  Comment:{' '}
                  <textarea
                    onChange={(e) => handleChange(swap.id, 'comment', e.target.value)}
                  />
                </label>
                <br />
                <button type="submit">Submit Review</button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SubmitReview;