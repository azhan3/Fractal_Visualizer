package org.backend.util;

import com.google.gson.JsonObject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PointList {
    private double[] xList;
    private double[] yList;
    private int size;

    public PointList() {
        this(16);
    }

    public PointList(int capacity) {
        int safeCapacity = Math.max(1, capacity);
        this.xList = new double[safeCapacity];
        this.yList = new double[safeCapacity];
        this.size = 0;
    }
    
    public double[] getMinMaxPoints() {
        if (isEmpty()) {
            return new double[]{Double.NaN, Double.NaN, Double.NaN, Double.NaN};
        }

        double minX = Double.POSITIVE_INFINITY;
        double maxX = Double.NEGATIVE_INFINITY;
        double minY = Double.POSITIVE_INFINITY;
        double maxY = Double.NEGATIVE_INFINITY;

        for (int i = 0; i < size; i++) {
            double x = xList[i];
            double y = yList[i];

            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return new double[]{minX, minY, maxX, maxY};
    }
    
    public void addPoint(double x, double y) {
        ensureCapacity(size + 1);
        xList[size] = x;
        yList[size] = y;
        size++;
    }

    public List<Double> getXList() {
        List<Double> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            list.add(xList[i]);
        }
        return list;
    }

    public List<Double> getYList() {
        List<Double> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            list.add(yList[i]);
        }
        return list;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public int size() {
        return size;
    }

    public void clear() {
        size = 0;
    }

    public JSONAppender toJsonAppender() {
        JSONAppender appender = new JSONAppender();
        List<JsonObject> pointsList = new ArrayList<>();

        for (int i = 0; i < size; i++) {
            JsonObject point = new JsonObject();
            point.addProperty("x", xList[i]);
            point.addProperty("y", yList[i]);
            pointsList.add(point);
        }

        appender.addArray("points", pointsList.toArray());
        return appender;
    }

    public JSONAppender toJsonAppenderFlat() {
        JSONAppender appender = new JSONAppender();
        appender.addNumberArray("x", xList, size);
        appender.addNumberArray("y", yList, size);
        return appender;
    }

    private void ensureCapacity(int capacity) {
        if (capacity <= xList.length) {
            return;
        }
        int nextCapacity = Math.max(capacity, xList.length * 2);
        xList = Arrays.copyOf(xList, nextCapacity);
        yList = Arrays.copyOf(yList, nextCapacity);
    }

}
