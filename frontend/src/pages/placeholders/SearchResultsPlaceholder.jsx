import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchResultsPlaceholder() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <button 
        onClick={() => navigate('/find-services/map')}
        style={{ 
          background: '#1ABA1A', color: 'white', border: 'none', borderRadius: '8px', 
          padding: '12px 24px', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
        Open Map View
      </button>
    </div>
  );
}
