package com.clickcart.model;

public class JobDiagnostic {

    private String title;
    private String detail;

    public JobDiagnostic() {
    }

    public JobDiagnostic(String title, String detail) {
        this.title = title;
        this.detail = detail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }
}
