import knex from 'knex';

const k = knex({
    client: 'sqlite3',
    connection: {
        filename: './data.sqlite'
    },
    useNullAsDefault: true
});

(async () => {
    await k.schema.createTable('card', function (t) {
        t.increments('id').primary();
        t.string('german');
        t.string('english');
        t.string('group');
        t.string('category');
        t.string('image');
        t.string('sentence');
        t.int('played');
        t.int('correct');
        t.int('incorrect');
        t.int('streak');
        t.timestamp('lastPlayed');
    });

    await k.destroy();
})();
