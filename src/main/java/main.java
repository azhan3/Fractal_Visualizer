import com.github.sh0nk.matplotlib4j.Plot;
import com.github.sh0nk.matplotlib4j.PythonExecutionException;
import math.PAddicRepresenter;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import math.PointList;

import java.io.IOException;
import java.util.List;

public class main extends AbstractVerticle {

    public static void main(String[] args) throws PythonExecutionException, IOException {
        System.out.println("TEST");
        Vertx vertx = Vertx.vertx();
        DeploymentOptions options = new DeploymentOptions().setInstances(1);
        Backend test = new Backend();
        vertx.deployVerticle(test, options);

        PointList pointList = new PointList();
        pointList.addPoint(0.0, 0.0);
        pointList.addPoint(1.0, 1.0);




        int nPoints = (int) Math.pow(2, 10);
        int p = 3;
        int smallSampleSize = 200;
        double l = 0.45;

        PAddicRepresenter par = new PAddicRepresenter(p, l, 30);
        PointList pl = new PointList();

        List<List<Double>> point = par.transformSample(nPoints);
        List<Double> x = point.get(0);
        List<Double> y = point.get(1);
        List<Double> primeX = point.get(2);
        List<Double> primeY = point.get(3);
        for (int i = 0; i < x.size(); i++) {
            pl.addPoint(x.get(i), y.get(i));
        }

        test.send(pl);

    }





}




//System.out.println(xs.toString());
// Plotting code and visualization is not provided in this conversion
// as it requires additional libraries in Java.
// Please refer to Java plotting libraries for visualizing the data.