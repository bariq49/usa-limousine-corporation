const RELATIVE_TOLERANCE = 0.03;
const ABSOLUTE_FLOOR_MI = 0.3;

export function routeDrifted(quoted: number, current: number): boolean {
  const abs = Math.abs(current - quoted);
  if (quoted <= 0) {
    return abs > ABSOLUTE_FLOOR_MI;
  }
  return abs / quoted > RELATIVE_TOLERANCE && abs > ABSOLUTE_FLOOR_MI;
}
