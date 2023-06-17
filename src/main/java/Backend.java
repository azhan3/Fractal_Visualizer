import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import math.*;
import math.book.Algorithm3Adic;
import util.JSONAppender;
import util.PointList;

import java.util.List;

public class Backend extends AbstractVerticle {
    private final Gson gson = new Gson();

    @Override
    public void start(Promise<Void> startPromise) {
        Router router = Router.router(vertx);
        router.route(HttpMethod.POST, "/send-data").handler(this::handlePostData);

        vertx.createHttpServer()
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

        request.bodyHandler(bodyHandler -> {
            String body = bodyHandler.toString();

            if (body != null && !body.isEmpty()) {
                // Process the received data
                System.out.println("Received data: " + body);

                // Create Gson instance

                // Convert JSON string to JsonObject
                JsonObject data = gson.fromJson(body, JsonObject.class);

                // Process the data and perform any necessary operations here
                int n = data.get("nValue").getAsInt();
                int p = data.get("pValue").getAsInt();
                int algo = data.get("Algorithm").getAsInt();
                float l = data.get("lValue").getAsFloat();
                float zoom = data.get("zoom").getAsFloat();
                boolean useRecommendedL = data.get("RecommendL").getAsBoolean();
                JsonObject primeRaces = data.get("PrimeRaces").getAsJsonObject(); // Retrieve as JsonObject instead of JsonArray

                l = useRecommendedL ? (float) MathEquations.scaleFactor((algo == 1 ? p : p-1)) : l;
                n *= zoom;
                List<PointList> pl;

                if (algo == 1) {
                    PAddicRepresenter newPoints = new PAddicRepresenter(p, l, 30);
                    pl = newPoints.transformSample(n ,primeRaces);
                } else {
                    AlgorithmGeneralCase newPoints2 = new AlgorithmGeneralCase(p, l, 30);
                    pl = newPoints2.transformSample(n, primeRaces);
                }

                double[] minmax = pl.get(0).getMinMaxPoints();
                PointList minimum = new PointList();

                minimum.addPoint(minmax[0], minmax[1]);

                PointList maximum = new PointList();

                maximum.addPoint(minmax[2], minmax[3]);

                JSONAppender parentAppender = new JSONAppender();

                parentAppender.addAppender("min", minimum.toJsonAppender());
                parentAppender.addAppender("max", maximum.toJsonAppender());
                parentAppender.addAppender("points", pl.get(0).toJsonAppender());

                JSONAppender PrimeRaces = new JSONAppender();

                for (int i = 1 ; i < pl.size() ; ++i) {
                    PrimeRaces.addAppender(Integer.toString(i), pl.get(i).toJsonAppender());
                }

                parentAppender.addAppender("PrimeRaces", PrimeRaces);
                response.putHeader("Content-Type", "text/plain")
                        .end(parentAppender.getJSONString());
            } else {
                System.out.println("Request body is null or empty");
                response.setStatusCode(400)
                        .end();
            }
        });
    }



    public void send(JSONAppender pointList) {
        WebClient client = WebClient.create(vertx);
        String url = "http://localhost:31415/data";

        String jsonPayload = pointList.getJSONString();

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
