package org.backend.math;

import org.backend.math.book.AlgorithmBoilerplate;

public class AlgorithmGeneralCase extends AlgorithmBoilerplate {
    public AlgorithmGeneralCase(int p, double l, int outputLength) {
        super(p, l, outputLength);
    }

    // Convert an integer to plane coordinates
    @Override
    public double[] toPlane(int n) {
        double[] coords = new double[2];
        toPlaneInto(n, coords);
        return coords;
    }

    @Override
    public void toPlaneInto(int n, double[] out) {
        int p = this.p;
        double l = this.l;
        int outputLength = this.outputLength;

        if (n == 0) {
            out[0] = 1.0;
            out[1] = 0.0;
            return;
        }

        double real = 0.0;
        double imag = 0.0;
        int k = 0;
        double power = 1.0;

        while (n > 0 && k < outputLength) {
            int c = n % p;
            n = n / p;

            if (c != 0) {
                // Calculate angle and power based on the prime base and level
                double angle = Math.toRadians((c - 1) * 360.0 / (p - 1));
                double x = Math.cos(angle) * power;
                double y = Math.sin(angle) * power;

                real += x;
                imag += y;
            }

            power *= l;
            k++;
        }

        out[0] = real;
        out[1] = imag;
    }
}
