import React, { useState } from 'react';
import { FiUploadCloud, FiFileText, FiCheck } from 'react-icons/fi';
import { providerVerificationService } from '../../services/providerVerificationService';

const ProviderVerificationStepTwo = ({ userId, accountType, onBack, onSuccess }) => {
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [businessCert, setBusinessCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) { setError("Choose a JPG, PNG, WebP or PDF file up to 5 MB."); e.target.value = ""; return; }
      setError("");
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nicFront || !nicBack) {
      setError('Please upload both National ID Front and Back documents.');
      return;
    }

    if (accountType === 'BUSINESS' && !businessCert) {
      setError('Please upload the Business Registration/ Certificate.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await providerVerificationService.saveStepTwo(userId, nicFront, nicBack, businessCert);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to upload documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBusiness = accountType === 'BUSINESS';

  return (
    <div style={{ maxWidth: '650px', margin: '24px auto', background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
      <h2 style={{ textAlign: 'center', fontWeight: '700', fontSize: '24px', marginBottom: '20px', color: '#111827' }}>
        Provider Verification Form
      </h2>

      {/* Account Type Active Indicator */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '30px', padding: '4px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <button type="button" style={{ flex: 1, padding: '10px', borderRadius: '25px', border: 'none', background: !isBusiness ? '#159c2b' : 'transparent', color: !isBusiness ? '#fff' : '#4b5563', fontWeight: '600', cursor: 'default' }}>
          Individual
        </button>
        <button type="button" style={{ flex: 1, padding: '10px', borderRadius: '25px', border: 'none', background: isBusiness ? '#159c2b' : 'transparent', color: isBusiness ? '#fff' : '#4b5563', fontWeight: '600', cursor: 'default' }}>
          Business
        </button>
      </div>

      {/* Stepper Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#159c2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FiCheck size={16} />
        </div>
        <div style={{ width: '100px', height: '2px', background: '#159c2b', margin: '0 8px' }}></div>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#159c2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', boxShadow: '0 0 0 4px #dcfce7' }}>
          2
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '18px', color: '#1f2937' }}>Documents Upload</h3>

      {error && <div style={{ color: '#dc2626', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* NIC Front and Back Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#111827' }}>National ID Card( Front)</label>
            <div style={{ border: '1.5px dashed #159c2b', borderRadius: '12px', padding: '20px', textAlign: 'center', background: '#f9fafb', cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFileChange(e, setNicFront)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <FiUploadCloud size={28} color="#6b7280" />
              <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: '12px' }}>Choose a file (JPG, PNG, WebP or PDF, up to 5 MB)</p>
            </div>
            {nicFront && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#159c2b', marginTop: '6px', fontSize: '12px' }}>
                <FiFileText /> <span>{nicFront.name}</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#111827' }}>National ID Card( Back)</label>
            <div style={{ border: '1.5px dashed #159c2b', borderRadius: '12px', padding: '20px', textAlign: 'center', background: '#f9fafb', cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFileChange(e, setNicBack)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <FiUploadCloud size={28} color="#6b7280" />
              <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: '12px' }}>Choose a file (JPG, PNG, WebP or PDF, up to 5 MB)</p>
            </div>
            {nicBack && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#159c2b', marginTop: '6px', fontSize: '12px' }}>
                <FiFileText /> <span>{nicBack.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Business Registration Upload Section */}
        {isBusiness && (
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#111827' }}>Business Registration/ Certificates</label>
            <div style={{ border: '1.5px dashed #159c2b', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#f9fafb', cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFileChange(e, setBusinessCert)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <FiUploadCloud size={32} color="#6b7280" />
              <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: '14px' }}>Choose a file (JPG, PNG, WebP or PDF, up to 5 MB)</p>
            </div>
            {businessCert && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#159c2b', marginTop: '6px', fontSize: '13px' }}>
                <FiFileText /> <span>{businessCert.name}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{ padding: '10px 32px', borderRadius: '10px', border: '1px solid #159c2b', background: '#fff', color: '#159c2b', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '10px 32px', borderRadius: '10px', border: 'none', background: '#159c2b', color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px' }}
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProviderVerificationStepTwo;