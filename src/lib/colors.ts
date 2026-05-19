export interface ZoneTheme {
  primary: string
  dim: string
  border: string
  glow: string
  label: string
  icon: string
}

export const RT: Record<string, ZoneTheme> = {
  nexus: {
    primary: '#4f8ef7',
    dim:     'rgba(79,142,247,0.12)',
    border:  'rgba(79,142,247,0.3)',
    glow:    '#4f8ef755',
    label:   'Nexus',
    icon:    '⬡',
  },
  picoclaw: {
    primary: '#f59e0b',
    dim:     'rgba(245,158,11,0.12)',
    border:  'rgba(245,158,11,0.3)',
    glow:    '#f59e0b55',
    label:   'PicoClaw',
    icon:    '⚡',
  },
  openclaw: {
    primary: '#a78bfa',
    dim:     'rgba(167,139,250,0.12)',
    border:  'rgba(167,139,250,0.3)',
    glow:    '#a78bfa55',
    label:   'OpenClaw',
    icon:    '☁',
  },
}

export const AVATAR_PALETTE: string[] = [
  '#4f8ef7','#34d399','#f59e0b','#a78bfa',
  '#f87171','#38bdf8','#fb923c','#a3e635',
  '#e879f9','#2dd4bf',
]

export function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[h]
}