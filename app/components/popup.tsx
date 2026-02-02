type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feature: any
  coordinate: number[]
  onClose: () => void
}

export default function FeaturePopup({ feature, coordinate, onClose }: Props) {
  const props = feature.getProperties()

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

      <h3 style={{ margin: 0, fontWeight: 600 }}>
        {props.name ?? 'Entité'}
      </h3>

      <hr />

      <pre
        style={{
          fontSize: '12px',
          maxHeight: '120px',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  )
}
