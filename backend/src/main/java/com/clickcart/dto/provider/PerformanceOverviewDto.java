package com.clickcart.dto.provider;

import java.util.List;
import java.util.Map;

public class PerformanceOverviewDto {

    public static class MetricSeries {
        private List<String> yAxis;
        private double max;
        private List<String> labels;
        private List<Double> values;
        private String unit;

        public MetricSeries() {}
        public MetricSeries(List<String> yAxis, double max, List<String> labels, List<Double> values, String unit) {
            this.yAxis = yAxis;
            this.max = max;
            this.labels = labels;
            this.values = values;
            this.unit = unit;
        }

        public List<String> getyAxis() { return yAxis; }
        public void setyAxis(List<String> yAxis) { this.yAxis = yAxis; }
        public double getMax() { return max; }
        public void setMax(double max) { this.max = max; }
        public List<String> getLabels() { return labels; }
        public void setLabels(List<String> labels) { this.labels = labels; }
        public List<Double> getValues() { return values; }
        public void setValues(List<Double> values) { this.values = values; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
    }

    private String note;
    private Map<String, Map<String, MetricSeries>> chartData;

    public PerformanceOverviewDto() {}

    public PerformanceOverviewDto(String note, Map<String, Map<String, MetricSeries>> chartData) {
        this.note = note;
        this.chartData = chartData;
    }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Map<String, Map<String, MetricSeries>> getChartData() { return chartData; }
    public void setChartData(Map<String, Map<String, MetricSeries>> chartData) { this.chartData = chartData; }
}
