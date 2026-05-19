import { avatarColor } from '../lib/colors.js'

const STATUS_CONFIG = {
  idle:             { label: 'Idle',              color: 'rgba(255,255,255,0.4)',  bg: 'rgba(255,255,255,0.04)' },
  working:          { label: 'Working',           color: '#4f8ef7',                bg: 'rgba(79,142,247,0.08)' },
  completed:        { label: 'Completed',         color: '#34d399',                bg: 'rgba(52,211,153,0.08)' },
  pending_approval: { label: 'Awaiting Approval', color: '#fb923c',              bg: 'rgba(251,146,60,0.08)' },
  offline:          { label: 'Offline',           color: 'rgba(255,255,255,0.2)',  bg: 'rgba(255,255,255,0.02)' },
  error:            { label: 'Error',             color: '#f87171',                bg: 'rgba(248,113,113,0.08)' },
}

function formatUptime(turns) {
  if (turns === 0) return 'Just started'
  if (turns === 1) return '1 turn'
  return `${turns} turns`
}

export function AgentStatusCards({ agents }) {
  if (!agents || agents.length === 0) return null

  const activeAgents = agents.filter(a => a.state !== 'offline')

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 16, zIndex: 55,
      display: 'flex', gap: 10, maxWidth: 'calc(100vw - 300px)',
      overflowX: 'auto', pointerEvents: 'auto',
    }}>
      {activeAgents.map(agent => {
        const color = avatarColor(agent.workspace_id)
        const status = STATUS_CONFIG[agent.state] ?? STATUS_CONFIG.idle
        const lastAction = agent.state === 'working' ? 'Processing task…'
          : agent.state === 'pending_approval' ? 'Waiting for approval'
          : agent.state === 'completed' ? 'Task finished'
          : 'Waiting for work'

        return (
          <div key={agent.workspace_id} style={{
            minWidth: 200, background: 'rgba(6,8,16,0.85)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${color}30`,
            borderRadius: 12, overflow: 'hidden',
            transition: 'all 0.2s ease',
            cursor: 'default',
          }}>
            {/* Color accent bar */}
            <div style={{ height: 2, background: color }} />

            <div style={{ padding: '12px 14px' }}>
              {/* Agent header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `${color}18`, border: `2px solid ${color}80`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color, flexShrink: 0,
                }}>
                  {agent.workspace_id.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {agent.workspace_id}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                    {agent.zone} · {agent.model ?? 'local'}
                  </div>
                </div>
              </div>

              {/* Status row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: status.bg, borderRadius: 6,
                padding: '5px 8px', marginBottom: 8,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: status.color,
                  boxShadow: status.color.startsWith('#') ? `0 0 5px ${status.color}` : 'none',
                  animation: agent.state === 'working' ? 'pulse 2s infinite' : 'none',
                }} />
                <span style={{ fontSize: 11, color: status.color, fontWeight: 500 }}>
                  {status.label}
                </span>
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  Uptime
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                  {formatUptime(agent.turn)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  Last action
                </div>
                <div style={{ fontSize: 10, color: status.color, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lastAction}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}