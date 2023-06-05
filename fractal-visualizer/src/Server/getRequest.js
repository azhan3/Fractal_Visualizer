const url = require('url');

let data = {};

module.exports = function (req, res) {
  const reqUrl = url.parse(req.url, true);
  let name = 'World';
  if (reqUrl.query.data) {
    name = reqUrl.query.data;
  }
  console.log(data);
  const response = {
    points: data,
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
  res.end(JSON.stringify(response));
};
