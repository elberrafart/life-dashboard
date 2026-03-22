export type FloatingXP = {
  id: string
  xp: number
  x: number
  y: number
}

export type LevelUpData = {
  oldLevel: number
  newLevel: number
  goalId?: string
}

let floatingXPIdCounter = 0

export function createFloatingXP(xp: number, x: number, y: number): FloatingXP {
  return {
    id: `fxp-${++floatingXPIdCounter}`,
    xp,
    x,
    y,
  }
}

export function generateConfettiParticles(count = 40): Array<{
  id: number
  angle: number
  velocity: number
  rotation: number
  color: string
  delay: number
}> {
  const colors = ['#c9a84c', '#f0c060', '#b8b4ae', '#ffffff', '#d4cfc6']
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (Math.random() * 360 * Math.PI) / 180,
    velocity: 80 + Math.random() * 120,
    rotation: Math.random() * 720 - 360,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 200,
  }))
}

export const MOTIVATIONAL_QUOTES: Array<{ text: string; sub: string }> = [
  { text: 'The only way to do great work is to love what you do.', sub: '— Steve Jobs' },
  { text: 'Discipline is the bridge between goals and accomplishment.', sub: '— Jim Rohn' },
  { text: 'Small daily improvements are the key to staggering long-term results.', sub: '— Unknown' },
  { text: 'The secret of getting ahead is getting started.', sub: '— Mark Twain' },
  { text: 'Excellence is not a destination but a continuous journey.', sub: '— Brian Tracy' },
  { text: 'Your future is created by what you do today, not tomorrow.', sub: '— Robert Kiyosaki' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', sub: '— Robert Collier' },
  { text: 'The harder you work for something, the greater you feel when you achieve it.', sub: '— Unknown' },
  { text: 'Push yourself, because no one else is going to do it for you.', sub: '— Unknown' },
  { text: 'Great things never come from comfort zones.', sub: '— Unknown' },
  { text: 'Dream it. Wish it. Do it.', sub: '— Unknown' },
  { text: "Success doesn't just find you. You have to go out and get it.", sub: '— Unknown' },
  { text: 'The key to success is to focus on goals, not obstacles.', sub: '— Unknown' },
  { text: 'It always seems impossible until it is done.', sub: '— Nelson Mandela' },
  { text: 'Believe you can and you are halfway there.', sub: '— Theodore Roosevelt' },
  { text: 'Act as if what you do makes a difference. It does.', sub: '— William James' },
  { text: 'What you get by achieving your goals is not as important as what you become.', sub: '— Henry David Thoreau' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', sub: '— Eleanor Roosevelt' },
  { text: 'Life is 10% what happens to you and 90% how you react to it.', sub: '— Charles Swindoll' },
  { text: 'You are never too old to set another goal or to dream a new dream.', sub: '— C.S. Lewis' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', sub: '— Aristotle' },
  { text: 'Do not wait to strike till the iron is hot; make it hot by striking.', sub: '— William Butler Yeats' },
  { text: 'Energy and persistence conquer all things.', sub: '— Benjamin Franklin' },
  { text: 'With ordinary talent and extraordinary perseverance, all things are attainable.', sub: '— Thomas Buxton' },
  { text: 'The difference between a successful person and others is not lack of strength, not lack of knowledge, but rather lack in will.', sub: '— Vince Lombardi' },
  { text: 'Motivation gets you going. Discipline keeps you growing.', sub: '— John Maxwell' },
  { text: "Don't watch the clock; do what it does. Keep going.", sub: '— Sam Levenson' },
  { text: 'Winners are not people who never fail, but people who never quit.', sub: '— Edwin Louis Cole' },
  { text: 'The pain you feel today is the strength you feel tomorrow.', sub: '— Unknown' },
  { text: 'Either you run the day, or the day runs you.', sub: '— Jim Rohn' },
  { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', sub: '— C.S. Lewis' },
  { text: "You don't have to be great to start, but you have to start to be great.", sub: '— Zig Ziglar' },
  { text: 'A year from now you may wish you had started today.', sub: '— Karen Lamb' },
  { text: 'The only limit to our realization of tomorrow is our doubts of today.', sub: '— Franklin D. Roosevelt' },
  { text: "It's not about perfect. It's about effort. And when you bring that effort every single day, that's where transformation happens.", sub: '— Jillian Michaels' },
  { text: 'If you are not willing to risk the usual, you will have to settle for the ordinary.', sub: '— Jim Rohn' },
  { text: 'No matter how many mistakes you make or how slow you progress, you are still way ahead of everyone who isn\'t trying.', sub: '— Tony Robbins' },
  { text: 'Champions keep playing until they get it right.', sub: '— Billie Jean King' },
  { text: 'The secret of getting ahead is getting started.', sub: '— Mark Twain' },
  { text: 'You don\'t find the will to win. You bring it with you.', sub: '— Unknown' },
]

export function getDailyQuote(): { text: string; sub: string } {
  // Seed by year + day-of-year for true daily rotation
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / 86400000)
  const index = (dayOfYear + now.getFullYear() * 7) % MOTIVATIONAL_QUOTES.length
  return MOTIVATIONAL_QUOTES[index]
}
