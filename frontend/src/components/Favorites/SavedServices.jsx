import { useNavigate } from "react-router-dom";
import { notify } from "../../context/FeedbackHost";
// frontend/src/components/Favorites/SavedServices.jsx
import React, { useState } from 'react';
import { removeFavorite } from '../../services/favoritesApi';
import Toast from '../common/Toast';

export default function SavedServices({ data = [], reload }) {
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
      await removeFavorite('SERVICE', targetId);
      notify(`Removed "${title}" from favorites`, 'success');
      await reload?.();
    } catch (error) { notify(error.message, 'error'); }
    finally { setRemoving(null); }
  };

  return (
    <div style={{ padding: '20px 40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Saved Services ({data.length})</h2>
        <select
          value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {sorted.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'relative',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'var(--cc-bg-surface)' ,
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
              disabled={removing === item.targetId} onClick={() => handleRemove(item.targetId, item.title)}
              title="Remove from favorites"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'var(--cc-bg-surface)' ,
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
              <p style={{ margin: '0 0 10px 0', color: 'var(--cc-text-secondary)', fontSize: '14px' }}>{item.providerName}</p>
              <div style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>★ {item.rating}</span> • {item.price}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigate(`/booking/create?serviceId=${encodeURIComponent(item.targetId)}`)}
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
                  onClick={() => navigate(`/find-services?q=${encodeURIComponent(item.title)}`)}
                  style={{
                    flex: 1,
                    background: 'var(--cc-bg-surface)' ,
                    color: 'var(--cc-text-primary)',
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
