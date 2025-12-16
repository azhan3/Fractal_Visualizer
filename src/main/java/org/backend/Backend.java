package org.backend;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.backend.math.AlgorithmGeneralCase;
import org.backend.math.MathEquations;
import org.backend.math.PAddicRepresenter;
import org.backend.util.JSONAppender;
import org.backend.util.PointList;
import java.util.List;

public class Backend extends AbstractVerticle {
    private final Gson gson = new Gson();
    HttpServerOptions serverOptions = new HttpServerOptions().setIdleTimeout(0);

    @Override
    public void start(Promise<Void> startPromise) {
        Router router = Router.router(vertx);
        // Basic CORS handling: respond to preflight and add CORS headers
        router.route().handler(ctx -> {
            ctx.response().putHeader("Access-Control-Allow-Origin", "http://localhost:5500");
            ctx.response().putHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
            ctx.response().putHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            // If it's an OPTIONS preflight request, end here
            if ("OPTIONS".equalsIgnoreCase(ctx.request().method().name())) {
                ctx.response().setStatusCode(204).end();
            } else {
                ctx.next();
            }
        });

        router.route(HttpMethod.POST, "/send-data").handler(this::handlePostData);

        // Create an HTTP server and configure the router and websocket endpoint
        vertx.createHttpServer(serverOptions)
                .webSocketHandler(webSocket -> {
                    if (!"/ws".equals(webSocket.path())) {
                        webSocket.reject();
                        return;
                    }

                    webSocket.textMessageHandler(message -> {
                        if (message == null || message.isEmpty()) {
                            return;
                        }

                        try {
                            JsonObject data = gson.fromJson(message, JsonObject.class);
                            if (isStreamRequest(data)) {
                                processRequestStream(data, webSocket);
                            } else {
                                String responseJson = processRequest(data);
                                webSocket.writeTextMessage(responseJson);
                            }
                        } catch (Exception ex) {
                            webSocket.writeTextMessage(buildErrorResponse("Invalid JSON payload"));
                        }
                    });
                })
                .requestHandler(router)
                .listen(8888, http -> {
                    if (http.succeeded()) {
                        startPromise.complete();
                        System.out.println("HTTP server started on port 8888");
                    } else {
                        startPromise.fail(http.cause());
                    }
                });
    }

    private void handlePostData(RoutingContext routingContext) {
        HttpServerResponse response = routingContext.response();
        HttpServerRequest request = routingContext.request();

        // Handle the request body
        request.bodyHandler(bodyHandler -> {
            String body = bodyHandler.toString();

            if (body != null && !body.isEmpty()) {
                // Process the received data
                System.out.println("Received data: " + body);

                // Create a Gson instance

                JsonObject data = gson.fromJson(body, JsonObject.class);
                String responseJson = processRequest(data);
                response.putHeader("Content-Type", "application/json")
                        .end(responseJson);
            } else {
                System.out.println("Request body is null or empty");
                response.setStatusCode(400)
                        .end();
            }
        });
    }

    private String processRequest(JsonObject data) {
        if (data == null) {
            return buildErrorResponse("Empty payload");
        }

        int version = getInt(data, "version", 0);
        String requestId = getString(data, "requestId", null);

        JsonObject params = data;
        JsonObject view = data;
        JsonObject filters = data;

        if (version == 1 && data.has("data") && data.get("data").isJsonObject()) {
            JsonObject payload = data.getAsJsonObject("data");
            params = getObject(payload, "params");
            view = getObject(payload, "view");
            filters = getObject(payload, "filters");
        }

        int n = version == 1 ? getInt(params, "nValue", 0) : getInt(data, "nValue", 0);
        int p = version == 1 ? getInt(params, "pValue", 0) : getInt(data, "pValue", 0);
        int algo = version == 1 ? getInt(params, "algorithm", 1) : getInt(data, "Algorithm", 1);
        float l = version == 1 ? getFloat(params, "lValue", 0) : getFloat(data, "lValue", 0);
        float zoom = version == 1 ? getFloat(view, "zoom", 1) : getFloat(data, "zoom", 1);
        int precision = version == 1 ? getInt(params, "precision", 30) : getInt(data, "precision", 30);
        boolean useRecommendedL = version == 1
                ? getBoolean(params, "recommendL", false)
                : getBoolean(data, "RecommendL", false);

        JsonObject primeRaces = version == 1
                ? ensurePrimeRaces(getObject(filters, "primeRaces"))
                : ensurePrimeRaces(getObject(data, "PrimeRaces"));

        l = useRecommendedL ? (float) MathEquations.scaleFactor((algo == 1 ? p : p - 1)) : l;
        n = Math.max(0, Math.round(n * zoom));

        List<PointList> pl;
        if (algo == 1) {
            PAddicRepresenter newPoints = new PAddicRepresenter(p, l, precision);
            pl = newPoints.transformSample(n, primeRaces);
        } else {
            AlgorithmGeneralCase newPoints2 = new AlgorithmGeneralCase(p, l, precision);
            pl = newPoints2.transformSample(n, primeRaces);
        }

        double[] minmax = pl.get(0).getMinMaxPoints();
        PointList minimum = new PointList(1);
        minimum.addPoint(minmax[0], minmax[1]);
        PointList maximum = new PointList(1);
        maximum.addPoint(minmax[2], minmax[3]);

        JSONAppender parentAppender = new JSONAppender();

        if (version == 1) {
            JSONAppender metaAppender = new JSONAppender();
            metaAppender.addNumber("algorithm", algo);
            metaAppender.addNumber("nValue", n);
            metaAppender.addNumber("pValue", p);
            metaAppender.addNumber("lValue", l);
            metaAppender.addNumber("precision", precision);
            metaAppender.addNumber("zoom", zoom);
            metaAppender.addNumber("pointCount", pl.get(0).size());
            metaAppender.addNumber("primeRaceCount", Math.max(0, pl.size() - 1));

            JSONAppender boundsAppender = new JSONAppender();
            boundsAppender.addNumberArray("min", new double[]{minmax[0], minmax[1]});
            boundsAppender.addNumberArray("max", new double[]{minmax[2], minmax[3]});

            JSONAppender dataAppender = new JSONAppender();
            dataAppender.addAppender("points", pl.get(0).toJsonAppenderFlat());

            JSONAppender primeAppender = new JSONAppender();
            for (int i = 1 ; i < pl.size() ; ++i) {
                primeAppender.addAppender(Integer.toString(i), pl.get(i).toJsonAppenderFlat());
            }
            dataAppender.addAppender("primeRaces", primeAppender);

            parentAppender.addNumber("version", 1);
            if (requestId != null && !requestId.isEmpty()) {
                parentAppender.addString("requestId", requestId);
            }
            parentAppender.addAppender("meta", metaAppender);
            parentAppender.addAppender("bounds", boundsAppender);
            parentAppender.addAppender("data", dataAppender);
        } else {
            parentAppender.addAppender("min", minimum.toJsonAppender());
            parentAppender.addAppender("max", maximum.toJsonAppender());
            parentAppender.addAppender("points", pl.get(0).toJsonAppender());

            JSONAppender PrimeRaces = new JSONAppender();
            for (int i = 1 ; i < pl.size() ; ++i) {
                PrimeRaces.addAppender(Integer.toString(i), pl.get(i).toJsonAppender());
            }
            parentAppender.addAppender("PrimeRaces", PrimeRaces);
        }

        System.out.println(pl.get(0).size());
        return parentAppender.getJSONString();
    }

    private String buildErrorResponse(String message) {
        JSONAppender errorAppender = new JSONAppender();
        errorAppender.addNumber("version", 1);
        errorAppender.addString("error", message);
        return errorAppender.getJSONString();
    }

    private boolean isStreamRequest(JsonObject data) {
        if (data == null) {
            return false;
        }

        int version = getInt(data, "version", 0);
        if (version == 1 && data.has("data") && data.get("data").isJsonObject()) {
            JsonObject payload = data.getAsJsonObject("data");
            JsonObject stream = getObject(payload, "stream");
            return getBoolean(stream, "enabled", false);
        }

        return false;
    }

    private void processRequestStream(JsonObject data, ServerWebSocket webSocket) {
        int version = getInt(data, "version", 0);
        String requestId = getString(data, "requestId", null);

        JsonObject params = data;
        JsonObject view = data;
        JsonObject filters = data;

        if (version == 1 && data.has("data") && data.get("data").isJsonObject()) {
            JsonObject payload = data.getAsJsonObject("data");
            params = getObject(payload, "params");
            view = getObject(payload, "view");
            filters = getObject(payload, "filters");
        }

        int n = version == 1 ? getInt(params, "nValue", 0) : getInt(data, "nValue", 0);
        int p = version == 1 ? getInt(params, "pValue", 0) : getInt(data, "pValue", 0);
        int algo = version == 1 ? getInt(params, "algorithm", 1) : getInt(data, "Algorithm", 1);
        float l = version == 1 ? getFloat(params, "lValue", 0) : getFloat(data, "lValue", 0);
        float zoom = version == 1 ? getFloat(view, "zoom", 1) : getFloat(data, "zoom", 1);
        int precision = version == 1 ? getInt(params, "precision", 30) : getInt(data, "precision", 30);
        boolean useRecommendedL = version == 1
                ? getBoolean(params, "recommendL", false)
                : getBoolean(data, "RecommendL", false);

        JsonObject primeRaces = version == 1
                ? ensurePrimeRaces(getObject(filters, "primeRaces"))
                : ensurePrimeRaces(getObject(data, "PrimeRaces"));

        JsonArray primesJson = primeRaces.getAsJsonArray("primes");
        JsonArray remaindersJson = primeRaces.getAsJsonArray("remainders");
        int raceCount = primesJson.size();
        int[] primes = new int[raceCount];
        int[] remainders = new int[raceCount];
        for (int i = 0; i < raceCount; i++) {
            primes[i] = primesJson.get(i).getAsInt();
            remainders[i] = remaindersJson.get(i).getAsInt();
        }

        l = useRecommendedL ? (float) MathEquations.scaleFactor((algo == 1 ? p : p - 1)) : l;
        n = Math.max(0, Math.round(n * zoom));

        int chunkSize = 2000;
        if (version == 1 && data.has("data") && data.get("data").isJsonObject()) {
            JsonObject stream = getObject(data.getAsJsonObject("data"), "stream");
            chunkSize = Math.max(1, getInt(stream, "chunkSize", chunkSize));
        }

        double[] bounds = computeBounds(algo, p, l, precision, n);
        JSONAppender start = new JSONAppender();
        start.addNumber("version", 1);
        if (requestId != null && !requestId.isEmpty()) {
            start.addString("requestId", requestId);
        }
        start.addBoolean("stream", true);
        start.addString("type", "start");

        JSONAppender boundsAppender = new JSONAppender();
        boundsAppender.addNumberArray("min", new double[]{bounds[0], bounds[1]});
        boundsAppender.addNumberArray("max", new double[]{bounds[2], bounds[3]});
        start.addAppender("bounds", boundsAppender);

        JSONAppender metaAppender = new JSONAppender();
        metaAppender.addNumber("algorithm", algo);
        metaAppender.addNumber("nValue", n);
        metaAppender.addNumber("pValue", p);
        metaAppender.addNumber("lValue", l);
        metaAppender.addNumber("precision", precision);
        metaAppender.addNumber("zoom", zoom);
        metaAppender.addNumber("primeRaceCount", raceCount);
        start.addAppender("meta", metaAppender);

        webSocket.writeTextMessage(start.getJSONString());

        StreamGenerator generator = createStreamGenerator(algo, p, l, precision);
        double[] coords = new double[2];

        double[] primaryX = new double[chunkSize];
        double[] primaryY = new double[chunkSize];
        int primaryCount = 0;

        double[][] raceX = new double[raceCount][];
        double[][] raceY = new double[raceCount][];
        int[] raceCounts = new int[raceCount];
        for (int i = 0; i < raceCount; i++) {
            raceX[i] = new double[chunkSize];
            raceY[i] = new double[chunkSize];
            raceCounts[i] = 0;
        }

        int seq = 0;
        for (int value = 0; value <= n; value++) {
            generator.toPlane(value, coords);
            double x = coords[0];
            double y = coords[1];

            primaryX[primaryCount] = x;
            primaryY[primaryCount] = y;
            primaryCount++;

            for (int i = 0; i < raceCount; i++) {
                if (value % primes[i] == remainders[i]) {
                    int count = raceCounts[i];
                    if (count >= chunkSize) {
                        continue;
                    }
                    raceX[i][count] = x;
                    raceY[i][count] = y;
                    raceCounts[i] = count + 1;
                }
            }

            if (primaryCount >= chunkSize) {
                sendChunk(webSocket, requestId, seq++, primaryX, primaryY, primaryCount, raceX, raceY, raceCounts);
                primaryCount = 0;
                for (int i = 0; i < raceCount; i++) {
                    raceCounts[i] = 0;
                }
            }
        }

        if (primaryCount > 0) {
            sendChunk(webSocket, requestId, seq++, primaryX, primaryY, primaryCount, raceX, raceY, raceCounts);
        }

        JSONAppender end = new JSONAppender();
        end.addNumber("version", 1);
        if (requestId != null && !requestId.isEmpty()) {
            end.addString("requestId", requestId);
        }
        end.addBoolean("stream", true);
        end.addString("type", "end");
        end.addNumber("seq", seq);
        webSocket.writeTextMessage(end.getJSONString());
    }

    private void sendChunk(ServerWebSocket webSocket,
                           String requestId,
                           int seq,
                           double[] primaryX,
                           double[] primaryY,
                           int primaryCount,
                           double[][] raceX,
                           double[][] raceY,
                           int[] raceCounts) {
        JSONAppender chunk = new JSONAppender();
        chunk.addNumber("version", 1);
        if (requestId != null && !requestId.isEmpty()) {
            chunk.addString("requestId", requestId);
        }
        chunk.addBoolean("stream", true);
        chunk.addString("type", "chunk");
        chunk.addNumber("seq", seq);

        JSONAppender dataAppender = new JSONAppender();
        JSONAppender pointsAppender = new JSONAppender();
        pointsAppender.addNumberArray("x", primaryX, primaryCount);
        pointsAppender.addNumberArray("y", primaryY, primaryCount);
        dataAppender.addAppender("points", pointsAppender);

        JSONAppender primeAppender = new JSONAppender();
        for (int i = 0; i < raceCounts.length; i++) {
            JSONAppender raceAppender = new JSONAppender();
            raceAppender.addNumberArray("x", raceX[i], raceCounts[i]);
            raceAppender.addNumberArray("y", raceY[i], raceCounts[i]);
            primeAppender.addAppender(Integer.toString(i + 1), raceAppender);
        }
        dataAppender.addAppender("primeRaces", primeAppender);

        chunk.addAppender("data", dataAppender);
        webSocket.writeTextMessage(chunk.getJSONString());
    }

    private double[] computeBounds(int algo, int p, float l, int precision, int n) {
        StreamGenerator generator = createStreamGenerator(algo, p, l, precision);
        double[] coords = new double[2];

        double minX = Double.POSITIVE_INFINITY;
        double minY = Double.POSITIVE_INFINITY;
        double maxX = Double.NEGATIVE_INFINITY;
        double maxY = Double.NEGATIVE_INFINITY;

        for (int value = 0; value <= n; value++) {
            generator.toPlane(value, coords);
            double x = coords[0];
            double y = coords[1];

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }

        if (!Double.isFinite(minX) || !Double.isFinite(minY) || !Double.isFinite(maxX) || !Double.isFinite(maxY)) {
            return new double[]{Double.NaN, Double.NaN, Double.NaN, Double.NaN};
        }

        return new double[]{minX, minY, maxX, maxY};
    }

    private StreamGenerator createStreamGenerator(int algo, int p, float l, int precision) {
        if (algo == 1) {
            PAddicRepresenter rep = new PAddicRepresenter(p, l, precision);
            return rep::toPlane;
        }
        AlgorithmGeneralCase general = new AlgorithmGeneralCase(p, l, precision);
        return general::toPlaneInto;
    }

    @FunctionalInterface
    private interface StreamGenerator {
        void toPlane(int n, double[] out);
    }

    private int getInt(JsonObject data, String key, int defaultValue) {
        if (data != null && data.has(key) && data.get(key).isJsonPrimitive()) {
            try {
                return data.get(key).getAsInt();
            } catch (NumberFormatException ex) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    private float getFloat(JsonObject data, String key, float defaultValue) {
        if (data != null && data.has(key) && data.get(key).isJsonPrimitive()) {
            try {
                return data.get(key).getAsFloat();
            } catch (NumberFormatException ex) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    private boolean getBoolean(JsonObject data, String key, boolean defaultValue) {
        if (data != null && data.has(key) && data.get(key).isJsonPrimitive()) {
            try {
                return data.get(key).getAsBoolean();
            } catch (Exception ex) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    private String getString(JsonObject data, String key, String defaultValue) {
        if (data != null && data.has(key) && data.get(key).isJsonPrimitive()) {
            return data.get(key).getAsString();
        }
        return defaultValue;
    }

    private JsonObject getObject(JsonObject data, String key) {
        if (data != null && data.has(key) && data.get(key).isJsonObject()) {
            return data.getAsJsonObject(key);
        }
        return new JsonObject();
    }

    private JsonObject ensurePrimeRaces(JsonObject primeRaces) {
        JsonObject result = primeRaces == null ? new JsonObject() : primeRaces;
        if (!result.has("primes") || !result.get("primes").isJsonArray()) {
            result.add("primes", new JsonArray());
        }
        if (!result.has("remainders") || !result.get("remainders").isJsonArray()) {
            result.add("remainders", new JsonArray());
        }
        return result;
    }

    // Send the point list as JSON to a specified URL
    public void send(JSONAppender pointList) {
        WebClient client = WebClient.create(vertx);
        String url = "http://localhost:31415/data";

        String jsonPayload = pointList.getJSONString();

        // Send a POST request with the JSON payload to the specified URL
        client.postAbs(url)
                .sendBuffer(Buffer.buffer(jsonPayload), ar -> {
                    if (ar.succeeded()) {
                        HttpResponse<Buffer> response = ar.result();
                        System.out.println("Status Code: " + response.statusCode());
                        System.out.println("Response Body: " + response.bodyAsString());
                    } else {
                        System.out.println("Request failed: " + ar.cause().getMessage());
                    }
                });
    }
}
