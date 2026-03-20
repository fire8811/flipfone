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
        backgroundColor: '#0b1120',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{color: '#bf96e9', margin: '0.5rem 0 1rem' }}>Warning</h2>
        <p style={{ color: '#d0cfd1', lineHeight: 1.6 }}>
         To play FlipFone you will be throwing your phone in the air! FlipFone is not responsible for any damage to your phone or other property. Proceed at your own risk!
        </p>
        <button
          onClick={onAcknowledge}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            background: 'linear-gradient(to bottom, #e26060, #c03543)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '60%',
            display: 'block',
            margin: '1.5rem auto 0',
          }}
        >
          I'm not a coward.
        </button>
      </div>
    </div>
  )
}
