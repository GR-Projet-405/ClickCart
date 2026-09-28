// frontend/src/components/Favorites/SavedProviders.jsx
import React, { useState } from 'react';
import { removeFavorite } from '../../services/favoritesApi';
import Toast from '../common/Toast';

export default function SavedProviders({ data = [], reload }) {
  const [toast, setToast] = useState('');

  const handleRemove = async (targetId, title) => {
    await removeFavorite('PROVIDER', targetId);
    setToast(`Removed "${title}" from favorites`);
    reload && reload();
  };

  return (
    <div style={{ padding: '20px 40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Saved Providers ({data.length})</h2>
        <select
          onChange={(e) => setToast(`Sorted by: ${e.target.value}`)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Rating: High to Low</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {data.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: '20px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              alignItems: 'center',
              background: 'white',
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>{item.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{item.providerName}</p>
              <div style={{ fontSize: '13px', color: '#555' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>★ {item.rating}</span> • {item.price}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '130px' }}>
              <button
                onClick={() => setToast(`Starting booking with "${item.providerName}"...`)}
                style={{
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
                onClick={() => setToast(`Viewing profile of "${item.providerName}"`)}
                style={{
                  background: 'white',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                View Details
              </button>
              <button
                onClick={() => handleRemove(item.targetId, item.title)}
                style={{
                  background: 'white',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
