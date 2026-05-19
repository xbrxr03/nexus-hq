import type { FeedEvent } from '../types'

function eventLabel(e: FeedEvent): string {
  const d = (e.data ?? e) as Record<string, string>
  if (e.type === 'audit_event')       return `${(d.decision ?? '').toUpperCase()} ${d.tool ?? ''}`
  if (e.type === 'task_update')       return `${d.status}: ${(d.intent ?? '').slice(0, 40)}`
  if (e.type === 'approval_pending')  return `⏸ ${d.tool ?? 'approval'} requested`
  if (e.type === 'approval_resolved') return `${d.decision === 'approved' ? '✓' : '✕'} approval ${d.decision}`
  if (e.type === 'service_health')    return 'service health update'
  return e.type ?? 'event'
}

function eventColor(e: FeedEvent): string {
  if (e.type === 'approval_pending')  return '#fb923c'
  if (e.type === 'approval_resolved') return (e.data as Record<string, string>)?.decision === 'approved' ? '#34d399' : '#f87171'
  if (e.type === 'audit_event') {
    const d = ((e.data as Record<string, string>)?.decision ?? '').toLowerCase()
    if (d === 'approved' || d === 'allow') return '#34d399'
    if (d === 'denied'   || d === 'deny')  return '#f87171'
  }
  if (e.type === 'task_update') {
    const s = (e.data as Record<string, string>)?.status ?? ''
    if (s === 'completed') return '#34d399'
    if (s === 'failed')    return '#f87171'
    if (s === 'running')   return '#4f8ef7'
  }
  return 'rgba(255,255,255,0.25)'
}

interface LiveFeedProps {
  events: FeedEvent[]
}

export function LiveFeed({ events }: LiveFeedProps) {
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: 260, zIndex: 50,
      background: 'rgba(6,8,16,0.75)',
      backdropFilter: 'blur(16px)',
      borderLeft: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      pointerEvents: 'none',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#34d399', boxShadow: '0 0 5px #34d399',
          }} />
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          }}>Live Activity</span>
        </div>
      </div>

      {/* Events */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {events.length === 0 ? (
          <div style={{ padding: '24px 16px', fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            Waiting for activity…
          </div>
        ) : events.slice(0, 80).map((e, i) => (
          <div key={i} style={{
            padding: '8px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}>
            <div style={{
              fontSize: 9, color: 'rgba(255,255,255,0.18)',
              fontFamily: 'monospace', marginBottom: 3,
            }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{
              fontSize: 11, color: eventColor(e), lineHeight: 1.45,
              wordBreak: 'break-word',
            }}>
              {eventLabel(e)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}