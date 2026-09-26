package com.clickcart.dto.provider;

public class ScheduleItemDto {
    private String id;
    private String time;
    private String service;
    private String customer;
    private String location;
    private String status;

    public ScheduleItemDto() {}

    public ScheduleItemDto(String id, String time, String service, String customer, String location, String status) {
        this.id = id;
        this.time = time;
        this.service = service;
        this.customer = customer;
        this.location = location;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
