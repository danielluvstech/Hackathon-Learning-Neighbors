exports.up = function(knex) {
  return knex.schema.alterTable('swap_requests', function(table) {
    table.integer('from_user_id');
    // No status column since it already exists
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('swap_requests', function(table) {
    table.dropColumn('from_user_id');
  });
};
