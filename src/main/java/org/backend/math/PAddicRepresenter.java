package org.backend.math;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.backend.util.PointList;

import java.util.ArrayList;
import java.util.List;

public class PAddicRepresenter {
    private int p;
    private double l;
    private int outputLength;

    public PAddicRepresenter(int p, double l, int outputLength) {
        this.p = p;
        this.l = l;
        this.outputLength = outputLength;
    }

    // Convert an integer to plane coordinates
    public double[] toPlane(int n) {
        double[] coords = new double[2];
        toPlane(n, coords);
        return coords;
    }

    public void toPlane(int n, double[] out) {
        double l = this.l;
        int p = this.p;
        double angleStep = 2 * Math.PI / p;
        double power = 1.0;

        double real = 0.0;
        double imag = 0.0;

        for (int i = 0; i < outputLength; i++) {
            int c = n % p;
            n = n / p;
            if (c != 0) {
                double angle = c * angleStep;
                real += power * Math.cos(angle);
                imag += power * Math.sin(angle);
            }
            power *= l;
        }

        out[0] = real;
        out[1] = imag;
    }

    // Transform a sample based on prime races
    public List<PointList> transformSample(Integer ns, JsonObject primeRaces) {
        JsonArray primes = primeRaces.get("primes").getAsJsonArray();
        JsonArray remainders = primeRaces.get("remainders").getAsJsonArray();
        int num = primes.size();

        List<PointList> pointList = new ArrayList<PointList>(num + 1);

        int primaryCapacity = Math.max(0, ns) + 1;
        pointList.add(new PointList(primaryCapacity));

        // Initialize each PointList in the list
        for (int i = 0; i < num; ++i) {
            pointList.add(new PointList());
        }

        double[] planeCoords = new double[2];

        // Iterate over each integer from 0 to ns
        for (int n = 0; n <= ns; ++n) {
            toPlane(n, planeCoords);
            double x = planeCoords[0];
            double y = planeCoords[1];

            // Add points to the primary PointList
            pointList.get(0).addPoint(x, y);

            // Check if the integer satisfies the prime remainder conditions
            for (int j = 0; j < num; ++j) {
                if (n % primes.get(j).getAsInt() == remainders.get(j).getAsInt()) {
                    // Add points to the corresponding PointList
                    pointList.get(j + 1).addPoint(x, y);
                }
            }
        }

        return pointList;
    }

    // Convert an integer to its base-p representation
    private List<Integer> intToBase(int n) {
        int p = this.p;
        List<Integer> decomposition = new ArrayList<>();
        while (n > 0) {
            int residual = n % p;
            n = (n - residual) / p;
            decomposition.add(residual);
        }
        return decomposition;
    }

    // Convert an integer to its completed base-p representation
    private List<Integer> completedIntToBase(int n) {
        List<Integer> decomposedInt = intToBase(n);
        int lengthDiff = outputLength - decomposedInt.size();
        for (int i = 0; i < lengthDiff; i++) {
            decomposedInt.add(0);
        }
        return decomposedInt;
    }
}
