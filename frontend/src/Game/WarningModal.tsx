interface WarningModalProps {
  onAcknowledge: () => void
}

export function WarningModal({ onAcknowledge }: WarningModalProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{ margin: '0.5rem 0 1rem' }}>Warning</h2>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
         Warning
        </p>
        <button
          onClick={onAcknowledge}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            backgroundColor: '#e53e3e',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          I'm not a coward.
        </button>
      </div>
    </div>
  )
}
