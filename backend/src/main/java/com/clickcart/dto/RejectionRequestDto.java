package com.clickcart.dto;

import java.util.List;

public class RejectionRequestDto {
    private List<String> reasons;
    private String comments;
    private boolean sendEmail;

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public boolean isSendEmail() { return sendEmail; }
    public void setSendEmail(boolean sendEmail) { this.sendEmail = sendEmail; }
}