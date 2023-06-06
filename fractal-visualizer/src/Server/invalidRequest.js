exports.invalidRequest = function (req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS for all origins
  res.end('Invalid Request');
};