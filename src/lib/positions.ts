export interface ZoneConfig {
  center: [number, number, number]
  size: [number, number]
  desks: [number, number, number][]
}

export const ZONES: Record<string, ZoneConfig> = {
  nexus: {
    center: [-6, 0, 4],
    size:   [9, 8],
    desks: [
      [-8, 0,  2], [-6, 0,  2], [-4, 0,  2],
      [-8, 0,  5], [-6, 0,  5], [-4, 0,  5],
    ],
  },
  picoclaw: {
    center: [-6, 0, -5],
    size:   [9, 6],
    desks: [
      [-8, 0, -4], [-6, 0, -4], [-4, 0, -4],
    ],
  },
  openclaw: {
    center: [6, 0, -3],
    size:   [9, 8],
    desks: [
      [4, 0, -5], [6, 0, -5], [8, 0, -5],
      [4, 0, -2], [6, 0, -2], [8, 0, -2],
    ],
  },
}

export const COMMON_AREA = {
  center: [0, 0, 2] as [number, number, number],
  radius: 3,
  meetPositions: [
    [-2, 0,  2], [ 2, 0,  2],
    [ 0, 0,  4], [ 0, 0,  0],
    [-2, 0,  0], [ 2, 0,  0],
  ] as [number, number, number][],
}

export function getDeskPosition(zone: string, index: number): [number, number, number] {
  const desks = ZONES[zone]?.desks ?? []
  return desks[index % desks.length] ?? ZONES[zone]?.center ?? [0, 0, 0]
}