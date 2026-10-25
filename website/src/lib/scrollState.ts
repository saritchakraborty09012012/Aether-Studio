export const scrollState = {
  /** overall page progress 0..1 */
  progress: 0,
  /** hero progress 0..1 */
  hero: 0,
  /** works horizontal progress 0..1 */
  works: 0,
  /** about 0..1 */
  about: 0,
  /** services 0..1 */
  services: 0,
  /** featured 0..1 */
  featured: 0,
  /** theme: 0 dark, 1 light */
  light: 0,
  /** after loader */
  ready: false,
  /** pointer parallax */
  px: 0,
  py: 0,
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
