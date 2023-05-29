import io.vertx.core.AbstractVerticle;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpClientRequest;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import math.PointList;

public class Backend extends AbstractVerticle {

    @Override
    public void start(Promise<Void> startPromise) {
        vertx.createHttpServer().requestHandler(req -> {
            if ("/send-data".equals(req.path()) && HttpMethod.POST.equals(req.method())) {
                req.bodyHandler(body -> {
                    String receivedData = body.toString();
                    // Process the received data

                    // Send a response back to the client
                    req.response()
                            .putHeader("content-type", "text/plain")
                            .end("Data received successfully");
                });
            } else {
                req.response().setStatusCode(404).end();
            }
        }).listen(8888, http -> {
            if (http.succeeded()) {
                startPromise.complete();
                System.out.println("HTTP server started on port 8888");
            } else {
                startPromise.fail(http.cause());
            }
        });


    }
    public void send(PointList pointList) {
        WebClient client = WebClient.create(vertx);
        String url = "http://localhost:31415/data";

        String jsonPayload = pointList.toJson();

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
