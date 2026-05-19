import { useState, useCallback } from 'react'
import { Office }       from './scene/Office'
import { ConnectPanel } from './ui/ConnectPanel'
import { HUD }          from './ui/HUD'
import { AvatarCard }   from './ui/AvatarCard'
import { LiveFeed }     from './ui/LiveFeed'
import { useClawOS }    from './hooks/useClawOS'
import type { Agent } from './types'

export default function App() {
  const [host, setHost] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [selected, setSelected] = useState<Agent | null>(null)

  const { agents, runtimes, peers, approvals, events, connected } =
    useClawOS(host, demoMode)

  const handleConnect = useCallback((h: string) => { setHost(h); setDemoMode(false) }, [])
  const handleDemo    = useCallback(() => { setDemoMode(true); setHost(null) }, [])

  const handleAvatarClick = useCallback((agent: Agent) => {
    setSelected(prev =>
      prev && (prev.session_id ?? prev.workspace_id) === (agent.session_id ?? agent.workspace_id)
        ? null : agent
    )
  }, [])

  const handleReset = useCallback(async (workspace_id: string) => {
    if (!host) return
    try {
      await fetch(`${host}/api/agents/${encodeURIComponent(workspace_id)}/reset`, { method: 'POST' })
    } catch (_) {}
    setSelected(null)
  }, [host])

  const showConnect = !host && !demoMode

  return (
    <>
      {/* 3D scene */}
      <div style={{ position: 'fixed', inset: 0 }}>
        <Office
          agents={agents}
          runtimes={runtimes}
          approvals={approvals}
          onAvatarClick={handleAvatarClick}
          selectedId={selected ? (selected.session_id ?? selected.workspace_id) : null}
        />
      </div>

      {showConnect && <ConnectPanel onConnect={handleConnect} onDemo={handleDemo} />}

      {(demoMode || host) && (
        <>
          <HUD
            runtimes={runtimes}
            connected={connected}
            demoMode={demoMode}
            agentCount={agents.filter(a => a.state !== 'offline').length}
          />
          <LiveFeed events={events} />
          <button
            onClick={() => { setHost(null); setDemoMode(false); setSelected(null) }}
            style={{
              position: 'fixed', bottom: 20, right: 278, zIndex: 60,
              background: 'rgba(6,8,16,0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              padding: '7px 14px', color: 'rgba(255,255,255,0.4)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ← Back
          </button>
        </>
      )}

      {selected && (
        <AvatarCard
          agent={selected}
          onClose={() => setSelected(null)}
          onReset={handleReset}
        />
      )}
    </>
  )
}