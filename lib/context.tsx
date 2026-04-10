'use client'
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useRef,
  ReactNode,
} from 'react'
import { AppState, Goal, Habit, KanbanCard, XPEvent, getLevelInfo } from './types'
import { loadState, loadStateAsync, saveState, loadImages, loadImagesAsync, getTodayKey } from './store'
import { syncProfile, loadUserState } from '@/app/actions/profiles'
import { initTheme } from './theme'

export type FloatingXPItem = { id: string; xp: number; x: number; y: number }

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SET_PROFILE'; payload: { firstName: string; lastName: string; profileYear: string; tagline: string } }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ARCHIVE_GOAL'; payload: string }
  | { type: 'ARCHIVE_KANBAN'; payload: string }
  | { type: 'RESTORE_GOAL'; payload: string }
  | { type: 'RESTORE_KANBAN'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_CHECKED'; payload: { key: string; xp: number } }
  | { type: 'ADD_XP_EVENT'; payload: XPEvent }
  | { type: 'ADD_KANBAN'; payload: KanbanCard }
  | { type: 'UPDATE_KANBAN'; payload: KanbanCard }
  | { type: 'DELETE_KANBAN'; payload: string }
  | { type: 'SET_VISION'; payload: { quoteText: string; quoteSub: string } }
  | { type: 'AWARD_GOAL_XP'; payload: { goalId: string; xp: number; event: XPEvent } }
  | { type: 'AWARD_HABIT_XP'; payload: { xp: number; event: XPEvent } }
  | { type: 'REMOVE_GOAL_XP'; payload: { goalId: string; xp: number } }
  | { type: 'REMOVE_HABIT_XP'; payload: { xp: number } }
  | { type: 'RESET_XP' }
  | { type: 'SAVE_JOURNAL'; payload: { date: string; text: string } }
  | { type: 'SAVE_MOOD'; payload: { date: string; mood: string } }
  | { type: 'SET_HIDE_FROM_LEADERBOARD'; payload: boolean }

type AppContextType = {
  state: AppState
  dispatch: (action: Action) => void
  totalXP: number
  todayXP: number
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  floatingXPs: FloatingXPItem[]
  awardGoalXP: (goalId: string, xp: number, emoji: string, description: string, x?: number, y?: number) => void
  awardHabitXP: (habitId: string, xp: number, label: string, x?: number, y?: number) => void
  removeGoalXP: (goalId: string, xp: number) => void
  removeHabitXP: (xp: number) => void
  triggerFloatingXP: (xp: number, x: number, y: number) => void
}

const AppContext = createContext<AppContextType | null>(null)

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE': return { ...action.payload }
    case 'SET_PLAYER_NAME': return { ...state, playerName: action.payload }
    case 'SET_PROFILE': {
      const { firstName, lastName, profileYear, tagline } = action.payload
      const playerName = [firstName, lastName].filter(Boolean).join(' ') || state.playerName
      return { ...state, firstName, lastName, profileYear, tagline, playerName }
    }
    case 'ADD_GOAL': return { ...state, goals: [...state.goals, action.payload] }
    case 'UPDATE_GOAL': return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) }
    case 'DELETE_GOAL': return { ...state, goals: state.goals.filter(g => g.id !== action.payload) }
    case 'ARCHIVE_GOAL': {
      const goal = state.goals.find(g => g.id === action.payload)
      if (!goal) return state
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload),
        goalArchive: [...(state.goalArchive ?? []), { ...goal, archivedAt: new Date().toISOString() }],
      }
    }
    case 'ARCHIVE_KANBAN': {
      const card = state.kanban.find(k => k.id === action.payload)
      if (!card) return state
      return {
        ...state,
        kanban: state.kanban.filter(k => k.id !== action.payload),
        kanbanArchive: [...(state.kanbanArchive ?? []), card],
      }
    }
    case 'RESTORE_GOAL': {
      const goal = (state.goalArchive ?? []).find(g => g.id === action.payload)
      if (!goal) return state
      return {
        ...state,
        goals: [...state.goals, { ...goal, archivedAt: undefined }],
        goalArchive: (state.goalArchive ?? []).filter(g => g.id !== action.payload),
      }
    }
    case 'RESTORE_KANBAN': {
      const card = (state.kanbanArchive ?? []).find(k => k.id === action.payload)
      if (!card) return state
      return {
        ...state,
        kanban: [...state.kanban, { ...card, column: 'todo' as const, xpAwarded: false, completedAt: undefined }],
        kanbanArchive: (state.kanbanArchive ?? []).filter(k => k.id !== action.payload),
      }
    }
    case 'ADD_HABIT': return { ...state, habits: [...state.habits, action.payload] }
    case 'UPDATE_HABIT': return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h) }
    case 'DELETE_HABIT': return { ...state, habits: state.habits.filter(h => h.id !== action.payload) }
    case 'TOGGLE_CHECKED': {
      const { key } = action.payload
      const newChecked = { ...state.checked }
      if (newChecked[key]) {
        delete newChecked[key]
      } else {
        newChecked[key] = true
      }
      return { ...state, checked: newChecked }
    }
    case 'ADD_XP_EVENT': return { ...state, xpFeed: [action.payload, ...state.xpFeed].slice(0, 100) }
    case 'ADD_KANBAN': return { ...state, kanban: [...state.kanban, action.payload] }
    case 'UPDATE_KANBAN': return { ...state, kanban: state.kanban.map(k => k.id === action.payload.id ? action.payload : k) }
    case 'DELETE_KANBAN': return { ...state, kanban: state.kanban.filter(k => k.id !== action.payload) }
    case 'SET_VISION': return { ...state, vision: action.payload }
    case 'AWARD_GOAL_XP': {
      const { goalId, xp, event } = action.payload
      return {
        ...state,
        goals: state.goals.map(g => g.id === goalId ? { ...g, xp: g.xp + xp } : g),
        xpFeed: [event, ...state.xpFeed].slice(0, 100),
      }
    }
    case 'AWARD_HABIT_XP': {
      const { xp, event } = action.payload
      return {
        ...state,
        habitXP: (state.habitXP ?? 0) + xp,
        xpFeed: [event, ...state.xpFeed].slice(0, 100),
      }
    }
    case 'REMOVE_GOAL_XP': {
      const { goalId, xp } = action.payload
      return {
        ...state,
        goals: state.goals.map(g => g.id === goalId ? { ...g, xp: Math.max(0, g.xp - xp) } : g),
      }
    }
    case 'REMOVE_HABIT_XP': {
      return {
        ...state,
        habitXP: Math.max(0, (state.habitXP ?? 0) - action.payload.xp),
      }
    }
    case 'RESET_XP': {
      return {
        ...state,
        goals: state.goals.map(g => ({ ...g, xp: 0 })),
        habitXP: 0,
        checked: {},
        xpFeed: [],
        kanban: state.kanban.map(k => ({ ...k, xpAwarded: false })),
      }
    }
    case 'SAVE_JOURNAL': {
      const { date, text } = action.payload
      return {
        ...state,
        journalEntries: { ...(state.journalEntries ?? {}), [date]: text },
      }
    }
    case 'SAVE_MOOD': {
      const { date, mood } = action.payload
      const current = state.moodLog?.[date]
      return {
        ...state,
        moodLog: { ...(state.moodLog ?? {}), [date]: current === mood ? '' : mood },
      }
    }
    case 'SET_HIDE_FROM_LEADERBOARD': return { ...state, hideFromLeaderboard: action.payload }
    default: return state
  }
}

const PLACEHOLDER_STATE: AppState = {
  playerName: '',
  firstName: '',
  lastName: '',
  profileYear: '',
  tagline: '',
  goals: [],
  habits: [],
  checked: {},
  kanban: [],
  xpFeed: [],
  vision: { quoteText: '', quoteSub: '' },
  habitHistory: {},
  streak: 0,
  lastCheckedDate: '',
  habitXP: 0,
  journalEntries: {},
  moodLog: {},
  goalArchive: [],
  kanbanArchive: [],
  hideFromLeaderboard: false,
}

export function AppProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [state, dispatch] = useReducer(reducer, PLACEHOLDER_STATE)
  const [loaded, setLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [floatingXPs, setFloatingXPs] = useState<FloatingXPItem[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track whether the user has dispatched actions before DB load finishes
  const userEditedRef = useRef(false)
  const dbLoadDoneRef = useRef(false)
  // Fingerprint of the last vision-image set we shipped to the server, so we
  // don't re-send images on every unrelated state change. Vision images can be
  // hundreds of KB each — sending them with every habit toggle blows past the
  // server-action body limit and slows the whole app down.
  const lastImagesFingerprintRef = useRef<string | null>(null)

  // Wrap dispatch to detect user edits during DB load
  const trackedDispatch = useCallback((action: Action) => {
    if (!dbLoadDoneRef.current && action.type !== 'SET_STATE') {
      userEditedRef.current = true
    }
    dispatch(action)
  }, [])

  // Load state on mount.
  //
  // Local-wins strategy: localStorage is the source of truth on this device.
  // The DB is only used as a fallback seed when localStorage is empty (fresh
  // device or cleared storage). This is correct for a single-user app and
  // prevents stale or partially-synced DB state from ever destroying local
  // progress on refresh. Cross-device sync would require per-field timestamps;
  // we don't have those yet, and the user works from one device.
  useEffect(() => {
    initTheme()
    // Show sync fallback for unencrypted legacy data instantly
    const syncState = loadState(userId)
    dispatch({ type: 'SET_STATE', payload: syncState })

    ;(async () => {
      try {
        // Decrypt localStorage state + images
        const [localState, localImages] = await Promise.all([
          loadStateAsync(userId),
          loadImagesAsync(userId),
        ])

        // Bail if user already started editing
        if (userEditedRef.current) return

        // Apply decrypted local state with images merged in
        if (localState !== syncState || Object.keys(localImages).length > 0) {
          const goalsWithImages = (localState.goals ?? []).map(g => ({
            ...g,
            visionImageBase64: localImages[g.id] ?? g.visionImageBase64,
          }))
          dispatch({
            type: 'SET_STATE',
            payload: { ...localState, goals: goalsWithImages },
          })
        }

        // If localStorage already has user data, it's authoritative — done.
        // The autosave loop will push it to the DB.
        const localHasData = (localState.goals?.length ?? 0) > 0
                          || (localState.habits?.length ?? 0) > 0
                          || (localState.kanban?.length ?? 0) > 0
        if (localHasData) return

        // Fresh local — seed from DB (new device, cleared storage, etc.)
        const { state: dbState, images: dbImages } = await loadUserState()
        if (userEditedRef.current) return
        if (dbState) {
          const seededGoals = (dbState.goals ?? []).map(g => ({
            ...g,
            visionImageBase64: dbImages?.[g.id] ?? g.visionImageBase64,
          }))
          dispatch({
            type: 'SET_STATE',
            payload: {
              ...PLACEHOLDER_STATE,
              ...dbState,
              goalArchive: dbState.goalArchive ?? [],
              kanbanArchive: dbState.kanbanArchive ?? [],
              goals: seededGoals,
            },
          })
        }
      } catch {
        // Any failure — local state is already shown, that's fine
      } finally {
        dbLoadDoneRef.current = true
        setLoaded(true)
      }
    })()
  }, [])

  // Autosave — triggers immediately on any action (100ms debounce to batch rapid changes)
  useEffect(() => {
    if (!loaded) return
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveState(state, userId)
      // Sync full state + key metrics to Supabase
      const totalXP = state.goals.reduce((s, g) => s + g.xp, 0) + (state.habitXP ?? 0)
      const visionImages: Record<string, string> = {}
      const goalsWithoutImages = state.goals.map(({ visionImageBase64, ...rest }) => {
        if (visionImageBase64) visionImages[rest.id] = visionImageBase64
        return rest
      })
      // Only ship vision images when the set has actually changed since the
      // last successful sync. Fingerprint by id + length so we detect adds,
      // removals, and replacements without serializing the whole base64 blob.
      const fingerprint = Object.keys(visionImages).sort()
        .map(id => `${id}:${visionImages[id].length}`)
        .join('|')
      const imagesChanged = fingerprint !== lastImagesFingerprintRef.current
      const appStateForDB = { ...state, goals: goalsWithoutImages }
      syncProfile({
        displayName: state.playerName,
        xpTotal: totalXP,
        streak: state.streak ?? 0,
        goals: state.goals.map(g => ({ id: g.id, name: g.name, emoji: g.emoji, category: g.category, xp: g.xp, taskCount: g.tasks.length })),
        habits: state.habits.map(h => ({ id: h.id, label: h.label })),
        journalDates: Object.keys(state.journalEntries ?? {}).filter(d => state.journalEntries[d]),
        // "Tasks done" in the admin view = Kanban "done" column + any goal
        // subtasks the user has checked off. Kept in the kanban_done column
        // to avoid a schema migration; the column name is now historical.
        kanbanDone:
          state.kanban.filter(k => k.column === 'done').length +
          state.goals.reduce((sum, g) => sum + g.tasks.filter(t => t.completedAt).length, 0),
        appState: appStateForDB as Parameters<typeof syncProfile>[0]['appState'],
        visionImages: imagesChanged ? visionImages : undefined,
      }).then(result => {
        if (result?.error) {
          setSaveStatus('error')
          setTimeout(() => setSaveStatus('idle'), 5000)
        } else {
          // Only record the fingerprint after a successful save, so a failed
          // sync doesn't trick us into skipping images on the retry.
          if (imagesChanged) lastImagesFingerprintRef.current = fingerprint
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 1200)
        }
      }).catch(() => {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 5000)
      })
    }, 100)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [state, loaded])

  const totalXP = state
    ? state.goals.reduce((sum, g) => sum + g.xp, 0) + (state.habitXP ?? 0)
    : 0

  const todayKey = getTodayKey()
  const todayXP = state
    ? Object.entries(state.checked)
        .filter(([key, val]) => val && key.startsWith(todayKey))
        .reduce((sum, [key]) => {
          const parts = key.split('_')
          if (parts[1] === 'h') {
            const habit = state.habits.find(h => h.id === parts[2])
            return sum + (habit?.xp ?? 0)
          }
          if (parts[1] === 't') {
            for (const goal of state.goals) {
              const task = goal.tasks.find(t => t.id === parts[2])
              if (task) return sum + task.xp
            }
          }
          return sum
        }, 0)
    : 0

  const triggerFloatingXP = useCallback((xp: number, x: number, y: number) => {
    const id = `fxp-${Date.now()}-${Math.random()}`
    const item: FloatingXPItem = { id, xp, x, y }
    setFloatingXPs(prev => [...prev, item])
    setTimeout(() => setFloatingXPs(prev => prev.filter(i => i.id !== id)), 1200)
  }, [])

  const awardGoalXP = useCallback((
    goalId: string,
    xp: number,
    emoji: string,
    description: string,
    x?: number,
    y?: number,
  ) => {
    if (!state) return
    const goal = state.goals.find(g => g.id === goalId)
    const event: XPEvent = {
      id: `xp-${Date.now()}`,
      emoji,
      description,
      xpAmount: xp,
      goalName: goal?.name,
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: 'AWARD_GOAL_XP', payload: { goalId, xp, event } })
    if (x !== undefined && y !== undefined) triggerFloatingXP(xp, x, y)
  }, [state, triggerFloatingXP])

  const awardHabitXP = useCallback((
    habitId: string,
    xp: number,
    label: string,
    x?: number,
    y?: number,
  ) => {
    const event: XPEvent = {
      id: `xp-${Date.now()}`,
      emoji: '⚡',
      description: `Habit: ${label}`,
      xpAmount: xp,
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: 'AWARD_HABIT_XP', payload: { xp, event } })
    if (x !== undefined && y !== undefined) triggerFloatingXP(xp, x, y)
  }, [triggerFloatingXP])

  const removeGoalXP = useCallback((goalId: string, xp: number) => {
    dispatch({ type: 'REMOVE_GOAL_XP', payload: { goalId, xp } })
  }, [])

  const removeHabitXP = useCallback((xp: number) => {
    dispatch({ type: 'REMOVE_HABIT_XP', payload: { xp } })
  }, [])

  if (!loaded) return null

  return (
    <AppContext.Provider value={{
      state,
      dispatch: trackedDispatch,
      totalXP,
      todayXP,
      saveStatus,
      floatingXPs,
      awardGoalXP,
      awardHabitXP,
      removeGoalXP,
      removeHabitXP,
      triggerFloatingXP,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { AppContext }
