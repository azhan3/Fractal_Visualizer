package org.backend.util;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import java.util.List;

public class JSONAppender {
    private JsonObject jsonObject;
    private Gson gson;

    public JSONAppender() {
        jsonObject = new JsonObject();
        gson = new Gson();
    }

    public void addString(String key, String value) {
        jsonObject.addProperty(key, value);
    }

    public void addNumber(String key, Number value) {
        jsonObject.addProperty(key, value);
    }

    public void addBoolean(String key, boolean value) {
        jsonObject.addProperty(key, value);
    }

    public void addArray(String key, Object[] values) {
        JsonArray jsonArray = new JsonArray();
        for (Object value : values) {
            jsonArray.add(gson.toJsonTree(value));
        }
        jsonObject.add(key, jsonArray);
    }

    public void addNumberArray(String key, List<? extends Number> values) {
        JsonArray jsonArray = new JsonArray();
        for (Number value : values) {
            jsonArray.add(value);
        }
        jsonObject.add(key, jsonArray);
    }

    public void addNumberArray(String key, double[] values) {
        JsonArray jsonArray = new JsonArray();
        for (double value : values) {
            jsonArray.add(value);
        }
        jsonObject.add(key, jsonArray);
    }

    public void addNumberArray(String key, double[] values, int length) {
        JsonArray jsonArray = new JsonArray();
        int limit = Math.min(length, values.length);
        for (int i = 0; i < limit; i++) {
            jsonArray.add(values[i]);
        }
        jsonObject.add(key, jsonArray);
    }

    public JSONAppender createNestedAppender() {
        return new JSONAppender();
    }

    public void addAppender(String key, JSONAppender appender) {
        jsonObject.add(key, appender.getJsonObject());
    }

    public JsonObject getJsonObject() {
        return jsonObject;
    }

    public String getJSONString() {
        return jsonObject.toString();
    }

    public String toJson() {
        return getJSONString();
    }
}
