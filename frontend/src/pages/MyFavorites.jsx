import React, { useState, useEffect } from 'react';
import SavedServices from '../components/Favorites/SavedServices';
import SavedProviders from '../components/Favorites/SavedProviders';
import EmptyState from '../components/Favorites/EmptyState';
import { getFavorites } from '../services/favoritesApi';

export default function MyFavorites() {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFavorites();

      setServices(
        data.filter(f => (f.targetType || '').toUpperCase() === 'SERVICE')
          .map(f => ({
            id: f.id,
            targetId: f.targetId,
            ...f,
          }))
      );
      setProviders(
        data.filter(f => (f.targetType || '').toUpperCase() === 'PROVIDER')
          .map(f => ({
            id: f.id,
            targetId: f.targetId,
            ...f,
          }))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p style={{ padding: '40px', textAlign: 'center' }}>Loading...</p>;
  if (error) return <p style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</p>;

  const current = activeTab === 'services' ? services : providers;

  return (
    <div style={{ fontFamily: 'sans-serif', paddingTop: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>My Favorites</h1>
        <p style={{ color: '#666', margin: 0 }}>Your saved services and providers, all in one place.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('services')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '10px 0',
            color: activeTab === 'services' ? '#2563eb' : '#666',
            fontWeight: activeTab === 'services' ? 'bold' : 'normal',
            borderBottom: activeTab === 'services' ? '2px solid #2563eb' : '2px solid transparent',
          }}
        >
          Saved Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '10px 0',
            color: activeTab === 'providers' ? '#2563eb' : '#666',
            fontWeight: activeTab === 'providers' ? 'bold' : 'normal',
            borderBottom: activeTab === 'providers' ? '2px solid #2563eb' : '2px solid transparent',
          }}
        >
          Saved Providers ({providers.length})
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {current.length === 0 ? (
          <EmptyState onExplore={() => window.location.href = '/find-services'} />
        ) : (
          <>
            {activeTab === 'services' && <SavedServices data={services} reload={load} />}
            {activeTab === 'providers' && <SavedProviders data={providers} reload={load} />}
          </>
        )}
      </div>
    </div>
  );
}
