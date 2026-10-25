package com.clickcart.dto;

import java.util.List;
import java.util.Map;

/**
 * Response payload for the Settlement Tracking API.
 */
public class SettlementPageResponse {

    private SummaryStats summary;
    private FinanceAuthStates financeAuthStates;
    private CycleTracker cycleTracker;
    private List<SettlementRow> settlements;
    private int total;
    private int page;
    private int pageSize;

    // ---- nested types ----

    public static class SummaryStats {
        private int totalSettlementsCount;
        private double totalSettlementsAmount;
        private int pendingPayoutsCount;
        private double pendingPayoutsAmount;
        private int completedPayoutsCount;
        private double completedPayoutsAmount;
        private int failedPayoutsCount;
        private double failedPayoutsAmount;

        public int getTotalSettlementsCount() { return totalSettlementsCount; }
        public void setTotalSettlementsCount(int totalSettlementsCount) { this.totalSettlementsCount = totalSettlementsCount; }
        public double getTotalSettlementsAmount() { return totalSettlementsAmount; }
        public void setTotalSettlementsAmount(double totalSettlementsAmount) { this.totalSettlementsAmount = totalSettlementsAmount; }
        public int getPendingPayoutsCount() { return pendingPayoutsCount; }
        public void setPendingPayoutsCount(int pendingPayoutsCount) { this.pendingPayoutsCount = pendingPayoutsCount; }
        public double getPendingPayoutsAmount() { return pendingPayoutsAmount; }
        public void setPendingPayoutsAmount(double pendingPayoutsAmount) { this.pendingPayoutsAmount = pendingPayoutsAmount; }
        public int getCompletedPayoutsCount() { return completedPayoutsCount; }
        public void setCompletedPayoutsCount(int completedPayoutsCount) { this.completedPayoutsCount = completedPayoutsCount; }
        public double getCompletedPayoutsAmount() { return completedPayoutsAmount; }
        public void setCompletedPayoutsAmount(double completedPayoutsAmount) { this.completedPayoutsAmount = completedPayoutsAmount; }
        public int getFailedPayoutsCount() { return failedPayoutsCount; }
        public void setFailedPayoutsCount(int failedPayoutsCount) { this.failedPayoutsCount = failedPayoutsCount; }
        public double getFailedPayoutsAmount() { return failedPayoutsAmount; }
        public void setFailedPayoutsAmount(double failedPayoutsAmount) { this.failedPayoutsAmount = failedPayoutsAmount; }
    }

    public static class FinanceAuthStates {
        private int authorized;
        private int captured;
        private int settled;
        private int released;
        private int onHold;
        private int disputed;

        public int getAuthorized() { return authorized; }
        public void setAuthorized(int authorized) { this.authorized = authorized; }
        public int getCaptured() { return captured; }
        public void setCaptured(int captured) { this.captured = captured; }
        public int getSettled() { return settled; }
        public void setSettled(int settled) { this.settled = settled; }
        public int getReleased() { return released; }
        public void setReleased(int released) { this.released = released; }
        public int getOnHold() { return onHold; }
        public void setOnHold(int onHold) { this.onHold = onHold; }
        public int getDisputed() { return disputed; }
        public void setDisputed(int disputed) { this.disputed = disputed; }
    }

    public static class CycleTracker {
        private String currentStage;   // T+0 | T+1 | T+2 | T+3
        private int progressPercent;
        private String cycleFinishesIn;
        private List<CycleStep> steps;

        public String getCurrentStage() { return currentStage; }
        public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
        public int getProgressPercent() { return progressPercent; }
        public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }
        public String getCycleFinishesIn() { return cycleFinishesIn; }
        public void setCycleFinishesIn(String cycleFinishesIn) { this.cycleFinishesIn = cycleFinishesIn; }
        public List<CycleStep> getSteps() { return steps; }
        public void setSteps(List<CycleStep> steps) { this.steps = steps; }
    }

    public static class CycleStep {
        private String label;
        private String status;   // completed | in-progress | pending
        private String time;

        public CycleStep() {}
        public CycleStep(String label, String status, String time) {
            this.label = label; this.status = status; this.time = time;
        }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
    }

    public static class SettlementRow {
        private String id;
        private String merchantRecipient;
        private double amount;
        private double fee;
        private double netAmount;
        private String captureDate;
        private String settlementDate;
        private String payoutMethod;
        private String financeState;

        public SettlementRow() {}
        public SettlementRow(String id, String merchantRecipient, double amount, double fee,
                             double netAmount, String captureDate, String settlementDate,
                             String payoutMethod, String financeState) {
            this.id = id;
            this.merchantRecipient = merchantRecipient;
            this.amount = amount;
            this.fee = fee;
            this.netAmount = netAmount;
            this.captureDate = captureDate;
            this.settlementDate = settlementDate;
            this.payoutMethod = payoutMethod;
            this.financeState = financeState;
        }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getMerchantRecipient() { return merchantRecipient; }
        public void setMerchantRecipient(String m) { this.merchantRecipient = m; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public double getFee() { return fee; }
        public void setFee(double fee) { this.fee = fee; }
        public double getNetAmount() { return netAmount; }
        public void setNetAmount(double netAmount) { this.netAmount = netAmount; }
        public String getCaptureDate() { return captureDate; }
        public void setCaptureDate(String captureDate) { this.captureDate = captureDate; }
        public String getSettlementDate() { return settlementDate; }
        public void setSettlementDate(String settlementDate) { this.settlementDate = settlementDate; }
        public String getPayoutMethod() { return payoutMethod; }
        public void setPayoutMethod(String payoutMethod) { this.payoutMethod = payoutMethod; }
        public String getFinanceState() { return financeState; }
        public void setFinanceState(String financeState) { this.financeState = financeState; }
    }

    // ---- root getters/setters ----

    public SummaryStats getSummary() { return summary; }
    public void setSummary(SummaryStats summary) { this.summary = summary; }
    public FinanceAuthStates getFinanceAuthStates() { return financeAuthStates; }
    public void setFinanceAuthStates(FinanceAuthStates financeAuthStates) { this.financeAuthStates = financeAuthStates; }
    public CycleTracker getCycleTracker() { return cycleTracker; }
    public void setCycleTracker(CycleTracker cycleTracker) { this.cycleTracker = cycleTracker; }
    public List<SettlementRow> getSettlements() { return settlements; }
    public void setSettlements(List<SettlementRow> settlements) { this.settlements = settlements; }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
