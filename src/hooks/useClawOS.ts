import { useEffect, useRef, useState, useCallback } from 'react'
import { DemoEngine } from '../lib/demo'
import { ZONES, getDeskPosition, COMMON_AREA } from '../lib/positions'
import type { Agent, RuntimeInfo, PeerInfo, Approval, FeedEvent, AgentState } from '../types'

const POLL_INTERVAL = 5000

interface EnrichedAgent extends Agent {}

function enrichAgents(rawAgents: Record<string, unknown>[], rawRuntimes: Record<string, RuntimeInfo>): EnrichedAgent[] {
  const nexusSessions = rawAgents ?? []
  return nexusSessions.map((a, i) => ({
    workspace_id: (a.workspace_id as string) ?? '',
    session_id: (a.session_id as string) ?? '',
    turn: (a.turn as number) ?? 0,
    model: (a.model as string) ?? 'local',
    zone:      'nexus',
    deskIndex: i,
    state:     ((a.state as AgentState) ?? ((a.turn as number) > 0 ? 'idle' : 'idle')) as AgentState,
  }))
}

function inferAgentState(agent: Agent, approvals: Approval[]): AgentState {
  const pendingForAgent = approvals.some(ap => ap.task_id && ap.workspace_id === agent.workspace_id)
  if (pendingForAgent) return 'pending_approval'
  return agent.state ?? 'idle'
}

const DEMO_RUNTIMES_INIT: Record<string, RuntimeInfo> = {
  nexus:    { installed: true, running: true,  model: 'qwen2.5:7b' },
  picoclaw: { installed: true, running: true,  model: 'local' },
  openclaw: { installed: true, running: true,  model: 'kimi-k2.5' },
}

export function useClawOS(host: string | null, demoMode: boolean) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [runtimes, setRuntimes] = useState<Record<string, RuntimeInfo>>({})
  const [peers, setPeers] = useState<PeerInfo[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [events, setEvents] = useState<FeedEvent[]>([])
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

  const wsRef = useRef<WebSocket | null>(null)
  const demoRef = useRef<DemoEngine | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushEvent = useCallback((e: FeedEvent) => setEvents(p => [e, ...p].slice(0, 120)), [])

  // ── Demo mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!demoMode) return

    const engine = new DemoEngine(update => {
      if (update.type === 'state') {
        const enriched = update.agents.map((a, i) => ({
          ...a,
          zone:      a.zone ?? 'nexus',
          deskIndex: a.deskIndex ?? i,
          state:     (a.state ?? 'idle') as AgentState,
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
  }, [demoMode, pushEvent])

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

        const raw = (agRes as Record<string, unknown>)?.sessions ?? []
        const rawArr = Array.isArray(raw) ? raw : []
        const enriched: Agent[] = rawArr.map((a: Record<string, unknown>, i: number) => ({
          workspace_id: (a.workspace_id as string) ?? '',
          session_id:   (a.session_id as string) ?? '',
          turn:         (a.turn as number) ?? 0,
          model:        (a.model as string) ?? 'local',
          zone:      'nexus' as string,
          deskIndex: i,
          state:     inferAgentState(a as unknown as Agent, (apRes as Approval[]) ?? []),
        }))

        // PicoClaw agent (always 1 if installed)
        if ((rtRes as Record<string, RuntimeInfo>)?.picoclaw?.installed) {
          enriched.push({
            workspace_id: 'picoclaw_worker',
            session_id:   'picoclaw',
            turn:         0,
            model:        'local',
            zone:         'picoclaw',
            deskIndex:    0,
            state:        (rtRes as Record<string, RuntimeInfo>).picoclaw.running ? 'idle' : 'offline',
          })
        }

        // OpenClaw peers as agents
        const peerList = ((prRes as Record<string, unknown>)?.peers ?? []) as PeerInfo[]
        peerList.forEach((p, i) => {
          enriched.push({
            workspace_id: p.name ?? `peer_${i}`,
            session_id:   p.url ?? `peer_${i}`,
            turn:         0,
            model:        'remote',
            zone:         'openclaw',
            deskIndex:    i,
            state:        'idle' as AgentState,
          })
        })

        setAgents(enriched)
        setRuntimes(rtRes as Record<string, RuntimeInfo> ?? {})
        setPeers(peerList)
        setApprovals((apRes as Approval[]) ?? [])
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
        ;(sock as unknown as Record<string, unknown>)._pingId = id
      }
      sock.onclose = () => {
        setConnected(false)
        clearInterval(Number((sock as unknown as Record<string, unknown>)._pingId))
        retryRef.current = setTimeout(connect, 3000)
      }
      sock.onerror = () => sock.close()
      sock.onmessage = ({ data }) => {
        let msg: Record<string, unknown>; try { msg = JSON.parse(data as string) } catch { return }
        pushEvent(msg as unknown as FeedEvent)

        if (msg.type === 'snapshot') {
          setApprovals(((msg.data as Record<string, unknown>)?.approvals ?? []) as Approval[])
          setRuntimes(((msg.data as Record<string, unknown>)?.services ?? {}) as Record<string, RuntimeInfo>)
        }
        if (msg.type === 'approval_pending')  setApprovals(p => [(msg.data as unknown) as Approval, ...p])
        if (msg.type === 'approval_resolved') setApprovals(p => p.filter(a => a.id !== (msg.data as Record<string, unknown>)?.approval_id as string))
        if (msg.type === 'task_update') {
          const data = msg.data as Record<string, unknown>
          setAgents(prev => prev.map(a => {
            if (a.workspace_id !== (data?.workspace as string)) return a
            const s = data?.status as string
            return { ...a, state: s === 'running' ? 'working' : s === 'completed' ? 'completed' : s === 'failed' ? 'completed' : a.state }
          }))
        }
      }
    }

    connect()
    return () => {
      clearInterval(pollId)
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [demoMode, host, pushEvent])

  return { agents, runtimes, peers, approvals, events, connected }
}