exports.up = function(knex) {
  return knex.schema.alterTable('user_skills', (table) => {
    table.text('description');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('user_skills', (table) => {
    table.dropColumn('description');
  });
};
