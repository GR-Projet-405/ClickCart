package com.clickcart.service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class LocationLookupService {

    public record LocationCoordinate(double latitude, double longitude, String defaultDistrict, String defaultPostalCode) {}

    private static final Map<String, LocationCoordinate> PRESET_LOCATIONS = new LinkedHashMap<>();
    private static final List<String> SUPPORTED_DISTRICTS = List.of(
            "Western Province",
            "Central Province",
            "Southern Province",
            "Northern Province",
            "Eastern Province",
            "North Western Province",
            "North Central Province",
            "Uva Province",
            "Sabaragamuwa Province",
            "Colombo",
            "Gampaha",
            "Kalutara",
            "Kandy",
            "Matale",
            "Nuwara Eliya",
            "Galle",
            "Matara",
            "Hambantota",
            "Jaffna",
            "Kilinochchi",
            "Mannar",
            "Vavuniya",
            "Mullaitivu",
            "Batticaloa",
            "Ampara",
            "Trincomalee",
            "Kurunegala",
            "Puttalam",
            "Anuradhapura",
            "Polonnaruwa",
            "Badulla",
            "Monaragala",
            "Ratnapura",
            "Kegalle"
    );

    static {
        PRESET_LOCATIONS.put("colombo", new LocationCoordinate(6.9271, 79.8612, "Western Province", "00100"));
        PRESET_LOCATIONS.put("maharagama", new LocationCoordinate(6.8480, 79.9265, "Western Province", "10280"));
        PRESET_LOCATIONS.put("kandy", new LocationCoordinate(7.2906, 80.6337, "Central Province", "20000"));
        PRESET_LOCATIONS.put("gampaha", new LocationCoordinate(7.0840, 79.9939, "Western Province", "13100"));
        PRESET_LOCATIONS.put("negombo", new LocationCoordinate(7.2008, 79.8736, "Western Province", "11500"));
        PRESET_LOCATIONS.put("matara", new LocationCoordinate(5.9549, 80.5550, "Southern Province", "81000"));
        PRESET_LOCATIONS.put("galle", new LocationCoordinate(6.0535, 80.2210, "Southern Province", "80000"));
        PRESET_LOCATIONS.put("jaffna", new LocationCoordinate(9.6615, 80.0255, "Northern Province", "40000"));
        PRESET_LOCATIONS.put("dehiwala", new LocationCoordinate(6.8344, 79.8705, "Western Province", "10350"));
        PRESET_LOCATIONS.put("battaramulla", new LocationCoordinate(6.8997, 79.9221, "Western Province", "10120"));
        PRESET_LOCATIONS.put("nugegoda", new LocationCoordinate(6.8724, 79.8997, "Western Province", "10250"));
        PRESET_LOCATIONS.put("moratuwa", new LocationCoordinate(6.7730, 79.8816, "Western Province", "10400"));
        PRESET_LOCATIONS.put("kurunegala", new LocationCoordinate(7.4863, 80.3623, "North Western Province", "60000"));
        PRESET_LOCATIONS.put("anuradhapura", new LocationCoordinate(8.3114, 80.4037, "North Central Province", "50000"));
        PRESET_LOCATIONS.put("ratnapura", new LocationCoordinate(6.6828, 80.4034, "Sabaragamuwa Province", "70000"));
        PRESET_LOCATIONS.put("badulla", new LocationCoordinate(6.9895, 81.0557, "Uva Province", "90000"));
        PRESET_LOCATIONS.put("trincomalee", new LocationCoordinate(8.5874, 81.2152, "Eastern Province", "31000"));
    }

    public List<String> getSupportedDistricts() {
        return SUPPORTED_DISTRICTS;
    }

    public Map<String, LocationCoordinate> getPresetLocations() {
        return Collections.unmodifiableMap(PRESET_LOCATIONS);
    }

    public LocationCoordinate resolveCoordinates(String cityName, String district) {
        if (cityName != null) {
            String key = cityName.trim().toLowerCase(Locale.ROOT);
            if (PRESET_LOCATIONS.containsKey(key)) {
                return PRESET_LOCATIONS.get(key);
            }
            for (Map.Entry<String, LocationCoordinate> entry : PRESET_LOCATIONS.entrySet()) {
                if (key.contains(entry.getKey()) || entry.getKey().contains(key)) {
                    return entry.getValue();
                }
            }
        }
        // Fallback to Colombo center coordinates
        return new LocationCoordinate(6.9271, 79.8612, district != null ? district : "Western Province", "");
    }
}
