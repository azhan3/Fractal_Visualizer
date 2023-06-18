module.exports = function (req, res) {

  let body = '';

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    try {
      const postBody = JSON.parse(body);
        //console.log(postBody);
      data = postBody.points;

      const response = {
        text: `received ${postBody.points.xList.length} points`,
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