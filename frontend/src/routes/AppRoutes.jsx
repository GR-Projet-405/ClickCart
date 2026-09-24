import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import ProviderDetails from "../pages/ProviderDetails";
import ServiceDetails from "../pages/ServiceDetails";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/provider/:id" element={<ProviderDetails />} />
      <Route path="/service/:id" element={<ServiceDetails />} />
    </Routes>
  );
}