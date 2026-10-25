import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProviderVerification from './components/provider/ProviderVerification'; 

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Provider Verification Route */}
        <Route path="/provider/verification" element={<ProviderVerification />} />

        {/* Default Fallback Route */}
        <Route
          path="*"
          element={
            <div style={{ padding: '20px' }}>
              <h1>UI Foundation Showcase</h1>
              <p>
                Navigate to <code>/provider/verification</code> to see the Provider Verification form.
              </p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}