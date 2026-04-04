// World layout — top-down view
// Nexus zone: front-left, PicoClaw: back-left, OpenClaw: back-right
// Common Area: center

export const ZONES = {
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
  center: [0, 0, 2],
  radius: 3,
  // Positions around the ring where agents gather
  meetPositions: [
    [-2, 0,  2], [ 2, 0,  2],
    [ 0, 0,  4], [ 0, 0,  0],
    [-2, 0,  0], [ 2, 0,  0],
  ],
}

export function getDeskPosition(zone, index) {
  const desks = ZONES[zone]?.desks ?? []
  return desks[index % desks.length] ?? ZONES[zone]?.center ?? [0, 0, 0]
}
