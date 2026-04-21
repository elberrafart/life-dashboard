'use client'
import {
  PhaseHeader, Section, SubSection, Prose, Callout,
  TextField, TextArea, NumberedTextRow, Checkbox, Grid,
} from './primitives'

const AUDIT_DOMAINS: { key: string; label: string; evidencePlaceholder: string }[] = [
  { key: 'physique',       label: 'Physique',       evidencePlaceholder: 'Photos, stats, lifts' },
  { key: 'health',         label: 'Health',         evidencePlaceholder: 'Sleep, energy, recovery, bloodwork' },
  { key: 'finances',       label: 'Finances',       evidencePlaceholder: 'Savings, income, debt' },
  { key: 'career',         label: 'Career',         evidencePlaceholder: 'Progress, satisfaction, growth' },
  { key: 'relationships',  label: 'Relationships',  evidencePlaceholder: 'Quality, depth, boundaries' },
  { key: 'mental',         label: 'Mental',         evidencePlaceholder: 'Clarity, peace, resilience' },
  { key: 'purpose',        label: 'Purpose',        evidencePlaceholder: 'Mission, direction, legacy' },
]

export default function Phase4() {
  return (
    <div>
      <PhaseHeader
        eyebrow="Phase 4 · Weeks 16+"
        title="Long-Term Sovereignty"
        anchor="The Man Who Leads"
        anchorSub="You're no longer 'becoming.' You ARE. This is where your identity becomes permanent and you step into leadership."
      />

      {/* ── Intro ─────────────────────────────────────────────────── */}
      <Section title="What This Phase Is" emoji="👑">
        <Prose>Phase 4 is about:</Prose>
        <Callout kind="gold">
          <strong style={{ color: 'var(--text)' }}>Sustaining transformation</strong> — keep Phase 3 results while setting new goals.
          <br/><strong style={{ color: 'var(--text)' }}>Public ownership</strong> — declare your standards to the world.
          <br/><strong style={{ color: 'var(--text)' }}>Leading by example</strong> — inspire / mentor others in your circle.
          <br/><strong style={{ color: 'var(--text)' }}>Building your code</strong> — personal laws you&rsquo;ll never break.
          <br/><strong style={{ color: 'var(--text)' }}>Future-casting</strong> — writing the next chapter of your life.
        </Callout>
        <Prose>
          This is where you shift from student to teacher, from follower to leader.
        </Prose>
      </Section>

      {/* ── Requirements ───────────────────────────────────────── */}
      <Section title="Phase 4 Requirements" emoji="✅">
        <Checkbox fieldKey="p4.req.maintainAdd">
          <strong style={{ color: 'var(--text)' }}>Maintain + Add</strong>
          <br/>Sustain all Phase 3 wins AND add a new goal. You don&rsquo;t lose
          ground — you expand. You&rsquo;re operating on multiple levels now.
        </Checkbox>

        <Checkbox fieldKey="p4.req.mentor">
          <strong style={{ color: 'var(--text)' }}>Mentor / Inspire 1 Person</strong>
          <br/>Your transformation is visible. Leverage it. Train with someone,
          share your lists, post publicly, or have a real conversation. Teaching
          locks in learning.
        </Checkbox>

        <Checkbox fieldKey="p4.req.letter">
          <strong style={{ color: 'var(--text)' }}>Write &ldquo;Letter to Future Self&rdquo;</strong>
          <br/>12 months out. Seal it. Open it in 12 months. This programs your
          subconscious for the next phase of evolution.
        </Checkbox>

        <Checkbox fieldKey="p4.req.code">
          <strong style={{ color: 'var(--text)' }}>Create Your &ldquo;Code of Conduct&rdquo;</strong>
          <br/>10 personal laws you&rsquo;ll never break. Your operating system.
          Post them where you see them daily.
        </Checkbox>

        <Checkbox fieldKey="p4.req.audit">
          <strong style={{ color: 'var(--text)' }}>Quarterly Sovereignty Audit</strong>
          <br/>Rate yourself 1-10 across all life domains. Anything below 7 =
          area of focus for next phase. Sovereignty = whole across every domain.
        </Checkbox>
      </Section>

      {/* ── Maintain + Add ─────────────────────────────────────── */}
      <Section title="Maintain + Add" emoji="➕">
        <SubSection title="What I'm maintaining from Phase 3">
          <TextArea
            fieldKey="p4.maintain.wins"
            placeholder="Physique results · strength levels · life domain discipline · 80%+ compliance"
            rows={5}
          />
        </SubSection>
        <SubSection title="What I'm adding">
          <TextArea
            fieldKey="p4.maintain.add"
            placeholder="New physique goal · new strength goal · new life domain (if you did finances, try relationships or career)"
            rows={5}
          />
        </SubSection>
      </Section>

      {/* ── Mentorship ─────────────────────────────────────────── */}
      <Section title="Lead Someone" emoji="🫂">
        <Prose>
          People are watching. Pick one person. Evidence that you inspired action.
        </Prose>
        <TextField
          fieldKey="p4.mentor.person"
          label="Who I'm leading"
          placeholder="Name · relationship"
        />
        <TextArea
          fieldKey="p4.mentor.how"
          label="How I'm leading"
          placeholder={`e.g. "Training with a friend 3x/week and holding him accountable"
e.g. "Shared my I-no-longer/I-now lists with my brother who's struggling"
e.g. "Posted my 6-month transformation on Instagram"`}
          rows={5}
        />
        <TextArea
          fieldKey="p4.mentor.proof"
          label="Evidence it landed"
          placeholder="Screenshot, voice note, a conversation. Proof you inspired action in someone else."
          rows={4}
        />
      </Section>

      {/* ── Letter to Future Self ──────────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>
          Ritual · Phase 4
        </div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 3, color: 'var(--text)' }}>
          Letter to Future Self
        </div>
        <Prose>
          You&rsquo;ve written to your old self (Phase 1). Now write to your future
          self. Seal it. Open it in 12 months.
        </Prose>
      </div>

      <Section title="The Letter" emoji="✉️">
        <Callout kind="gold">
          What to include: where you are now (physique, strength, life domains)
          · what you&rsquo;ve proven about yourself in 6 months · what you commit
          to achieving in the next 12 · the man you&rsquo;re becoming · standards
          you&rsquo;ll never compromise on · what you&rsquo;ll be able to do / be /
          have 12 months from now.
        </Callout>
        <TextArea
          fieldKey="p4.letter.futureSelf"
          placeholder={
`Dear [Your Name] · 12 months from now,

Where I am now:
• …

What I've proven about myself in the last 6 months:
• …

What I commit to achieving in the next 12 months:
• …

The man I'm becoming:
• …

Standards I will never compromise on:
• …

12 months from today, I will be able to:
• …

Signed,
[Your Name]
[Today's Date]`
          }
          rows={20}
          maxLen={10000}
        />
      </Section>

      {/* ── Code of Conduct ────────────────────────────────────── */}
      <Section title="My Code of Conduct · 10 personal laws" emoji="📜">
        <Prose>
          Non-negotiables. Lines you will not cross, no matter what. These
          become your operating system. Post them where you see them daily.
        </Prose>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(i => (
          <NumberedTextRow
            key={i}
            index={i}
            fieldKey={`p4.code.${i}`}
            placeholder="I never…"
          />
        ))}
      </Section>

      {/* ── Quarterly Sovereignty Audit ────────────────────────── */}
      <Section title="Quarterly Sovereignty Audit" emoji="🧭">
        <Prose>
          You&rsquo;ve focused heavily on physique. Now audit everything. Rate
          1-10 in each domain. Anything below 7 = area of focus for next phase.
        </Prose>
        {AUDIT_DOMAINS.map(d => (
          <div
            key={d.key}
            style={{
              padding: '12px 14px',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 2, color: 'var(--silver)', minWidth: 160 }}>
                {d.label}
              </div>
              <div style={{ width: 140 }}>
                <TextField fieldKey={`p4.audit.${d.key}.rating`} label="Rating · 1-10" placeholder="e.g. 7" />
              </div>
            </div>
            <TextArea
              fieldKey={`p4.audit.${d.key}.evidence`}
              label="Evidence"
              placeholder={d.evidencePlaceholder}
              rows={2}
            />
          </div>
        ))}
        <Callout kind="gold">
          Sovereignty: not just being lean and strong, but whole across every domain.
        </Callout>
      </Section>

      {/* ── Weekly Identity Practice ───────────────────────────── */}
      <Section title="Weekly Identity Practice" emoji="📓">
        <Prose>Continue previous weekly questions, plus these three.</Prose>
        <TextArea
          fieldKey="p4.weekly.led"
          label="How did I lead this week?"
          placeholder={`Week 17 — …\nWeek 18 — …`}
          hint="Proof you're stepping into leadership — even if it's just leading yourself."
          rows={8}
          maxLen={6000}
        />
        <TextArea
          fieldKey="p4.weekly.code"
          label="Did I live by my Code of Conduct? Which laws were tested?"
          placeholder={`Week 17 — …\nWeek 18 — …`}
          rows={8}
          maxLen={6000}
        />
        <TextArea
          fieldKey="p4.weekly.reactions"
          label="What's the biggest identity shift I've noticed in others' reactions to me?"
          placeholder={`Week 17 — …\nWeek 18 — …`}
          hint="How are people treating you differently?"
          rows={8}
          maxLen={6000}
        />
      </Section>

      {/* ── What Happens If You Slip ───────────────────────────── */}
      <Section title="What Happens If You Slip" emoji="⚠️">
        <SubSection title="You lose Phase 3 results">
          <Callout kind="warn">
            Emergency protocol: return to Phase 2 standards. Identify what broke
            down — compliance? recovery? life stress? — and request coach
            intervention.
          </Callout>
        </SubSection>
        <SubSection title="You struggle to lead / mentor">
          <Callout>
            That&rsquo;s okay. Leadership is learned. Start smaller — post your
            story, share your lists. You don&rsquo;t need to be perfect to inspire
            others, just honest.
          </Callout>
        </SubSection>
        <SubSection title="Your audit reveals low scores">
          <Callout kind="gold">
            Good. Awareness is the first step. Pick 1 domain under 7 and set a
            30-day goal. You can&rsquo;t fix everything at once, but you can
            improve one thing.
          </Callout>
        </SubSection>
      </Section>
    </div>
  )
}
