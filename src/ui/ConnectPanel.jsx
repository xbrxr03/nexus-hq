import { useState } from 'react'

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(6,8,16,0.92)',
    backdropFilter: 'blur(20px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    width: 420, padding: '40px 36px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32,
  },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, flexShrink: 0,
  },
  title:    { fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  divider:  { height: 1, background: 'rgba(255,255,255,0.06)', margin: '28px 0' },
  label:    { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' },
  input: {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#f5f5f7',
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    width: '100%', padding: '13px', marginTop: 12,
    background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
    border: 'none', borderRadius: 10,
    color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  btnGhost: {
    width: '100%', padding: '13px', marginTop: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.6)', fontSize: 14,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  hint: {
    fontSize: 11, color: 'rgba(255,255,255,0.25)',
    marginTop: 20, textAlign: 'center', lineHeight: 1.5,
  },
}

export function ConnectPanel({ onConnect, onDemo }) {
  const [host, setHost] = useState('http://192.168.0.18:7070')

  function handleConnect() {
    const h = host.trim()
    if (!h) return
    onConnect(h.startsWith('http') ? h : `http://${h}`)
  }

  return (
    <div style={S.overlay}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>⬡</div>
          <div>
            <div style={S.title}>NEXUS HQ</div>
            <div style={S.subtitle}>3D agent runtime visualizer</div>
          </div>
        </div>

        <div style={S.label}>Connect to ClawOS</div>
        <input
          style={S.input}
          value={host}
          onChange={e => setHost(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConnect()}
          placeholder="http://192.168.x.x:7070"
          spellCheck={false}
        />
        <button style={S.btnPrimary} onClick={handleConnect}>
          Connect Live
        </button>

        <div style={S.divider} />

        <button style={S.btnGhost} onClick={onDemo}>
          Launch Demo  —  no ClawOS needed
        </button>

        <div style={S.hint}>
          NEXUS HQ connects to your local ClawOS dashboard.<br />
          Start ClawOS first, then enter its IP above.
        </div>
      </div>
    </div>
  )
}
