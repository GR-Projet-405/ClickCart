// frontend/src/components/Favorites/EmptyState.jsx
import React, { useState } from 'react';
import Toast from '../common/Toast';

export default function EmptyState({ onExplore }) {
  const [toast, setToast] = useState('');

  const handleExplore = () => {
    setToast('Loading available services...');
    onExplore && onExplore();
  };

  return (
    <>
      <div
        style={{
          padding: '60px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '20px 40px',
        }}
      >
        <div style={{ color: '#2563eb', marginBottom: '20px' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
          No saved Services Yet
        </h2>
        <p style={{ color: '#666', marginBottom: '30px', maxWidth: '400px' }}>
          Saved Services and Providers you like to find them Quickly later.
        </p>
        <button
          onClick={handleExplore}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Explore Services
        </button>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}
