exports.up = function(knex) {
  return knex.schema.createTable('user_skills', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('skill_id').unsigned().references('id').inTable('skills').onDelete('CASCADE');
    table.enum('type', ['offer', 'learn']).notNullable(); // is this a skill they offer or want to learn?
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_skills');
};
