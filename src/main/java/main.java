import java.awt.Color;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

public class main {
    private static final int WIDTH = 2000;  // Width of the generated image
    private static final int HEIGHT = 2000; // Height of the generated image

    public static void main(String[] args) {
        int p = 13; // Choose the value of p (e.g., 13)
        int modulus = 3; // Congruence condition mod 3

        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics g = image.getGraphics();

        g.setColor(Color.WHITE);
        g.fillRect(0, 0, WIDTH, HEIGHT);

        int sideLength = Math.min(WIDTH, HEIGHT) - 20;
        int centerX = WIDTH / 2;
        int centerY = HEIGHT / 2;
        int halfSide = sideLength / 2;
        int triangleHeight = (int) (halfSide * Math.sqrt(3));

        for (int i = 0; i < 20000000; i++) {
            int x = centerX + (int) (Math.random() * sideLength) - halfSide;
            int y = centerY + (int) (Math.random() * triangleHeight) - halfSide;

            int value = i % p;
            int colorValue = (value % modulus == 1) ? 255 : 0;

            Color color = new Color(colorValue, colorValue, colorValue);
            g.setColor(color);
            g.fillRect(x, y, 1, 1);
        }

        g.dispose();

        try {
            File output = new File("fractal.png");
            ImageIO.write(image, "png", output);
            System.out.println("Fractal image generated successfully!");
        } catch (IOException e) {
            System.out.println("Error while saving the fractal image.");
            e.printStackTrace();
        }
    }
}
