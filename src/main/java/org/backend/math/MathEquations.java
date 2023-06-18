package org.backend.math;

public class MathEquations {
    public static double scaleFactor(int n) {
        if (n == 4) n = 6;
        int floor = n / 4;
        double sum = 0.0;

        for (int k = 1; k <= floor; k++) {
            double angle = (2 * Math.PI * k) / n;
            sum += Math.cos(angle);
        }

        return 1 / (2 * (1 + sum));
    }
}
