const url = require('url');
const generatePoints = require('../Points/PointsGenerator');
const cors = require('cors');

let data = {};

exports.getRequest = function (req, res) {
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

exports.postRequest = function (req, res) {
  let body = '';

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    try {
      const postBody = JSON.parse(body);

      // Process the received JSON data
      // For example, you can access the PointList object using postBody.xList and postBody.yList

      // Send a response back
      const pointsData = generatePoints([{ x: 110, y: 110 }, { x: 1, y: 1 }]);

      data = postBody.points;

      const response = {
        text: `received ${postBody.points.length} points`,
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
      res.end(JSON.stringify(response));
    } catch (e) {
      const response = {
        text: `ERROR`,
      };

      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
      res.end(JSON.stringify(response));
    }
  });
};

exports.invalidRequest = function (req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
  res.end('Invalid Request');
};
