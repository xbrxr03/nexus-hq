import { RT } from '../lib/colors.js'

const S = {
  wrap: {
    position: 'fixed', top: 16, left: 16, zIndex: 50,
    display: 'flex', flexDirection: 'column', gap: 8,
    pointerEvents: 'none',
  },
  topRow: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(6,8,16,0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10, padding: '8px 14px',
  },
  logoText: { fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' },
  chip: (running, color) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    background: running ? `${color}18` : 'rgba(6,8,16,0.7)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${running ? color + '40' : 'rgba(255,255,255,0.06)'}`,
    borderRadius: 8, padding: '6px 10px',
    fontSize: 12, color: running ? color : 'rgba(255,255,255,0.3)',
    transition: 'all 0.3s',
  }),
  dot: (running, color) => ({
    width: 6, height: 6, borderRadius: '50%',
    background: running ? color : 'rgba(255,255,255,0.2)',
    boxShadow: running ? `0 0 5px ${color}` : 'none',
    flexShrink: 0,
    transition: 'all 0.3s',
  }),
  demoBanner: {
    background: 'rgba(251,146,60,0.12)',
    border: '1px solid rgba(251,146,60,0.3)',
    borderRadius: 8, padding: '5px 10px',
    fontSize: 11, color: '#fb923c',
  },
  connBadge: (connected) => ({
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'rgba(6,8,16,0.7)', backdropFilter: 'blur(12px)',
    border: `1px solid ${connected ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
    borderRadius: 8, padding: '5px 10px',
    fontSize: 11, color: connected ? '#34d399' : '#f87171',
  }),
}

export function HUD({ runtimes, connected, demoMode, agentCount }) {
  return (
    <div style={S.wrap}>
      <div style={S.topRow}>
        {/* Logo */}
        <div style={S.logo}>
          <span style={{ fontSize: 18 }}>⬡</span>
          <span style={S.logoText}>NEXUS HQ</span>
        </div>

        {/* Connection status */}
        <div style={S.connBadge(connected)}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: connected ? '#34d399' : '#f87171',
            boxShadow: connected ? '0 0 5px #34d399' : 'none',
          }} />
          {connected ? 'Live' : 'Offline'}
        </div>

        {/* Agent count */}
        {agentCount > 0 && (
          <div style={{ ...S.connBadge(true), borderColor: 'rgba(79,142,247,0.3)', color: '#4f8ef7' }}>
            {agentCount} agent{agentCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Runtime chips */}
      <div style={{ display: 'flex', gap: 6 }}>
        {Object.entries(RT).map(([key, rt]) => {
          const r = runtimes?.[key] ?? {}
          const running = r.running ?? false
          return (
            <div key={key} style={S.chip(running, rt.primary)}>
              <div style={S.dot(running, rt.primary)} />
              {rt.label}
            </div>
          )
        })}
      </div>

      {/* Demo banner */}
      {demoMode && (
        <div style={S.demoBanner}>
          Demo mode — connect your ClawOS to go live
        </div>
      )}
    </div>
  )
}
