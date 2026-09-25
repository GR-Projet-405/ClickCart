package com.clickcart.dto;

public class StatusUpdateRequest {

    private String status;   // APPROVED | REJECTED | COMPLETED

    public String getStatus()         { return status; }
    public void   setStatus(String v) { this.status = v; }
}
