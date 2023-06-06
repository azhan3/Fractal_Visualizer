package util;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

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
