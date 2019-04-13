const { app } = require('./server')

const port = process.env.NODE_PORT;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});