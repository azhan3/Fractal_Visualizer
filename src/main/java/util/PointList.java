package util;

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
        appender.addArray("xList", xList.toArray());
        appender.addArray("yList", yList.toArray());
        return appender;
    }
}
