exports.up = function(knex) {
  return knex.schema.createTable('matches', table => {
    table.increments('id').primary();
    table.integer('user_id_1').unsigned().references('users.id').onDelete('CASCADE');
    table.integer('user_id_2').unsigned().references('users.id').onDelete('CASCADE');
    table.string('skill_name').notNullable();
    table.enum('status', ['pending', 'accepted', 'rejected']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('matches');
};
