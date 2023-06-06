const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const hostname = '127.0.0.1';
const port = 31415;

const controller = require('./controller.js');
app.use('/', controller);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
