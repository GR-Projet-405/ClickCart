import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, CheckCircle2, XCircle, FileText, 
  Check, X, RefreshCw, Filter, Calendar, Eye,
  ShieldCheck, Mail, Phone, MapPin, Download, AlertCircle, Wrench
} from 'lucide-react';

const VerificationQueue = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals State
  const [selectedProvider, setSelectedProvider] = useState(null); // Details Modal
  const [rejectingProvider, setRejectingProvider] = useState(null); // Reject Modal

  // Rejection Form State
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [additionalComments, setAdditionalComments] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  
  const getAvatarUrl = (provider) => {
    if (!provider) return 'https://ui-avatars.com/api/?name=User&background=0284c7&color=fff&bold=true';
    
    
    const profileImg = provider.avatar || provider.profilePic || provider.profilePicture || provider.imageUrl || provider.profileImage;
    if (profileImg && profileImg.trim() !== '') {
      return profileImg;
    }
    
    
    const name = provider.ownerName || provider.businessName || 'Provider';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true`;
  };

  const getDocumentLabel = (doc, idx) => {
    if (typeof doc === 'string') return doc;
    if (!doc) return `Document ${idx + 1}`;
    if (doc.name) return doc.name;
    if (doc.documentType) return doc.documentType;
    if (doc.type && doc.type !== 'info' && doc.type !== 'purple') return doc.type;
    if (doc.url) {
      const urlLower = doc.url.toLowerCase();
      if (urlLower.includes('nic') || urlLower.includes('identity')) return 'NIC / Identity';
      if (urlLower.includes('br') || urlLower.includes('business')) return 'Business Registration';
      if (urlLower.includes('cert') || urlLower.includes('license')) return 'Certificate / License';
    }
    if (doc.type === 'info') return 'NIC / Identity';
    if (doc.type === 'purple') return 'Business Registration';
    return idx === 0 ? 'NIC / Identity' : 'Business Registration';
  };

  const handleDownload = (docUrl, fileName = 'document') => {
    if (!docUrl) return;
    const fetchUrl = docUrl.includes('cloudinary.com') 
      ? docUrl.replace('/upload/', '/upload/fl_attachment/') 
      : docUrl;
    window.open(fetchUrl, '_blank');
  };

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
      const response = await fetch(`http://localhost:8080/api/admin/providers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProviders(prev =>
          Array.isArray(prev) 
            ? prev.map(p => ((p.id === id || p._id === id) ? { ...p, ...updatedData, status: newStatus } : p)) 
            : []
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const openRejectModal = (provider) => {
    setRejectingProvider(provider);
    setSelectedReasons([]);
    setAdditionalComments('');
    setSendEmail(true);
    if (selectedProvider) setSelectedProvider(null); 
  };

  const handleReasonToggle = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectingProvider) return;
    const pId = rejectingProvider.id || rejectingProvider._id;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/admin/providers/${pId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reasons: selectedReasons,
          comments: additionalComments,
          sendEmail: sendEmail
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProviders(prev =>
          Array.isArray(prev) 
            ? prev.map(p => ((p.id === pId || p._id === pId) ? { ...p, ...updatedData, status: 'REJECTED' } : p)) 
            : []
        );
        setRejectingProvider(null);
      } else {
        alert('Failed to reject provider.');
      }
    } catch (err) {
      console.error('Error confirming rejection:', err);
      alert('Error updating rejection status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseProviderDate = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string' && dateValue.includes('IST')) {
      const parts = dateValue.trim().split(/\s+/);
      if (parts.length >= 6) {
        const monthStr = parts[1]; 
        const day = parts[2];      
        const time = parts[3];     
        const year = parts[5];     
        const parsed = new Date(`${monthStr} ${day}, ${year} ${time}`);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  };

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

  const pendingCount = safeProviders.filter(p => p.status?.toUpperCase() === 'PENDING').length;
  const approvedThisMonthCount = safeProviders.filter(p => {
    if (p.status?.toUpperCase() !== 'APPROVED') return false;
    const date = parseProviderDate(p.createdAt || p.date || p.submittedDate);
    const now = new Date();
    return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const rejectedCount = safeProviders.filter(p => p.status?.toUpperCase() === 'REJECTED').length;
  const totalCount = safeProviders.length;

  const filteredProviders = safeProviders.filter(p => {
    if (activeTab !== 'All' && p.status?.toUpperCase() !== activeTab.toUpperCase()) return false;
    if (typeFilter !== 'All' && p.providerType?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      (p.ownerName && p.ownerName.toLowerCase().includes(term)) ||
      (p.businessName && p.businessName.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term));
    if (term && !matchSearch) return false;

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

  const availableReasons = [
    "Blurry or Unclear NIC/ID Document",
    "Invalid / Expired BR Certificate",
    "Business Details Mismatch",
    "Other Reason"
  ];

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: 700 }}>
            Provider Verification Queue
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
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
                  const providerName = p.ownerName || p.businessName || 'Provider';

                  return (
                    <tr key={pId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={getAvatarUrl(p)} 
                            alt={providerName} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=0284c7&color=fff&bold=true`;
                            }}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              {providerName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{p.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, 
                          background: isBusiness ? '#f3e8ff' : '#e0f2fe', 
                          color: isBusiness ? '#7e22ce' : '#0369a1' 
                        }}>
                          {p.providerType || 'Business'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.category || 'General Service'}</td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {Array.isArray(p.documents) && p.documents.length > 0 ? (
                            p.documents.map((doc, idx) => {
                              const docLabel = getDocumentLabel(doc, idx);
                              return (
                                <span 
                                  key={idx}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                                    fontWeight: 600, background: '#f1f5f9', color: '#1e293b',
                                    border: '1px solid #cbd5e1', whiteSpace: 'nowrap'
                                  }}
                                >
                                  <FileText size={13} style={{ color: '#0284c7' }} />
                                  {docLabel}
                                </span>
                              );
                            })
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>No verification documents submitted</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDate(p.createdAt || p.date || p.submittedDate)}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, 
                          background: statusFormatted === 'PENDING' ? '#fef3c7' : statusFormatted === 'APPROVED' ? '#dcfce7' : '#fee2e2', 
                          color: statusFormatted === 'PENDING' ? '#d97706' : statusFormatted === 'APPROVED' ? '#15803d' : '#dc2626' 
                        }}>
                          {statusFormatted === 'PENDING' ? 'Pending' : statusFormatted === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', whiteSpace: 'nowrap' }}>
                          <button 
                            onClick={() => setSelectedProvider(p)}
                            style={{ 
                              background: '#0070f3', color: '#ffffff', border: 'none', 
                              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap'
                            }}
                          >
                            <Eye size={14} />
                            View Details
                          </button>

                          {statusFormatted === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(pId, 'APPROVED')}
                                title="Approve Request"
                                style={{
                                  background: '#22c55e', color: '#ffffff', border: 'none',
                                  width: '28px', height: '28px', borderRadius: '6px',
                                  display: 'inline-grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0
                                }}
                              >
                                <Check size={16} />
                              </button>
                              
                              <button
                                onClick={() => openRejectModal(p)}
                                title="Reject Request"
                                style={{
                                  background: '#ef4444', color: '#ffffff', border: 'none',
                                  width: '28px', height: '28px', borderRadius: '6px',
                                  display: 'inline-grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0
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

      {/* ==================== VIEW DETAILS MODAL POPUP ==================== */}
      {selectedProvider && (() => {
        const providerName = selectedProvider.ownerName || selectedProvider.businessName || 'Provider';
        const isBusiness = (selectedProvider.providerType || '').toLowerCase() === 'business';

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '16px'
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '680px',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex', flexDirection: 'column', padding: '24px'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#dcfce7', width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    Provider Verification Details - {providerName}
                  </h2>
                </div>
                <button onClick={() => setSelectedProvider(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Header Card (Left Info & Right Category/Date) */}
              <div style={{
                background: '#f0f7ff',
                border: '1px solid #e0f2fe',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                {/* Left Side: Profile Info */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <img 
                    src={getAvatarUrl(selectedProvider)} 
                    alt={providerName} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=0284c7&color=fff&bold=true`;
                    }}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{providerName}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: isBusiness ? '#f3e8ff' : '#e0f2fe', color: isBusiness ? '#7e22ce' : '#0369a1' }}>
                        {selectedProvider.providerType || 'Business'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '12px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} /><span>{selectedProvider.email || 'N/A'}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} /><span>{selectedProvider.phone || 'N/A'}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} /><span>{selectedProvider.address || selectedProvider.location || 'Colombo, Sri Lanka'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: '1px', height: '70px', borderRight: '1px dashed #cbd5e1' }} />

                {/* Right Side: Service Category & Submitted Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Service Category</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wrench size={14} style={{ color: '#0070f3' }} />
                      <span>{selectedProvider.category || selectedProvider.serviceCategory || 'General Service'}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Submitted Date</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: '#0070f3' }} />
                      <span>{formatDate(selectedProvider.createdAt || selectedProvider.date || selectedProvider.submittedDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Submitted Documents</h4>
                {Array.isArray(selectedProvider.documents) && selectedProvider.documents.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {selectedProvider.documents.map((doc, idx) => {
                      const docType = getDocumentLabel(doc, idx);
                      const docUrl = typeof doc === 'object' && doc?.url ? doc.url : (typeof doc === 'string' ? doc : '');

                      return (
                        <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                            <FileText size={14} style={{ color: '#0284c7' }} />
                            <span>{docType}</span>
                          </div>
                          <div style={{ height: '140px', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                            {docUrl ? (
                              <img src={docUrl} alt={docType} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }} onClick={() => window.open(docUrl, '_blank')} />
                            ) : (
                              <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8', fontSize: '12px' }}>No Document Link</div>
                            )}
                          </div>
                          
                          {/* Document Action Buttons (View Full & Download) */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => docUrl && window.open(docUrl, '_blank')} 
                              style={{ 
                                flex: 1, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px', 
                                padding: '8px 12px', 
                                background: '#ffffff', 
                                border: '1px solid #0070f3', 
                                color: '#0070f3', 
                                borderRadius: '8px', 
                                fontSize: '12px', 
                                fontWeight: 600, 
                                cursor: 'pointer' 
                              }}
                            >
                              <Eye size={14} /> View Full
                            </button>
                            <button 
                              onClick={() => handleDownload(docUrl, docType)} 
                              style={{ 
                                flex: 1, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px', 
                                padding: '8px 12px', 
                                background: '#0070f3', 
                                border: 'none', 
                                color: '#ffffff', 
                                borderRadius: '8px', 
                                fontSize: '12px', 
                                fontWeight: 600, 
                                cursor: 'pointer' 
                              }}
                            >
                              <Download size={14} /> Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No documents submitted</div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => setSelectedProvider(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { handleStatusChange(selectedProvider.id || selectedProvider._id, 'APPROVED'); setSelectedProvider(null); }} style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={16} /> Approve</button>
                  <button onClick={() => openRejectModal(selectedProvider)} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><X size={16} /> Reject</button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ==================== REJECT VERIFICATION REQUEST MODAL ==================== */}
      {rejectingProvider && (() => {
        const providerName = rejectingProvider.ownerName || rejectingProvider.businessName || 'Provider';

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000, padding: '16px'
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex', flexDirection: 'column', padding: '24px', position: 'relative'
            }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #ef4444', display: 'grid', placeItems: 'center', color: '#ef4444', flexShrink: 0 }}>
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>
                      Reject Verification Request
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                      Please select or enter the reason for rejecting <strong style={{ color: '#334155' }}>{providerName}'s</strong> application.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setRejectingProvider(null)} 
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 20px 0' }} />

              {/* Select a Reason */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                  Select a Reason
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {availableReasons.map((reason, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={selectedReasons.includes(reason)}
                        onChange={() => handleReasonToggle(reason)}
                        style={{ width: '18px', height: '18px', accentColor: '#ef4444', cursor: 'pointer' }}
                      />
                      {reason}
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                  Additional Comments
                </h4>
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Provide detailed instructions for the provider on what needs to be updated..."
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none',
                      resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                  />
                  <span style={{ position: 'absolute', right: '12px', bottom: '-20px', fontSize: '11px', color: '#94a3b8' }}>
                    {additionalComments.length}/500
                  </span>
                </div>
              </div>

              {/* Send Email Checkbox */}
              <div style={{ marginBottom: '24px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0070f3', cursor: 'pointer' }}
                  />
                  Send email notification to provider with rejection details.
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '16px' }}>
                <button
                  onClick={() => setRejectingProvider(null)}
                  style={{
                    background: '#e2e8f0', color: '#475569', border: 'none',
                    padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmRejection}
                  disabled={isSubmitting}
                  style={{
                    background: '#ef4444', color: '#ffffff', border: 'none',
                    padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
                    fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default VerificationQueue;