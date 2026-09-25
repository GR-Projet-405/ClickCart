import PageContainer from "../../../components/common/PageContainer";
import "./BookingApprovalPage.css";

export default function BookingApprovalPage() {
  return (
    <PageContainer className="booking-approval">
      <header className="booking-approval__header">
        <h1>Booking Approval</h1>
        <p>Manage incoming client requests and service schedules</p>
      </header>
    </PageContainer>
  );
}