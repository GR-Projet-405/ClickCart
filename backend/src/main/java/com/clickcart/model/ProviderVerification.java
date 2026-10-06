package com.clickcart.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "provider_verifications")
public class ProviderVerification {

    @Id
    private String id;
    private String userId;
    private String accountType;
    private String fullName;
    private String nicNumber;
    private String personalAddress;
    private String contactNumber;

    // Business Details Fields
    private String businessName;
    private String brnNumber;
    private String businessAddress;
    private String businessContactNumber;

    private String status; 
    private Instant createdAt;
    private Instant updatedAt;
    private List<DocumentItem> documents;

    public ProviderVerification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }

    public String getPersonalAddress() { return personalAddress; }
    public void setPersonalAddress(String personalAddress) { this.personalAddress = personalAddress; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getBrnNumber() { return brnNumber; }
    public void setBrnNumber(String brnNumber) { this.brnNumber = brnNumber; }

    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }

    public String getBusinessContactNumber() { return businessContactNumber; }
    public void setBusinessContactNumber(String businessContactNumber) { this.businessContactNumber = businessContactNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<DocumentItem> getDocuments() { return documents; }
    public void setDocuments(List<DocumentItem> documents) { this.documents = documents; }

    public static class DocumentItem {
        private String type;
        private String url;

        public DocumentItem() {}

        public DocumentItem(String type, String url) {
            this.type = type;
            this.url = url;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}