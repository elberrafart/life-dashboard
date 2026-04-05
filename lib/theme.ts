export const ACCENT_PRESETS = [
  { key: 'gold',    label: 'Gold',     gold: '#c9a84c', gold2: '#f0c060', glow: 'rgba(201,168,76,0.25)' },
  { key: 'teal',    label: 'Teal',     gold: '#2ab3b0', gold2: '#3dd5d2', glow: 'rgba(42,179,176,0.25)' },
  { key: 'purple',  label: 'Amethyst', gold: '#9b59b6', gold2: '#c39bd3', glow: 'rgba(155,89,182,0.25)' },
  { key: 'crimson', label: 'Crimson',  gold: '#c0392b', gold2: '#e74c3c', glow: 'rgba(192,57,43,0.25)' },
  { key: 'steel',   label: 'Steel',    gold: '#5d8aa8', gold2: '#82b1cb', glow: 'rgba(93,138,168,0.25)' },
  { key: 'emerald', label: 'Emerald',  gold: '#27ae60', gold2: '#2ecc71', glow: 'rgba(39,174,96,0.25)' },
] as const

export type AccentKey = (typeof ACCENT_PRESETS)[number]['key']

export function applyAccent(key: string): void {
  if (typeof window === 'undefined') return
  const preset = ACCENT_PRESETS.find(p => p.key === key) ?? ACCENT_PRESETS[0]
  const root = document.documentElement
  root.style.setProperty('--gold', preset.gold)
  root.style.setProperty('--gold2', preset.gold2)
  root.style.setProperty('--glow-gold', preset.glow)
}

export function setAccentPreference(key: string): void {
  localStorage.setItem('ea-accent', key)
  applyAccent(key)
}

export function applyCompact(enabled: boolean): void {
  if (typeof window === 'undefined') return
  document.documentElement.classList.toggle('compact', enabled)
}

export function setCompactPreference(enabled: boolean): void {
  localStorage.setItem('ea-compact', enabled ? '1' : '0')
  applyCompact(enabled)
}

export function getAccentPreference(): string {
  if (typeof window === 'undefined') return 'gold'
  return localStorage.getItem('ea-accent') ?? 'gold'
}

export function getCompactPreference(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('ea-compact') === '1'
}

export function initTheme(): void {
  applyAccent(getAccentPreference())
  applyCompact(getCompactPreference())
}
