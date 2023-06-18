package org.backend.math.book;

public class Algorithm5Adic extends AlgorithmBoilerplate {
    public Algorithm5Adic(int p, double l, int outputLength) {
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

            if (c == 1) {
                double power = Math.pow(l, k);
                real += power / (p - 1);
            } else if (c == 2) {
                double power = Math.pow(l, k);
                imag += power / (p - 1);
            } else if (c == 3) {
                double power = Math.pow(l, k);
                real -= power / (p - 1);
            } else if (c == 4) {
                double power = Math.pow(l, k);
                imag -= power / (p - 1);
            }

            k++;
        }

        return new double[]{real, imag};
    }
}
