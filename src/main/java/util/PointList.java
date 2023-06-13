package util;

import com.google.gson.JsonObject;
import util.JSONAppender;
import java.util.ArrayList;
import java.util.List;

public class PointList {
    private List<Double> xList;
    private List<Double> yList;

    public PointList() {
        this.xList = new ArrayList<>();
        this.yList = new ArrayList<>();
    }
    
    public double[] getMinMaxPoints() {
        if (isEmpty()) {
            return new double[]{Double.NaN, Double.NaN, Double.NaN, Double.NaN};
        }

        double minX = Double.POSITIVE_INFINITY;
        double maxX = Double.NEGATIVE_INFINITY;
        double minY = Double.POSITIVE_INFINITY;
        double maxY = Double.NEGATIVE_INFINITY;

        for (int i = 0; i < size(); i++) {
            double x = xList.get(i);
            double y = yList.get(i);

            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return new double[]{minX, minY, maxX, maxY};
    }
    
    public void addPoint(double x, double y) {
        xList.add(x);
        yList.add(y);
    }

    public List<Double> getXList() {
        return xList;
    }

    public List<Double> getYList() {
        return yList;
    }

    public boolean isEmpty() {
        return xList.isEmpty() && yList.isEmpty();
    }

    public int size() {
        return xList.size();
    }

    public void clear() {
        xList.clear();
        yList.clear();
    }

    public JSONAppender toJsonAppender() {
        JSONAppender appender = new JSONAppender();
        List<JsonObject> pointsList = new ArrayList<>();

        for (int i = 0; i < xList.size(); i++) {
            JsonObject point = new JsonObject();
            point.addProperty("x", xList.get(i));
            point.addProperty("y", yList.get(i));
            pointsList.add(point);
        }

        appender.addArray("points", pointsList.toArray());
        return appender;
    }

}
