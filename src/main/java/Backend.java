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
import io.vertx.ext.web.client.WebClient;

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
    public void send() {
        WebClient client = WebClient.create(vertx);
        JsonObject json = new JsonObject().put("key", "value");
        System.out.println(json.toString());
        client.post(3000, "localhost", "/data")
        .sendJsonObject(json, ar -> {
            if (ar.succeeded()) {
                System.out.println("YAY");
            } else {
                System.out.println("ERR");
            }
        });
    }

}
