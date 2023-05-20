import com.github.sh0nk.matplotlib4j.Plot;
import com.github.sh0nk.matplotlib4j.PythonExecutionException;
import math.PAddicRepresenter;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;

public class main extends AbstractVerticle {

    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        DeploymentOptions options = new DeploymentOptions().setInstances(1);
        vertx.deployVerticle(new backend(), options);
    }

}

//        int nPoints = (int) Math.pow(3, 10);
//        int p = 3;
//        int smallSampleSize = 200;
//        double l = 0.45;
//
//        PAddicRepresenter par = new PAddicRepresenter(p, l, 30);
//
//
//        List<List<Double>> point = par.transformSample(nPoints);
//        List<Double>x = point.get(0);
//        List<Double>y = point.get(1);
//
//
//        Plot plt = Plot.create();
//        plt.plot().add(x, y, "o");
//
//        plt.legend().loc("upper right");
//        plt.title("scatter");
//        plt.show();


//System.out.println(xs.toString());
// Plotting code and visualization is not provided in this conversion
// as it requires additional libraries in Java.
// Please refer to Java plotting libraries for visualizing the data.