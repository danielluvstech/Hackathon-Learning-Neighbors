exports.up = async function(knex) {
  // Drop old table (if it exists with old columns)
  await knex.schema.dropTableIfExists('swap_requests');

  // Recreate with the new, simplified schema
  return knex.schema.createTable('swap_requests', table => {
    table.increments('id').primary();
    table.integer('from_user_id').unsigned().references('users.id').onDelete('CASCADE');
    table.integer('to_user_id').unsigned().references('users.id').onDelete('CASCADE');
    table.integer('skill_id').unsigned().references('skills.id').onDelete('CASCADE');
    table.text('message');
    table.enum('status', ['pending', 'accepted', 'rejected']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  // If you roll back, just drop the table
  await knex.schema.dropTableIfExists('swap_requests');
  // (Optional) You could recreate the *old* schema here if you really want to, but not necessary for hackathon dev.
};
