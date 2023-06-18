const url = require('url');
const generatePoints = require('../Points/PointsGenerator');
const cors = require('cors');
const axios = require('axios');

let data = {};

exports.getRequest = function (req, res) {
  const reqUrl = url.parse(req.url, true);
  let name = 'World';
  if (reqUrl.query.data) {
    name = reqUrl.query.data;
  }
  //console.log(data);
  const response = {
    points: data,
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
  res.end(JSON.stringify(response));
};

exports.postView = function (req, res) {
  let body = '';

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    try {
      const viewData = JSON.parse(body);

      data = viewData.points;

      const response = {
        text: `received new viewport settings`,
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

      // Send a request to http://localhost:8888 with the received JSON data
      axios.post('http://localhost:8888', postBody)
        .then(response => {
          // Process the response if needed

          // Send a response back to the client
          const responseData = {
            text: `received ${postBody.points.length} points`,
          };

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
          res.end(JSON.stringify(responseData));
        })
        .catch(error => {
          // Handle the error if needed

          // Send an error response back to the client
          const errorResponse = {
            text: 'ERROR',
          };

          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
          res.end(JSON.stringify(errorResponse));
        });
    } catch (e) {
      const errorResponse = {
        text: 'ERROR',
      };

      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
      res.end(JSON.stringify(errorResponse));
    }
  });
};

exports.invalidRequest = function (req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
  res.end('Invalid Request');
};
