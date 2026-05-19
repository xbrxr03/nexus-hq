import { avatarColor } from '../lib/colors'
import type { Agent, AgentState } from '../types'

interface StateLabel {
  label: string
  color: string
}

const STATE_LABEL: Record<AgentState, StateLabel> = {
  idle:             { label: 'Idle',              color: 'rgba(255,255,255,0.4)' },
  working:          { label: 'Working',           color: '#4f8ef7' },
  completed:        { label: 'Completed',         color: '#34d399' },
  pending_approval: { label: 'Awaiting Approval',  color: '#fb923c' },
  offline:          { label: 'Offline',           color: 'rgba(255,255,255,0.2)' },
}

interface AvatarCardProps {
  agent: Agent
  onClose: () => void
  onReset: (workspace_id: string) => void
}

export function AvatarCard({ agent, onClose, onReset }: AvatarCardProps) {
  if (!agent) return null
  const color = avatarColor(agent.workspace_id)
  const stateInfo = STATE_LABEL[agent.state] ?? STATE_LABEL.idle

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 60, minWidth: 300,
      background: 'rgba(6,8,16,0.88)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${color}40`,
      borderRadius: 16, overflow: 'hidden',
      animation: 'fadeUp 0.18s ease-out',
    }}>
      {/* Color bar */}
      <div style={{ height: 3, background: color }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: color + '18', border: `2px solid ${color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color,
          }}>
            {agent.workspace_id.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{agent.workspace_id}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {agent.zone} · {agent.model ?? 'local'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4,
          }}>×</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{agent.turn}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>turns</div>
          </div>
          <div style={{ flex: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: stateInfo.color, boxShadow: `0 0 5px ${stateInfo.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: stateInfo.color, fontWeight: 500 }}>{stateInfo.label}</span>
          </div>
        </div>

        {/* Session ID */}
        <div style={{
          fontSize: 10, color: 'rgba(255,255,255,0.2)',
          fontFamily: 'monospace', marginBottom: 14,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {agent.session_id ?? '—'}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onReset?.(agent.workspace_id)}
            style={{
              flex: 1, padding: '8px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Reset Session
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}