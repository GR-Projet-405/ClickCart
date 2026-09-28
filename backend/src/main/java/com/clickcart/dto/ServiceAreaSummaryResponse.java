package com.clickcart.dto;

public class ServiceAreaSummaryResponse {

    private long totalCoverageAreas;
    private long activeLocations;
    private double totalRadiusKm;

    public ServiceAreaSummaryResponse() {
    }

    public ServiceAreaSummaryResponse(long totalCoverageAreas, long activeLocations, double totalRadiusKm) {
        this.totalCoverageAreas = totalCoverageAreas;
        this.activeLocations = activeLocations;
        this.totalRadiusKm = totalRadiusKm;
    }

    public long getTotalCoverageAreas() {
        return totalCoverageAreas;
    }

    public void setTotalCoverageAreas(long totalCoverageAreas) {
        this.totalCoverageAreas = totalCoverageAreas;
    }

    public long getActiveLocations() {
        return activeLocations;
    }

    public void setActiveLocations(long activeLocations) {
        this.activeLocations = activeLocations;
    }

    public double getTotalRadiusKm() {
        return totalRadiusKm;
    }

    public void setTotalRadiusKm(double totalRadiusKm) {
        this.totalRadiusKm = totalRadiusKm;
    }
}
