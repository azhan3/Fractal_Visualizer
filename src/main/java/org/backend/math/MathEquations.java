package org.backend.math;

public class MathEquations {
    // Calculate the scale factor based on the given integer
    public static double scaleFactor(int n) {
        if (n == 4) n = 6;  // Special case adjustment for n=4
        int floor = n / 4;  // Calculate the floor of n/4
        double sum = 0.0;   // Initialize the sum variable

        // Iterate from 1 to the floor value
        for (int k = 1; k <= floor; k++) {
            // Calculate the angle using the formula (2 * π * k) / n
            double angle = (2 * Math.PI * k) / n;

            // Calculate the cosine of the angle and add it to the sum
            sum += Math.cos(angle);
        }

        // Calculate and return the scale factor using the formula 1 / (2 * (1 + sum))
        return 1 / (2 * (1 + sum));
    }
}
