package com.clickcart.dto;

import com.clickcart.model.ServiceAreaStatus;

public class ServiceAreaStatusRequest {

    private ServiceAreaStatus status;
    private Boolean active;

    public ServiceAreaStatusRequest() {
    }

    public ServiceAreaStatusRequest(ServiceAreaStatus status) {
        this.status = status;
        this.active = status == ServiceAreaStatus.ACTIVE;
    }

    public ServiceAreaStatusRequest(Boolean active) {
        this.active = active;
        this.status = Boolean.TRUE.equals(active) ? ServiceAreaStatus.ACTIVE : ServiceAreaStatus.INACTIVE;
    }

    public ServiceAreaStatus getStatus() {
        if (status != null) {
            return status;
        }
        if (active != null) {
            return active ? ServiceAreaStatus.ACTIVE : ServiceAreaStatus.INACTIVE;
        }
        return ServiceAreaStatus.ACTIVE;
    }

    public void setStatus(ServiceAreaStatus status) {
        this.status = status;
        if (status != null) {
            this.active = status == ServiceAreaStatus.ACTIVE;
        }
    }

    public Boolean getActive() {
        if (active != null) {
            return active;
        }
        return status == ServiceAreaStatus.ACTIVE;
    }

    public void setActive(Boolean active) {
        this.active = active;
        if (active != null) {
            this.status = active ? ServiceAreaStatus.ACTIVE : ServiceAreaStatus.INACTIVE;
        }
    }
}
