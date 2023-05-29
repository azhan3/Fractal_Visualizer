package math;

import java.util.ArrayList;
import java.util.Arrays;
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

    public double[] toPlane(int n) {
        double l = this.l;
        int p = this.p;
        List<Integer> decomposedInt = completedIntToBase(n);
        System.out.println(decomposedInt);
        double real = 0.0;
        double imag = 0.0;
        for (int i = 0; i < decomposedInt.size(); i++) {
            int c = decomposedInt.get(i);
            double power = Math.pow(l, i);
            double angle = c * 2 * Math.PI / p;

            real += power * Math.cos(angle);
            imag += power * Math.sin(angle);
        }

        System.out.println(real + " " + imag);
        return new double[]{real, imag};
    }

    public List<List<Double>> transformSample(Integer ns) {
        List<Double> xs = new ArrayList<>();
        List<Double> ys = new ArrayList<>();
        List<Double> secondaryXs = new ArrayList<>();
        List<Double> secondaryYs = new ArrayList<>();

        for (int n = 0; n <= ns; ++n) {
            double[] planeCoords = toPlane(n);
            double x = planeCoords[0];
            double y = planeCoords[1];

            // Add points to the primary list
            xs.add(x);
            ys.add(y);

            // Check if the point adheres to the prime race 3x+2
            if ((3 * x + 2) % 1 == 0) {
                // Add the point to the secondary list
                secondaryXs.add(x);
                secondaryYs.add(y);
            }
        }

        return Arrays.asList(xs, ys, secondaryXs, secondaryYs);
    }


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

    private List<Integer> completedIntToBase(int n) {
        List<Integer> decomposedInt = intToBase(n);
        int lengthDiff = outputLength - decomposedInt.size();
        for (int i = 0; i < lengthDiff; i++) {
            decomposedInt.add(0);
        }
        return decomposedInt;
    }
}
