package math;

public class MathEquations {
    public static float ScaleFactor(int n) {
        float r = 0;

        float sum = 1;
        for (int k = 1 ; k <= n / 4 ; k++) {
            sum += Math.cos((2.0f * Math.PI) / (float)n);
        }

        r = 1.0f / (2.0f * sum);

        return r;
    }
}
