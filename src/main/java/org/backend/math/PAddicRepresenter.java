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
        double l = this.l;
        int p = this.p;
        List<Integer> decomposedInt = completedIntToBase(n);

        double real = 0.0;
        double imag = 0.0;
        for (int i = 0; i < decomposedInt.size(); i++) {
            int c = decomposedInt.get(i);
            double power = Math.pow(l, i);
            double angle = c * 2 * Math.PI / p;

            real += power * Math.cos(angle);
            imag += power * Math.sin(angle);
        }

        return new double[]{real, imag};
    }

    // Transform a sample based on prime races
    public List<PointList> transformSample(Integer ns, JsonObject primeRaces) {
        PointList secondaryPointList = new PointList();
        JsonArray primes = primeRaces.get("primes").getAsJsonArray();
        JsonArray remainders = primeRaces.get("remainders").getAsJsonArray();
        int num = primes.size();

        List<PointList> pointList = new ArrayList<PointList>(num + 1);

        // Initialize each PointList in the list
        for (int i = 0; i <= num; ++i) {
            pointList.add(new PointList());
        }

        // Iterate over each integer from 0 to ns
        for (int n = 0; n <= ns; ++n) {
            double[] planeCoords = toPlane(n);
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
