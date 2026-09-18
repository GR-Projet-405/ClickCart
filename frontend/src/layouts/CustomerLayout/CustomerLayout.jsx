import { Outlet } from "react-router-dom";
import CustomerFooter from "../../components/navigation/CustomerFooter";
import CustomerHeader from "../../components/navigation/CustomerHeader";
import CustomerTopBar from "../../components/navigation/CustomerTopBar";
import "./CustomerLayout.css";

export default function CustomerLayout() {
  return (
    <div className="customer-layout">
      <CustomerTopBar />
      <CustomerHeader />
      <main className="customer-layout__main">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
