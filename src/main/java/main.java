import com.github.sh0nk.matplotlib4j.PythonExecutionException;
import math.PAddicRepresenter;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import util.PointList;

import java.io.IOException;

import static java.lang.Math.max;
import static java.lang.Math.min;

public class main extends AbstractVerticle {

    public static void main(String[] args) throws PythonExecutionException, IOException {
        System.out.println("TEST");
        Vertx vertx = Vertx.vertx();
        DeploymentOptions options = new DeploymentOptions().setInstances(1);
        Backend test = new Backend();
        vertx.deployVerticle(test, options);


//        System.out.println(parentAppender.toJson());
//
//
//        test.send(parentAppender);

    }
}




//System.out.println(xs.toString());
// Plotting code and visualization is not provided in this conversion
// as it requires additional libraries in Java.
// Please refer to Java plotting libraries for visualizing the data.