exports.up = function(knex) {
  return knex.schema.createTable('skills', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
    table.string('skill_name').notNullable();
    table.enum('type', ['offered', 'requested']).notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('skills');
};
