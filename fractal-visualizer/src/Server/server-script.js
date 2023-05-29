const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const hostname = '127.0.0.1';
const port = 31415;

const server = require('./controller.js');

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});