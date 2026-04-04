import { useEffect, useRef, useState, useCallback } from 'react'
import { DemoEngine } from '../lib/demo.js'
import { ZONES, getDeskPosition, COMMON_AREA } from '../lib/positions.js'

const POLL_INTERVAL = 5000

function enrichAgents(rawAgents, rawRuntimes) {
  // Assign zone + desk + state to each agent
  const nexusSessions = rawAgents ?? []
  return nexusSessions.map((a, i) => ({
    ...a,
    zone:      'nexus',
    deskIndex: i,
    state:     a.state ?? (a.turn > 0 ? 'idle' : 'idle'),
  }))
}

function inferAgentState(agent, approvals) {
  const pendingForAgent = approvals.some(ap => ap.task_id && ap.workspace_id === agent.workspace_id)
  if (pendingForAgent) return 'pending_approval'
  return agent.state ?? 'idle'
}

const DEMO_RUNTIMES_INIT = {
  nexus:    { installed: true, running: true,  model: 'qwen2.5:7b' },
  picoclaw: { installed: true, running: true,  model: 'local' },
  openclaw: { installed: true, running: true,  model: 'kimi-k2.5' },
}

export function useClawOS(host, demoMode) {
  const [agents,    setAgents]    = useState([])
  const [runtimes,  setRuntimes]  = useState({})
  const [peers,     setPeers]     = useState([])
  const [approvals, setApprovals] = useState([])
  const [events,    setEvents]    = useState([])
  const [connected, setConnected] = useState(false)

  // Immediately sync state when demoMode turns on
  useEffect(() => {
    if (demoMode) {
      setConnected(true)
      setRuntimes(DEMO_RUNTIMES_INIT)
    } else if (!host) {
      setConnected(false)
      setRuntimes({})
      setAgents([])
    }
  }, [demoMode, host])

  const wsRef      = useRef(null)
  const demoRef    = useRef(null)
  const retryRef   = useRef(null)

  const pushEvent = useCallback(e => setEvents(p => [e, ...p].slice(0, 120)), [])

  // ── Demo mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!demoMode) return

    const engine = new DemoEngine(update => {
      if (update.type === 'state') {
        const enriched = update.agents.map((a, i) => ({
          ...a,
          zone:      a.zone ?? 'nexus',
          deskIndex: a.deskIndex ?? i,
          state:     a.state ?? 'idle',
        }))
        setAgents(enriched)
        setRuntimes(update.runtimes)
        setPeers(update.peers)
        setApprovals(update.approvals)
      } else if (update.type === 'demo_event') {
        pushEvent(update.event)
      }
    })

    demoRef.current = engine
    const init = engine.initialState
    setAgents(init.agents)
    setRuntimes(init.runtimes)
    setPeers(init.peers)
    setApprovals(init.approvals)
    setEvents(init.events)
    setConnected(true)
    engine.start()

    return () => engine.stop()
  }, [demoMode])

  // ── Live mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (demoMode || !host) return

    const base = host.replace(/\/$/, '')

    // REST poll
    async function poll() {
      try {
        const [agRes, rtRes, prRes, apRes] = await Promise.all([
          fetch(`${base}/api/agents`).then(r => r.json()),
          fetch(`${base}/api/runtimes`).then(r => r.json()),
          fetch(`${base}/api/peers`).then(r => r.json()),
          fetch(`${base}/api/approvals`).then(r => r.json()),
        ])
        setConnected(true)

        const raw = agRes.sessions ?? []
        const enriched = raw.map((a, i) => ({
          ...a,
          zone:      'nexus',
          deskIndex: i,
          state:     inferAgentState(a, apRes ?? []),
        }))

        // PicoClaw agent (always 1 if installed)
        if (rtRes?.picoclaw?.installed) {
          enriched.push({
            workspace_id: 'picoclaw_worker',
            session_id:   'picoclaw',
            turn:         0,
            model:        'local',
            zone:         'picoclaw',
            deskIndex:    0,
            state:        rtRes.picoclaw.running ? 'idle' : 'offline',
          })
        }

        // OpenClaw peers as agents
        const peerList = prRes?.peers ?? []
        peerList.forEach((p, i) => {
          enriched.push({
            workspace_id: p.name ?? `peer_${i}`,
            session_id:   p.url ?? `peer_${i}`,
            turn:         0,
            model:        'remote',
            zone:         'openclaw',
            deskIndex:    i,
            state:        'idle',
          })
        })

        setAgents(enriched)
        setRuntimes(rtRes ?? {})
        setPeers(peerList)
        setApprovals(apRes ?? [])
      } catch (_) {}
    }

    poll()
    const pollId = setInterval(poll, POLL_INTERVAL)

    // WebSocket
    function connect() {
      const proto = base.startsWith('https') ? 'wss' : 'ws'
      const wsUrl  = `${proto}://${base.replace(/^https?:\/\//, '')}/ws`
      const sock   = new WebSocket(wsUrl)
      wsRef.current = sock

      sock.onopen = () => {
        setConnected(true)
        const id = setInterval(() => sock.readyState === 1 && sock.send('ping'), 20000)
        sock._pingId = id
      }
      sock.onclose = () => {
        setConnected(false)
        clearInterval(sock._pingId)
        retryRef.current = setTimeout(connect, 3000)
      }
      sock.onerror = () => sock.close()
      sock.onmessage = ({ data }) => {
        let msg; try { msg = JSON.parse(data) } catch { return }
        pushEvent(msg)

        if (msg.type === 'snapshot') {
          setApprovals(msg.data?.approvals ?? [])
          setRuntimes(msg.data?.services ?? {})
        }
        if (msg.type === 'approval_pending')  setApprovals(p => [msg.data, ...p])
        if (msg.type === 'approval_resolved') setApprovals(p => p.filter(a => a.id !== msg.data?.approval_id))
        if (msg.type === 'task_update') {
          setAgents(prev => prev.map(a => {
            if (a.workspace_id !== msg.data?.workspace) return a
            const s = msg.data.status
            return { ...a, state: s === 'running' ? 'working' : s === 'completed' ? 'completed' : s === 'failed' ? 'completed' : a.state }
          }))
        }
      }
    }

    connect()
    return () => {
      clearInterval(pollId)
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [demoMode, host])

  return { agents, runtimes, peers, approvals, events, connected }
}
