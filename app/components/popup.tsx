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
        padding: '12px',
        borderRadius: '12px',
        minWidth: '220px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        ✕
      </button>

      <h3 style={{ margin: 0, fontWeight: 600 }}>{props.sigle ?? 'Entité'}</h3>

      <hr />

      <pre
        style={{
          fontSize: '12px',
          maxHeight: '120px',
          overflow: 'auto',
        }}
      >
        {props.id}
        {fundings.map((e) => {
          return <div key={e.id}>{e.funder.name}</div>;
        })}
      </pre>
    </div>
  );
}
