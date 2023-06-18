package org.backend.math.book;

public class Algorithm7Adic extends AlgorithmBoilerplate {
    public Algorithm7Adic(int p, double l, int outputLength) {
        super(p, l, outputLength);
    }

    @Override
    public double[] toPlane(int n) {
        int p = this.p;
        double l = this.l;
        int outputLength = this.outputLength;

        double real = 0.0;
        double imag = 0.0;
        int k = 0;

        while (n > 0) {
            int c = n % p;
            n = n / p;

            if (c == 0) {
                real += 1.0;  // Center point
            } else {
                double angle = Math.toRadians((c - 1) * 360.0 / (p - 1));
                double power = Math.pow(l, k);
                double x = Math.cos(angle) * power;
                double y = Math.sin(angle) * power;

                real += x;
                imag += y;
            }

            k++;
        }

        return new double[]{real, imag};
    }
}
