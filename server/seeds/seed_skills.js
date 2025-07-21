exports.seed = async function (knex) {
  // Optional: clear the table first
  await knex('skills').del();

  // Then insert skills
  await knex('skills').insert([
    { skill_name: 'Guitar', type: 'offered' },
    { skill_name: 'Cooking', type: 'offered' },
    { skill_name: 'Web Development', type: 'offered' },
    { skill_name: 'Graphic Design', type: 'offered' },
    { skill_name: 'Spanish', type: 'offered' },
    { skill_name: 'English', type: 'offered' },
    { skill_name: 'Baking', type: 'offered' },
    { skill_name: 'Bike Repair', type: 'offered' },
    { skill_name: 'Photography', type: 'offered' },
    { skill_name: 'Yoga', type: 'offered' },
    { skill_name: 'Public Speaking', type: 'offered' },
    { skill_name: 'Resume Writing', type: 'offered' },
    { skill_name: 'Math Tutoring', type: 'offered' },
    { skill_name: 'Coding Interview Prep', type: 'offered' },
    { skill_name: 'Video Editing', type: 'offered' }
  ]);
};

