package math;

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

    public String toJson() {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{\"points\": [");

        for (int i = 0; i < xList.size(); i++) {
            double x = xList.get(i);
            double y = yList.get(i);
            jsonBuilder.append("{\"x\": ").append(x).append(", \"y\": ").append(y).append("}");

            if (i < xList.size() - 1) {
                jsonBuilder.append(",");
            }
        }

        jsonBuilder.append("]}");

        return jsonBuilder.toString();
    }
}

