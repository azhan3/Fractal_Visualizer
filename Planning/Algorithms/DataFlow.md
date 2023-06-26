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

## Vert.x org.backend.Backend pseudocode:
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

## Node.js server Pseudocode:
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

## Node.js server-script Pseudocode:
```bash

function getRequest(req, res):
    parse the request URL
    initialize name variable with 'World' (default value)
    if query parameter 'data' exists in reqUrl:
        assign its value to name

    create response object with 'points' property as data

    set response status code to 200
    set response headers for Content-Type and Access-Control-Allow-Origin
    end the response by sending JSON.stringify(response)

end function

function postView(req, res):
    initialize body variable as an empty string

    handle 'data' event on the request:
        append received data chunks to the body variable

    handle 'end' event on the request:
        parse the received body as viewData JSON
        assign viewData.points to data variable

        create response object with 'text' property as 'received new viewport settings'

        set response status code to 200
        set response headers for Content-Type and Access-Control-Allow-Origin
        end the response by sending JSON.stringify(response)

end function

function postRequest(req, res):
    initialize body variable as an empty string

    handle 'data' event on the request:
        append received data chunks to the body variable

    handle 'end' event on the request:
        parse the received body as postBody JSON

        send a POST request to 'http://localhost:8888' with postBody as payload using axios module:
            handle successful response:
                process the response if needed

                create responseData object with 'text' property as 'received [length] points'

                set response status code to 200
                set response headers for Content-Type and Access-Control-Allow-Origin
                end the response by sending JSON.stringify(responseData)

            handle error response:
                handle the error if needed

                create errorResponse object with 'text' property as 'ERROR'

                set response status code to 500
                set response headers for Content-Type and Access-Control-Allow-Origin
                end the response by sending JSON.stringify(errorResponse)

    handle JSON parsing error:
        create errorResponse object with 'text' property as 'ERROR'

        set response status code to 400
        set response headers for Content-Type and Access-Control-Allow-Origin
        end the response by sending JSON.stringify(errorResponse)

end function

function invalidRequest(req, res):
    set response status code to 404
    set response headers for Content-Type and Access-Control-Allow-Origin
    end the response by sending 'Invalid Request'

end function

export getRequest, postView, postRequest, and invalidRequest functions
```

## React Front-End Pseudocode:
```bash
declare loading variable
declare primesArray variable
declare remaindersArray variable
declare requestData object
declare requestOptions object

function handleSend():
    set loading to true

    parse primes and remainders input and assign them to primesArray and remaindersArray respectively

    populate requestData object with required data

    populate requestOptions object with method, headers, and body

    send a POST request to "http://localhost:31415/view" with requestOptions:
        handle response:
            process the response data if needed
            update state variables with the received data
            set loading to false

        handle error:
            log the error to the console
            set loading to false

end function

function renderPoints():

end function

function handleNValueChange(event):
    set nValue to event.target.value

end function

function handlePValueChange(event):
    set pValue to event.target.value

end function

function handleLValueChange(event):
    set lValue to event.target.value

end function

function handlePrimesChange(event):
    set primes to event.target.value

end function

function handleRemaindersChange(event):
    set remainders to event.target.value

end function

function scalePointsToFitCanvas(pointsData, minX, minY, maxX, maxY, canvasWidth, canvasHeight):
    initialize an empty array scaledPoints

    calculate scaledCanvasWidth and scaledCanvasHeight based on zoom

    calculate scaleX and scaleY based on scaledCanvasWidth, scaledCanvasHeight, and data range

    iterate over each point in pointsData:
        scale the x and y coordinates based on minX, minY, scaleX, and scaleY
        add the scaled point to scaledPoints

    return scaledPoints

end function

function handleClearCanvas(event):
    clear the coordinates array
    clear the primeRacesPTS array

end function

function handleVisualize():
    if pointsData is empty, return

    calculate scaled coordinates for pointsData using scalePointsToFitCanvas
    update coordinates with the scaled coordinates

    initialize an empty array PrimePts

    iterate over each key in primeRacesData:
        retrieve coordinates for the key
        calculate scaled coordinates for the coordinates using scalePointsToFitCanvas
        add the scaled coordinates to PrimePts

    update PrimeRacesPTS with PrimePts

    calculate canvasWidth and canvasHeight based on window dimensions and zoom level

end function

function handleSizeChange(event):
    retrieve the value from event.target.value and assign it to value

    update dotSize with value if it's not an empty string
    update sizePlaceholder with value

end function
```
