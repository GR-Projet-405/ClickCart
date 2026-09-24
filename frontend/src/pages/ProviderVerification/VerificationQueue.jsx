import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, CheckCircle2, XCircle, FileText, 
  Check, X, RefreshCw, Filter, Calendar, Eye
} from 'lucide-react';

const VerificationQueue = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Backend Data Fetch
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/providers/verifications');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProviders(data);
        } else {
          setProviders([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch backend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const safeProviders = Array.isArray(providers) ? providers : [];

  const handleRefresh = () => {
    setSearchTerm('');
    setActiveTab('All');
    setTypeFilter('All');
    setStartDate('');
    setEndDate('');
    fetchProviders();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:8080/api/admin/providers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      setProviders(prev =>
        Array.isArray(prev) ? prev.map(p => (p.id === id || p._id === id ? { ...p, status: newStatus } : p)) : []
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      setProviders(prev =>
        Array.isArray(prev) ? prev.map(p => (p.id === id || p._id === id ? { ...p, status: newStatus } : p)) : []
      );
    }
  };

  
  const parseProviderDate = (dateValue) => {
    if (!dateValue) return null;

    if (typeof dateValue === 'string' && dateValue.includes('IST')) {
      const parts = dateValue.trim().split(/\s+/);
      if (parts.length >= 6) {
        const monthStr = parts[1]; // Sep
        const day = parts[2];      // 23
        const time = parts[3];     // 15:30:00
        const year = parts[5];     // 2026
        const parsed = new Date(`${monthStr} ${day}, ${year} ${time}`);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }

    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  };

  // Date Formatter
  const formatDate = (dateValue) => {
    const dateObj = parseProviderDate(dateValue);
    if (!dateObj) return 'N/A';

    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${month} ${day} ${year} , ${hours}:${minutes}:${seconds}`;
  };

  // Summary Counts Calculation
  const pendingCount = safeProviders.filter(p => p.status?.toUpperCase() === 'PENDING').length;
  const approvedThisMonthCount = safeProviders.filter(p => {
    if (p.status?.toUpperCase() !== 'APPROVED') return false;
    const date = parseProviderDate(p.createdAt || p.date || p.submittedDate);
    const now = new Date();
    return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const rejectedCount = safeProviders.filter(p => p.status?.toUpperCase() === 'REJECTED').length;
  const totalCount = safeProviders.length;

  // Filtering Logic 
  const filteredProviders = safeProviders.filter(p => {
    // 1. Status Filter
    if (activeTab !== 'All' && p.status?.toUpperCase() !== activeTab.toUpperCase()) {
      return false;
    }

    // 2. Provider Type Filter
    if (typeFilter !== 'All' && p.providerType?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }

    // 3. Search Filter
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      (p.ownerName && p.ownerName.toLowerCase().includes(term)) ||
      (p.businessName && p.businessName.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term));
    if (term && !matchSearch) return false;

    // 4. Date Range Filter
    if (startDate || endDate) {
      const pDate = parseProviderDate(p.createdAt || p.date || p.submittedDate);
      if (pDate) {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (pDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (pDate > end) return false;
        }
      } else {
        return false;
      }
    }

    return true;
  });

  return (
    <div style={{ padding: '24px', background: 'var(--cc-bg-app, #f8fafc)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--cc-text-primary, #0f172a)', fontSize: '24px', fontWeight: 700 }}>
            Provider Verification Queue
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-secondary, #64748b)', fontSize: '14px' }}>
            Review and manage service provider verification requests and submitted documents.
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '8px', padding: '8px 16px',
            fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Pending Verifications</p>
            <h2 style={{ margin: '4px 0 0 0', color: '#d97706', fontSize: '28px', fontWeight: 700 }}>{pendingCount}</h2>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fef3c7', display: 'grid', placeItems: 'center', color: '#d97706' }}>
            <Clock size={22} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Approved This Month</p>
            <h2 style={{ margin: '4px 0 0 0', color: '#16a34a', fontSize: '28px', fontWeight: 700 }}>{approvedThisMonthCount}</h2>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Rejected Requests</p>
            <h2 style={{ margin: '4px 0 0 0', color: '#dc2626', fontSize: '28px', fontWeight: 700 }}>{rejectedCount}</h2>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', color: '#dc2626' }}>
            <XCircle size={22} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Total Requests</p>
            <h2 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '28px', fontWeight: 700 }}>{totalCount}</h2>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f1f5f9', display: 'grid', placeItems: 'center', color: '#64748b' }}>
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
        
        {/* Filter Toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text"
                placeholder="Search by Provider Name, Email, or Category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
              {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? '#0070f3' : 'transparent',
                    color: activeTab === tab ? '#ffffff' : '#64748b'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="All">All Provider Types</option>
              <option value="Business">Business</option>
              <option value="Individual">Individual</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              <Calendar size={14} style={{ color: '#94a3b8' }} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', width: '22%' }}>Provider Name & Contact</th>
                <th style={{ padding: '12px 14px', width: '10%' }}>Type</th>
                <th style={{ padding: '12px 14px', width: '15%' }}>Service Category</th>
                <th style={{ padding: '12px 14px', width: '21%' }}>Submitted Documents</th>
                <th style={{ padding: '12px 14px', width: '15%', whiteSpace: 'nowrap' }}>Submitted Date</th>
                <th style={{ padding: '12px 14px', width: '9%' }}>Status</th>
                <th style={{ padding: '12px 14px', width: '8%', textAlign: 'left', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No providers found.
                  </td>
                </tr>
              ) : (
                filteredProviders.map((p, i) => {
                  const pId = p.id || p._id || i;
                  const statusFormatted = (p.status || 'PENDING').toUpperCase();
                  const isBusiness = (p.providerType || '').toLowerCase() === 'business';

                  return (
                    <tr key={pId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Name & Avatar */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                            alt={p.ownerName || p.businessName || 'Provider'} 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              {p.ownerName || p.businessName || 'N/A'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{p.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, 
                          background: isBusiness ? '#f3e8ff' : '#e0f2fe', 
                          color: isBusiness ? '#7e22ce' : '#0369a1' 
                        }}>
                          {p.providerType || 'Business'}
                        </span>
                      </td>

                      {/* Service Category */}
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.category || 'General Service'}</td>

                      {/* Submitted Documents Column */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {(() => {
                            let docsToRender = [];

                            if (Array.isArray(p.documents) && p.documents.length > 0) {
                              docsToRender = p.documents
                                .map(doc => {
                                  if (typeof doc === 'string') return doc;
                                  if (typeof doc === 'object' && doc !== null) {
                                    return doc.name || doc.documentName || doc.type || doc.title || null;
                                  }
                                  return null;
                                })
                                .filter(docName => docName && docName !== 'info' && docName !== 'purple');
                            } 
                            else if (p.documents && typeof p.documents === 'object') {
                              docsToRender = Object.keys(p.documents)
                                .filter(k => k !== 'info' && k !== 'purple')
                                .map(k => k.toUpperCase());
                            }

                            if (docsToRender.length === 0) {
                              docsToRender = isBusiness 
                                ? ['BR Certificate', 'NIC Front/Back'] 
                                : ['NIC Front/Back', 'Utility Bill'];
                            }

                            return docsToRender.map((docLabel, idx) => (
                              <span 
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  background: '#f1f5f9',
                                  color: '#1e293b',
                                  border: '1px solid #cbd5e1',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <FileText size={13} style={{ color: '#0284c7' }} />
                                {docLabel}
                              </span>
                            ));
                          })()}
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDate(p.createdAt || p.date || p.submittedDate)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, 
                          background: statusFormatted === 'PENDING' ? '#fef3c7' : statusFormatted === 'APPROVED' ? '#dcfce7' : '#fee2e2', 
                          color: statusFormatted === 'PENDING' ? '#d97706' : statusFormatted === 'APPROVED' ? '#15803d' : '#dc2626' 
                        }}>
                          {statusFormatted === 'PENDING' ? 'Pending' : statusFormatted === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', whiteSpace: 'nowrap' }}>
                          
                          {/* View Details Button */}
                          <button 
                            style={{ 
                              background: '#0070f3', color: '#ffffff', border: 'none', 
                              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap'
                            }}
                          >
                            <Eye size={14} />
                            View Details
                          </button>

                          {/* Approve/Reject Buttons */}
                          {statusFormatted === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(pId, 'APPROVED')}
                                title="Approve Request"
                                style={{
                                  background: '#22c55e', color: '#ffffff', border: 'none',
                                  width: '28px', height: '28px', borderRadius: '6px',
                                  display: 'inline-grid', placeItems: 'center', cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                <Check size={16} />
                              </button>
                              
                              <button
                                onClick={() => handleStatusChange(pId, 'REJECTED')}
                                title="Reject Request"
                                style={{
                                  background: '#ef4444', color: '#ffffff', border: 'none',
                                  width: '28px', height: '28px', borderRadius: '6px',
                                  display: 'inline-grid', placeItems: 'center', cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default VerificationQueue;