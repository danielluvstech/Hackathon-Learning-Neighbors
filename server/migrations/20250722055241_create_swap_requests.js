exports.up = function(knex) {
  return knex.schema.createTable('swap_requests', table => {
    table.increments('id').primary();
    table.integer('requester_id').unsigned().references('users.id').onDelete('CASCADE');
    table.integer('responder_id').unsigned().references('users.id').onDelete('CASCADE');
    table.integer('requester_skill_id').unsigned();
    table.integer('responder_skill_id').unsigned();
    table.enum('status', ['pending', 'accepted', 'rejected']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('swap_requests');
};

