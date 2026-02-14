import { useEffect, useState } from 'react';
import { fetchFundings } from '../api/fundings/get-fundings-by-ap.api';

type Props = {
  feature: any;
  coordinate: number[];
  onClose: () => void;
};

export default function FeaturePopup({ feature, onClose }: Props) {
  const props = feature.getProperties();
  const [fundings, setFundings] = useState<any[]>([]);

  const fetchDetails = async () => {
    const id = props.id;

    const res = await fetchFundings(id);

    setFundings(res);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetails();
  }, [props.id]);

  return (
    <div
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -100%)',
        background: 'white',
        borderRadius: '12px',
        minWidth: '320px',
        maxWidth: '380px',
        boxShadow:
          '0 20px 50px rgba(211, 136, 0, 0.25), 0 0 1px rgba(0,0,0,0.1)',
        pointerEvents: 'auto',
        border: '1px solid rgba(211, 136, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header with gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #d38800 0%, #f0b600 100%)',
          padding: '16px',
          color: 'white',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
          }
        >
          ✕
        </button>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>
          {props.sigle ?? 'Protected Area'}
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.95 }}>
          {props.name}
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Area Details */}
        {props.size && (
          <div style={{ marginBottom: '12px' }}>
            <p
              style={{
                margin: '0 0 6px 0',
                fontSize: '12px',
                color: '#888',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Area Size
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: '#d38800',
              }}
            >
              {(props.size / 1000).toFixed(1)} km²
            </p>
          </div>
        )}

        {/* Description */}
        {props.description && (
          <div style={{ marginBottom: '14px' }}>
            <p
              style={{
                margin: '0 0 6px 0',
                fontSize: '12px',
                color: '#888',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Description
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#555',
                lineHeight: '1.5',
              }}
            >
              {props.description}
            </p>
          </div>
        )}

        {/* Biodiversity */}
        {props.biodiversity && (
          <div style={{ marginBottom: '14px' }}>
            <p
              style={{
                margin: '0 0 6px 0',
                fontSize: '12px',
                color: '#888',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Biodiversity Status
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#d38800',
                fontWeight: 600,
              }}
            >
              {props.biodiversity}
            </p>
          </div>
        )}

        {/* Funding Partners */}
        {fundings.length > 0 && (
          <div style={{ borderTop: '1px solid #f0e6d2', paddingTop: '12px' }}>
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#888',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Funding Partners ({fundings.length})
            </p>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {fundings.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: '#fef6e8',
                    border: '1px solid #f0d699',
                    borderRadius: '8px',
                    padding: '8px 10px',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 2px 0',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#d38800',
                    }}
                  >
                    {e.funder.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#777' }}>
                    {e.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {fundings.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '12px 0',
              color: '#aaa',
              fontSize: '12px',
            }}
          >
            Loading funding information...
          </div>
        )}
      </div>
    </div>
  );
}
