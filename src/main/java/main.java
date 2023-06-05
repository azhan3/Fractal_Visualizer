import com.github.sh0nk.matplotlib4j.PythonExecutionException;
import math.PAddicRepresenter;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;

import java.io.IOException;
import java.util.List;

import static java.lang.Math.max;
import static java.lang.Math.min;

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



        double xmaxa=-10000000, xmini=10000000, ymaxa=-10000000,ymini=10000000;
        for (double i : x) {
            xmaxa = max(xmaxa, i);
            xmini = min(xmini, i);
        }
        for (double i : y) {
            ymaxa = max(ymaxa, i);
            ymini = min(ymini, i);
        }
        List<Double> primeX = point.get(2);
        List<Double> primeY = point.get(3);
        for (int i = 0; i < x.size(); i++) {
            pl.addPoint(x.get(i), y.get(i));
        }
        System.out.println("MAX: " + xmaxa + " " + ymaxa);
        System.out.println("MIN: " + xmini + " " + ymini);


        JSONAppender parentAppender = new JSONAppender();

        JSONAppender cappender = pl.toJsonAppender();
        String jsonString = cappender.toJson();

        parentAppender.addAppender("points", cappender);
        System.out.println(parentAppender.toJson());


        test.send(parentAppender);

    }





}




//System.out.println(xs.toString());
// Plotting code and visualization is not provided in this conversion
// as it requires additional libraries in Java.
// Please refer to Java plotting libraries for visualizing the data.