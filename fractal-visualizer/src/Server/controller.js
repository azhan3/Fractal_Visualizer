const http = require('http');
const url = require('url');

module.exports = http.createServer((req, res) => {

    var service = require('./service.js');
    const reqUrl = url.parse(req.url, true);
    console.log(reqUrl);
    // GET Endpoint
    if (reqUrl.pathname === '/data' && req.method === 'GET') {
        console.log('Request Type: ' +
            req.method + ' Endpoint: ' +
            reqUrl.pathname);

        service.getRequest(req, res);

        // POST Endpoint
    } else if (reqUrl.pathname === '/data' && req.method === 'POST') {
        console.log('Request Type: ' +
            req.method + ' Endpoint: ' +
            reqUrl.pathname);

        service.postRequest(req, res);

    } else {
        console.log('Request Type: ' +
            req.method + ' Invalid Endpoint: ' +
            reqUrl.pathname);

        service.invalidRequest(req, res);

    }
});
