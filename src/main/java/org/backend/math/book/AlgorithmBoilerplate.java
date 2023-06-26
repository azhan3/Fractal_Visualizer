package org.backend.math.book;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.backend.util.PointList;

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

    // Abstract method to convert an integer to plane coordinates
    public abstract double[] toPlane(int n);

    // Transforms a sample based on prime races
    public List<PointList> transformSample(Integer ns, JsonObject primeRaces) {
        // Extract the primes and remainders from the JSON object
        JsonArray primes = primeRaces.get("primes").getAsJsonArray();
        JsonArray remainders = primeRaces.get("remainders").getAsJsonArray();
        int num = primes.size();

        // Create a list of PointLists to store the transformed points
        List<PointList> pointList = new ArrayList<PointList>(num + 1);

        // Initialize each PointList in the list
        for (int i = 0; i <= num; ++i) {
            pointList.add(new PointList());
        }

        // Iterate over each integer from 0 to ns
        for (int n = 0; n <= ns; ++n) {
            // Convert the integer to plane coordinates
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

        // Return the list of transformed PointLists
        return pointList;
    }
}
