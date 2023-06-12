package math;

import util.PointList;

public class Algorithm7Adic {
    private int p;
    private double l;
    private int outputLength;

    public Algorithm7Adic(int p, double l, int outputLength) {
        this.p = p;
        this.l = l;
        this.outputLength = outputLength;
    }

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
                real += power / (p - 1);
                imag += power / (p - 1);
            } else if (c == 3) {
                double power = Math.pow(l, k);
                imag += power / (p - 1);
            } else if (c == 4) {
                double power = Math.pow(l, k);
                real -= power / (p - 1);
                imag += power / (p - 1);
            } else if (c == 5) {
                double power = Math.pow(l, k);
                real -= power / (p - 1);
            } else if (c == 6) {
                double power = Math.pow(l, k);
                imag -= power / (p - 1);
            }

            k++;
        }

        return new double[]{real, imag};
    }

    public PointList transformSample(int ns) {
        PointList pointList = new PointList();

        for (int n = 0; n <= ns; ++n) {
            double[] planeCoords = toPlane(n);
            double x = planeCoords[0];
            double y = planeCoords[1];
            pointList.addPoint(x, y);
        }

        return pointList;
    }
}
