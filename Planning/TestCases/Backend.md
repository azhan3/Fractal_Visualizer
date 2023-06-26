# Test Case: Backend

## Description
Verify the functionality of the `Backend` class for handling HTTP requests and processing data.

## Steps
1. Start the HTTP server by calling the `start` method of `Backend`.
2. Send a POST request to the `/send-data` endpoint with the following data:
    - Request Body:
      ```json
      {
        "nValue": 10,
        "pValue": 3,
        "Algorithm": 1,
        "lValue": 1.5,
        "zoom": 2.0,
        "RecommendL": true,
        "PrimeRaces": {
          "primes": [2, 3, 5],
          "remainders": [1, 2, 3]
        }
      }
      ```
3. Verify that the server responds with a status code of 200.
4. Verify that the server responds with a JSON payload containing the following fields:
    - `"min"`: representing the minimum point in the point list as a JSON object.
    - `"max"`: representing the maximum point in the point list as a JSON object.
    - `"points"`: representing the primary point list as a JSON object.
    - `"PrimeRaces"`: representing the prime race point lists as a JSON object containing sub-objects for each prime race.
5. Ensure the JSON payload successfully makes it to the Node.js server and then to the React app
## Expected Result
The `Backend` class should handle the POST request correctly and process the received data. It should generate the necessary point lists based on the provided parameters and return them in the JSON response payload. The response payload should contain the minimum and maximum points, the primary point list, and the prime race point lists.
