import { useEffect, useState } from "react";
import axios from "axios";

export default function SkillForm({ userId, token }) {
  const [skills, setSkills] = useState([]);
  const [skillId, setSkillId] = useState("");
  const [type, setType] = useState("offer");
  const [message, setMessage] = useState("");

  // Fetch skills from backend
  useEffect(() => {
    axios.get("http://localhost:3001/api/skills/all")
      .then((res) => setSkills(res.data))
      .catch((err) => console.error("Failed to load skills", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3001/api/skills/add",
        {
          user_id: userId,
          skill_id: skillId,
          type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);
      setSkillId(""); // Reset form
    } catch (err) {
      console.error(err);
      setMessage("Error adding skill");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a Skill</h2>

      <label>Choose a skill:</label>
      <select
        value={skillId}
        onChange={(e) => setSkillId(e.target.value)}
        required
      >
        <option value="">-- Select a skill --</option>
        {skills.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.skill_name}
          </option>
        ))}
      </select>

      <div>
        <label>
          <input
            type="radio"
            value="offer"
            checked={type === "offer"}
            onChange={(e) => setType(e.target.value)}
          />
          I can offer this skill
        </label>

        <label>
          <input
            type="radio"
            value="learn"
            checked={type === "learn"}
            onChange={(e) => setType(e.target.value)}
          />
          I want to learn this skill
        </label>
      </div>

      <button type="submit">Add Skill</button>

      {message && <p>{message}</p>}
    </form>
  );
}
