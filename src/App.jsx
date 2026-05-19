import { useState, useCallback } from 'react'
import { Office }            from './scene/Office.jsx'
import { ConnectPanel }      from './ui/ConnectPanel.jsx'
import { HUD }               from './ui/HUD.jsx'
import { AvatarCard }        from './ui/AvatarCard.jsx'
import { LiveFeed }          from './ui/LiveFeed.jsx'
import { AgentStatusCards }  from './ui/AgentStatusCards.jsx'
import { ActionLog }         from './ui/ActionLog.jsx'
import { SettingsPanel }     from './ui/SettingsPanel.jsx'
import { useClawOS }         from './hooks/useClawOS.js'

export default function App() {
  const [host,          setHost]          = useState(null)
  const [demoMode,      setDemoMode]      = useState(false)
  const [selected,      setSelected]      = useState(null)
  const [settingsOpen,  setSettingsOpen]   = useState(false)
  const [dashSettings,  setDashSettings]  = useState(null)

  const { agents, runtimes, peers, approvals, events, connected } =
    useClawOS(host, demoMode)

  const handleConnect = useCallback(h => { setHost(h); setDemoMode(false) }, [])
  const handleDemo    = useCallback(() => { setDemoMode(true); setHost(null) }, [])

  const handleAvatarClick = useCallback(agent => {
    setSelected(prev =>
      prev && (prev.session_id ?? prev.workspace_id) === (agent.session_id ?? agent.workspace_id)
        ? null : agent
    )
  }, [])

  const handleReset = useCallback(async workspace_id => {
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
              position: 'fixed', bottom: 20, right: 610, zIndex: 60,
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

      {/* Agent Status Cards — Feature A */}
      {(demoMode || host) && agents.length > 0 && (
        <AgentStatusCards agents={agents} />
      )}

      {/* Action Log — Feature B */}
      {(demoMode || host) && events.length > 0 && (
        <ActionLog events={events} />
      )}

      {/* Settings gear button */}
      {(demoMode || host) && (
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          style={{
            position: 'fixed', top: 16, right: 272, zIndex: 60,
            background: 'rgba(6,8,16,0.7)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
            padding: '6px 10px', color: 'rgba(255,255,255,0.4)',
            fontSize: 16, cursor: 'pointer', lineHeight: 1,
          }}
        >
          ⚙
        </button>
      )}

      {/* Settings Panel — Feature C */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSettingsChange={setDashSettings}
      />

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
