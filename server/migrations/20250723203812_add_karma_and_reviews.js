exports.up = function(knex) {
  return knex.schema
    .table('users', (table) => {
      table.integer('karma_points').defaultTo(0);
    })
    .createTable('reviews', (table) => {
      table.increments('id').primary();
      table.integer('from_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('to_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('swap_request_id').unsigned().references('id').inTable('swap_requests').onDelete('CASCADE');
      table.integer('rating').notNullable(); // 1 to 5
      table.text('comment');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('reviews')
    .table('users', (table) => {
      table.dropColumn('karma_points');
    });
};
