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
import { loadState, saveState, getTodayKey } from './store'

export type FloatingXPItem = { id: string; xp: number; x: number; y: number }

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SET_PROFILE'; payload: { firstName: string; lastName: string; profileYear: string; tagline: string } }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
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

type AppContextType = {
  state: AppState
  dispatch: (action: Action) => void
  totalXP: number
  todayXP: number
  saveStatus: 'idle' | 'saving' | 'saved'
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
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, PLACEHOLDER_STATE)
  const [loaded, setLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [floatingXPs, setFloatingXPs] = useState<FloatingXPItem[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const s = loadState()
    dispatch({ type: 'SET_STATE', payload: s })
    setLoaded(true)
  }, [])

  // Autosave — triggers immediately on any action (100ms debounce to batch rapid changes)
  useEffect(() => {
    if (!loaded) return
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveState(state)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1200)
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
      dispatch,
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
