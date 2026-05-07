'use client';

import { X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeaturePopupProps {
  feature: any;
  coordinate?: any;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function FeaturePopup({
  feature,
  coordinate,
  onClose,
  children,
}: FeaturePopupProps) {
  const router = useRouter();
  const properties = feature.getProperties();

  return (
    <div
      style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '250px',
        maxWidth: '300px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div>
          <h3
            style={{
              margin: '0 0 4px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: '#333',
            }}
          >
            {properties.name || 'Sans nom'}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: '#666',
            }}
          >
            Type: <strong>{properties.status || 'N/A'}</strong>
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: '#999',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {children}

      <button
        onClick={() => {
          const id = properties.id || '1';
          router.push(`/protected-area/${id}`);
        }}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '10px',
          background: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        Details <ArrowRight size={16} />
      </button>
    </div>
  );
}
