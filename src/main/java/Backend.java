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

import math.PAddicRepresenter;
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
                float l = data.get("lValue").getAsFloat();
                PAddicRepresenter newPoints = new PAddicRepresenter(p, l, 30);
                PointList pl =  newPoints.transformSample(n);
                double[] minmax = pl.getMinMaxPoints();
                PointList minimum = new PointList();

                minimum.addPoint(minmax[0], minmax[1]);

                PointList maximum = new PointList();

                maximum.addPoint(minmax[2], minmax[3]);

                JSONAppender parentAppender = new JSONAppender();

                parentAppender.addAppender("min", minimum.toJsonAppender());
                parentAppender.addAppender("max", maximum.toJsonAppender());
                parentAppender.addAppender("points", pl.toJsonAppender());
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
