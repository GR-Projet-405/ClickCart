import { useNavigate } from "react-router-dom";
import { notify } from "../../context/FeedbackHost";
// frontend/src/components/Favorites/SavedProviders.jsx
import React, { useState } from 'react';
import { removeFavorite } from '../../services/favoritesApi';
import Toast from '../common/Toast';

export default function SavedProviders({ data = [], reload }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [sort, setSort] = useState('Newest First');
  const [removing, setRemoving] = useState(null);
  const sorted = [...data].sort((a,b) => {
    if (sort === 'Oldest First') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'Rating: High to Low') return (b.rating || 0) - (a.rating || 0);
    if (sort.startsWith('Price:')) { const price = item => Number((item.price || '').replace(/[^0-9.]/g, '')); return (price(a)-price(b)) * (sort === 'Price: Low to High' ? 1 : -1); }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleRemove = async (targetId, title) => {
    setRemoving(targetId);
    try {
      await removeFavorite('PROVIDER', targetId);
      notify(`Removed "${title}" from favorites`, 'success');
      await reload?.();
    } catch (error) { notify(error.message, 'error'); }
    finally { setRemoving(null); }
  };

  return (
    <div style={{ padding: '20px 40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Saved Providers ({data.length})</h2>
        <select
          value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Rating: High to Low</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sorted.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: '20px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              alignItems: 'center',
              background: 'var(--cc-bg-surface)' ,
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>{item.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: 'var(--cc-text-secondary)', fontSize: '14px' }}>{item.providerName}</p>
              <div style={{ fontSize: '13px', color: '#555' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>★ {item.rating}</span> • {item.price}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '130px' }}>
              <button
                onClick={() => navigate(`/booking/create?providerId=${encodeURIComponent(item.targetId)}`)}
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
                onClick={() => navigate(`/providers/${encodeURIComponent(item.targetId)}`)}
                style={{
                  background: 'var(--cc-bg-surface)' ,
                  color: 'var(--cc-text-primary)',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                View Details
              </button>
              <button
                disabled={removing === item.targetId} onClick={() => handleRemove(item.targetId, item.title)}
                style={{
                  background: 'var(--cc-bg-surface)' ,
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
