const axios = require('axios');

module.exports = function (req, res) {
  let body = '';

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    try {
      const viewData = JSON.parse(body);
      console.log(viewData);

      // Send a request to http://localhost:8888/send-data with the received JSON data
      axios.post('http://localhost:8888/send-data', body)
        .then(response => {
          // Process the response if needed
          // Send a response back to the client
          const responseData = {
            text: 'Received new viewport settings',
            data: response.data
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
      const response = {
        text: 'ERROR',
      };

      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
      res.end(JSON.stringify(response));
    }
  });
};
