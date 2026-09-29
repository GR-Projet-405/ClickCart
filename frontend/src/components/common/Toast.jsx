// frontend/src/components/common/Toast.jsx
import React, { useEffect, useState } from 'react';

export default function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out transition
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#111827',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}
