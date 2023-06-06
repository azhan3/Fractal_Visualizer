Backend Verticle Pseudocode:

1. Import the required libraries and classes.

2. Define the Backend class that extends AbstractVerticle.

3. Override the start() method:
    4. Create a Router instance for handling HTTP requests.
    5. Configure the route for handling POST requests to "/send-data" and specify the handler method.

    6. Create an HTTP server and set the router as the request handler.
    7. Start the HTTP server on port 8888.
    8. If the server starts successfully, complete the startPromise, otherwise fail with the cause.

9. Define the handlePostData() method with a RoutingContext parameter:
    10. Get the HTTP response and request objects from the RoutingContext.
    11. Extract the request body using the bodyHandler.
    12. Convert the body to a string.
    13. Check if the body is not null and not empty:
        14. Print the received data.
        15. Create a Gson instance.
        16. Convert the JSON string to a JsonObject using Gson.
        17. Extract the values of n, p, and l from the JsonObject.
        18. Create an instance of PAddicRepresenter with p, l, and an outputLength of some integer.
        19. Transform the sample using the transformSample() method of PAddicRepresenter.
        20. Create a JSONAppender instance for the parent object.
        21. Add the PointList as a JSONAppender under the key "points" in the parentAppender.
        22. Print the JSON representation of the parentAppender.
        23. Set the response content type to "text/plain".
        24. Send the JSON string representation of the parentAppender as the response.

    25. If the body is null or empty:
        26. Print an error message.
        27. Set the response status code to 400 (Bad Request) and end the response.

28. Define the send() method with a JSONAppender parameter:
    29. Create a WebClient instance.
    30. Specify the URL for sending the data.
    31. Get the JSON string representation of the pointList.
    32. Send a POST request to the URL with the JSON payload using the WebClient.
    33. Handle the response asynchronously:
        34. If the request succeeds:
            35. Print the status code and body of the response.
        36. If the request fails:
            37. Print the error message.
