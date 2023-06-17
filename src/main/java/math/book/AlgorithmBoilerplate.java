package math.book;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import util.PointList;

import java.util.ArrayList;
import java.util.List;

public abstract class AlgorithmBoilerplate {
    protected int p;
    protected double l;
    protected int outputLength;

    public AlgorithmBoilerplate(int p, double l, int outputLength) {
        this.p = p;
        this.l = l;
        this.outputLength = outputLength;
    }

    public abstract double[] toPlane(int n);

    public List<PointList> transformSample(Integer ns, JsonObject primeRaces) {
        JsonArray primes = primeRaces.get("primes").getAsJsonArray();
        JsonArray remainders = primeRaces.get("remainders").getAsJsonArray();
        int num = primes.size();

        List<PointList>pointList = new ArrayList<PointList>(num+1);
        for (int i = 0 ; i <= num ; ++i) {
            pointList.add(new PointList());
        }
        for (int n = 0; n <= ns; ++n) {
            double[] planeCoords = toPlane(n);
            double x = planeCoords[0];
            double y = planeCoords[1];

            // Add points to the primary PointList
            pointList.get(0).addPoint(x, y);

            for (int j = 0; j < num ; ++j) {
                if (n % primes.get(j).getAsInt() == remainders.get(j).getAsInt()) {
                    pointList.get(j+1).addPoint(x, y);
                }
            }
        }


        return pointList;
    }

}

