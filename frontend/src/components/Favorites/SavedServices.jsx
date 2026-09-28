// frontend/src/components/Favorites/SavedServices.jsx
import React, { useState } from 'react';
import { removeFavorite } from '../../services/favoritesApi';
import Toast from '../common/Toast';

export default function SavedServices({ data = [], reload }) {
  const [toast, setToast] = useState('');

  const handleRemove = async (targetId, title) => {
    await removeFavorite('SERVICE', targetId);
    setToast(`Removed "${title}" from favorites`);
    reload && reload();
  };

  return (
    <div style={{ padding: '20px 40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Saved Services ({data.length})</h2>
        <select
          onChange={(e) => setToast(`Sorted by: ${e.target.value}`)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {data.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'relative',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            />

            <button
              onClick={() => handleRemove(item.targetId, item.title)}
              title="Remove from favorites"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              ❤️
            </button>

            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>{item.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{item.providerName}</p>
              <div style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>★ {item.rating}</span> • {item.price}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setToast(`Starting booking for "${item.title}"...`)}
                  style={{
                    flex: 1,
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Book Now
                </button>
                <button
                  onClick={() => setToast(`Viewing details of "${item.title}"`)}
                  style={{
                    flex: 1,
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ccc',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
