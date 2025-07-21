const express = require("express");
const router = express.Router();
const db = require("../db/knex"); // or adjust this if your DB file has a different name

// POST /api/skills/add → Assign a skill to a user
router.post("/add", async (req, res) => {
  const { user_id, skill_id, type } = req.body;

  if (!user_id || !skill_id || !["offer", "learn"].includes(type)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    await db("user_skills").insert({
      user_id,
      skill_id,
      type,
    });

    res.status(200).json({ message: "Skill successfully added to user!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while adding skill" });
  }
});

// Get all available skills
router.get("/all", async (req, res) => {
  try {
    const skills = await db("skills").select("id", "name");
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

module.exports = router;

