import { useRef, useEffect, useMemo } from 'react'

// Derive action log entries from the ClawOS event stream
function deriveActionStatus(e) {
  if (e.type === 'audit_event') {
    const decision = (e.data?.decision ?? '').toLowerCase()
    if (decision === 'approved' || decision === 'allow') return 'success'
    if (decision === 'denied' || decision === 'deny') return 'fail'
    return 'pending'
  }
  if (e.type === 'task_update') {
    const s = e.data?.status ?? ''
    if (s === 'completed') return 'success'
    if (s === 'failed') return 'fail'
    return 'pending'
  }
  if (e.type === 'approval_pending') return 'pending'
  if (e.type === 'approval_resolved') {
    return e.data?.decision === 'approved' ? 'success' : 'fail'
  }
  return 'success'
}

function deriveActionType(e) {
  if (e.type === 'audit_event') return 'audit'
  if (e.type === 'task_update') return 'task'
  if (e.type?.startsWith('approval')) return 'approval'
  return 'system'
}

function formatActionLabel(e) {
  if (e.type === 'audit_event') {
    const d = e.data ?? {}
    return `${(d.decision ?? '').toUpperCase()} ${d.tool ?? ''}`
  }
  if (e.type === 'task_update') {
    return `${(e.data?.status ?? '')}: ${(e.data?.intent ?? '').slice(0, 50)}`
  }
  if (e.type === 'approval_pending') {
    return `⏸ ${e.data?.tool ?? 'approval'} requested`
  }
  if (e.type === 'approval_resolved') {
    return `✕ approval ${e.data?.decision ?? ''}`
  }
  return e.type ?? 'event'
}

function formatAgent(e) {
  return e.data?.workspace_id ?? e.data?.workspace ?? e.workspace_id ?? 'system'
}

const STATUS_COLORS = {
  success: { dot: '#34d399', text: '#34d399' },
  fail:    { dot: '#f87171', text: '#f87171' },
  pending: { dot: '#fb923c', text: '#fb923c' },
}

const TYPE_LABELS = {
  audit:     { label: 'AUDIT',   bg: 'rgba(79,142,247,0.1)',  color: '#4f8ef7' },
  task:      { label: 'TASK',    bg: 'rgba(167,139,250,0.1)', color: '#a78bfa' },
  approval:  { label: 'APPROVE',  bg: 'rgba(251,146,60,0.1)', color: '#fb923c' },
  system:    { label: 'SYSTEM',  bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' },
}

export function ActionLog({ events }) {
  const scrollRef = useRef(null)

  const entries = useMemo(() => {
    if (!events || events.length === 0) return []
    return events.slice(0, 120).map((e, i) => ({
      id:       e.id ?? `ev_${i}_${e.type}`,
      time:     e.timestamp ?? Date.now() - i * 3000,
      agent:    formatAgent(e),
      action:   formatActionLabel(e),
      type:     deriveActionType(e),
      status:   deriveActionStatus(e),
      detail:   e.data?.target ?? e.data?.intent ?? '',
    }))
  }, [events])

  // Auto-scroll to top (newest) on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [entries.length])

  if (entries.length === 0) {
    return (
      <div style={{
        position: 'fixed', bottom: 20, right: 278, zIndex: 55,
        width: 320,
        background: 'rgba(6,8,16,0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#fb923c', boxShadow: '0 0 5px #fb923c',
          }} />
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          }}>
            Action Log
          </span>
        </div>
        <div style={{ padding: '24px 16px', fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Waiting for activity…
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 278, zIndex: 55,
      width: 320, maxHeight: 380,
      background: 'rgba(6,8,16,0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      pointerEvents: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 7,
        flexShrink: 0,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#fb923c', boxShadow: '0 0 5px #fb923c',
        }} />
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        }}>
          Action Log
        </span>
        <span style={{
          fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto',
        }}>
          {entries.length} entries
        </span>
      </div>

      {/* Scrollable entries */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', maxHeight: 300,
      }}>
        {entries.map((entry, i) => {
          const typeConfig = TYPE_LABELS[entry.type] ?? TYPE_LABELS.system
          const statusConfig = STATUS_COLORS[entry.status] ?? STATUS_COLORS.pending
          const timeStr = new Date(entry.time).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })

          return (
            <div key={entry.id} style={{
              padding: '8px 14px',
              borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                {/* Status dot */}
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: statusConfig.dot,
                  boxShadow: `0 0 4px ${statusConfig.dot}`,
                  flexShrink: 0,
                }} />
                {/* Type badge */}
                <span style={{
                  fontSize: 8, fontWeight: 600, letterSpacing: '0.06em',
                  padding: '1px 5px', borderRadius: 3,
                  background: typeConfig.bg, color: typeConfig.color,
                }}>
                  {typeConfig.label}
                </span>
                {/* Agent */}
                <span style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {entry.agent}
                </span>
                {/* Time */}
                <span style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', marginLeft: 'auto', flexShrink: 0,
                }}>
                  {timeStr}
                </span>
              </div>
              <div style={{
                fontSize: 11, color: statusConfig.text, lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                paddingLeft: 11,
              }}>
                {entry.action}
              </div>
              {entry.detail && (
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  paddingLeft: 11, fontFamily: 'monospace',
                }}>
                  {entry.detail}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}