import { useEffect, useState } from 'react';
import { fetchFundings } from '@/app/_api/fundings/get-fundings-by-ap.api';
import { ProtectedArea } from '@/lib/schemas';

type Props = {
  feature: any;
  coordinate: number[];
  onClose: () => void;
};

export default function FeaturePopup({ feature, onClose }: Props) {
  const props: ProtectedArea = feature.getProperties();
  const [fundings, setFundings] = useState<any[]>([]);

  const fetchDetails = async () => {
    const id = props.id;

    if (!id) return;
    const res = await fetchFundings(id);

    setFundings(res);
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'PN':
        return 'Parc national';

      case 'RS':
        return 'Réserve spéciale';

      default:
        return 'Réserve naturelle intégrale';
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [props.id]);

  console.log(props);

  return (
    <div
      style={{
        position: 'absolute',
        transform: 'translate(-10%, 0%)',
        background: 'white',
        borderRadius: '12px',
        minWidth: '280px',
        maxWidth: '280px',
        boxShadow:
          '0 20px 50px rgba(211, 136, 0, 0.25), 0 0 1px rgba(0,0,0,0.1)',
        pointerEvents: 'auto',
        border: '1px solid rgba(211, 136, 0, 0.1)',
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
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>
          {props.name}
        </h3>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', maxHeight: '300px', overflowY: 'scroll' }}>
        <div
          style={{
            borderTop: '1px solid #f0e6d2',
            paddingTop: '12px',
            marginBottom: 4,
          }}
        >
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
            Détails
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {props.status && (
              <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                <span style={{ fontWeight: 600 }}>Statut:</span>{' '}
                {getStatusName(props.status)}
              </p>
            )}
            {props.size && (
              <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                <span style={{ fontWeight: 600 }}>Surface:</span>{' '}
                {props.size.toFixed(3)}ha
              </p>
            )}
          </div>
        </div>

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
              Bailleurs({fundings.length})
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
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#d38800',
                    }}
                  >
                    {e.funder.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '9px', color: '#777' }}>
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
