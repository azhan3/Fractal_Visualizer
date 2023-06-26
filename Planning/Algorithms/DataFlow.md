# Data Flow: Vert.x org.backend.Backend to Node.js Server to React Frontend

## Vert.x org.backend.Backend (Java)

1. Generate and store points in a PointList object.
2. Convert the points to JSON.
3. Send the JSON data to the Node.js server.

## Node.js Server (server.js)

1. Set up a route to handle the incoming data from the Vert.x backend.
2. Parse the received JSON data.
3. Process and manipulate the data if needed.
4. Send the processed data to the React frontend.

## React Frontend (JavaScript)

1. Make an HTTP request to the Node.js server to retrieve the data.
2. Receive the data in JSON format.
3. Parse the JSON data.
4. Render the data in the React component.

## Vert.x org.backend.Backend Pseudocode:
```bash
function handlePostData(routingContext):
    response = routingContext.response()
    request = routingContext.request()

    request.bodyHandler(bodyHandler -> {
        body = bodyHandler.toString()

        if (body is not null and body is not empty):
            // Process the received data
            print "Received data: " + body

            // Create Gson instance

            // Convert JSON string to JsonObject
            data = parseJson(body)

            // Process the data and perform any necessary operations here
            n = data.get("nValue").getAsInt()
            p = data.get("pValue").getAsInt()
            algo = data.get("Algorithm").getAsInt()
            l = data.get("lValue").getAsFloat()
            zoom = data.get("zoom").getAsFloat()
            useRecommendedL = data.get("RecommendL").getAsBoolean()
            primeRaces = data.get("PrimeRaces").getAsJsonObject()

            l = if useRecommendedL then scaleFactor((if algo is 1 then p else p - 1)) else l
            n *= zoom
            pl = empty List of PointList

            if algo is 1:
                newPoints = create PAddicRepresenter with p, l, 30
                pl = newPoints.transformSample(n, primeRaces)
            else:
                newPoints2 = create AlgorithmGeneralCase with p, l, 30
                pl = newPoints2.transformSample(n, primeRaces)

            minmax = pl[0].getMinMaxPoints()
            minimum = create PointList

            minimum.addPoint(minmax[0], minmax[1])

            maximum = create PointList

            maximum.addPoint(minmax[2], minmax[3])

            parentAppender = create JSONAppender

            parentAppender.addAppender("min", minimum.toJsonAppender())
            parentAppender.addAppender("max", maximum.toJsonAppender())
            parentAppender.addAppender("points", pl[0].toJsonAppender())

            PrimeRaces = create JSONAppender

            for i = 1 to pl.size() - 1:
                PrimeRaces.addAppender(i.toString(), pl[i].toJsonAppender())

            parentAppender.addAppender("PrimeRaces", PrimeRaces)
            response.putHeader("Content-Type", "text/plain")
                    .end(parentAppender.getJSONString())
        else:
            print "Request body is null or empty"
            response.setStatusCode(400)
                    .end()
    })
end function

function send(pointList: JSONAppender):
    client = create WebClient with vertx
    url = "http://localhost:31415/data"

    jsonPayload = pointList.getJSONString()

    client.postAbs(url)
            .sendBuffer(create Buffer from jsonPayload, ar -> {
                if (ar.succeeded()):
                    response = ar.result()
                    print "Status Code: " + response.statusCode()
                    print "Response Body: " + response.bodyAsString()
                else:
                    print "Request failed: " + ar.cause().getMessage()
            })
end function
```

## Node.js server and server script pseudocode
```bash
function startServerScript():
    child = spawn('node', ['./src/Server/server-script.js'])

    child.stdout.on('data', (data) => {
        print "Server output: " + data
    })

    child.stderr.on('data', (data) => {
        print "Server error: " + data
    })

    child.on('close', (code) => {
        print "Server process exited with code " + code
    })

end function

startServerScript()
```
