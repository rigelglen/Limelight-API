const { app } = require('./server')
const Topic = require('./components/topic/topic.model');
const { categories } = require('./util/test.seed')
const port = process.env.NODE_PORT;

Topic.insertMany(categories, { ordered: false }).then((res) => {
    console.log('Database seeded');
}).catch(e => {
    console.log('Database already seeded')
});

const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});