package org.backend;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;

public class main extends AbstractVerticle {
    public static void main(String[] args) {
        // Create a Vertx instance
        Vertx vertx = Vertx.vertx();

        // Configure deployment options
        DeploymentOptions options = new DeploymentOptions().setInstances(1);

        // Create an instance of the Backend verticle
        Backend test = new Backend();

        // Deploy the Backend verticle to Vert.x
        vertx.deployVerticle(test, options);
    }
}
