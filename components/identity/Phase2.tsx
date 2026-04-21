'use client'
import {
  PhaseHeader, Section, SubSection, Prose, Callout,
  TextField, TextArea, NumberedTextRow, Checkbox, Grid, Example,
} from './primitives'

export default function Phase2() {
  return (
    <div>
      <PhaseHeader
        eyebrow="Phase 2 · Weeks 4–8"
        title="Identity Integration"
        anchor="The Man Who Commits"
        anchorSub="You are no longer testing the waters. You are ALL IN."
      />

      {/* ── Intro ─────────────────────────────────────────────────── */}
      <Section title="What This Phase Is" emoji="🧭">
        <Prose>
          Phase 1 was installation. Phase 2 is integration.
        </Prose>
        <Prose>
          Your new identity is software. Now we stress-test it under real-world
          conditions: fatigue, temptation, setbacks, life chaos.
        </Prose>
        <Callout kind="gold">
          The goal: prove that your new identity isn&rsquo;t dependent on perfect
          conditions. It holds even when shit gets hard.
        </Callout>
      </Section>

      {/* ── Requirements ───────────────────────────────────────── */}
      <Section title="Phase 2 Requirements" emoji="✅">
        <Prose>
          To complete this phase, you must demonstrate consistent identity
          execution over 8 weeks. Check each off as you earn it.
        </Prose>

        <Checkbox fieldKey="p2.req.compliance">
          <strong style={{ color: 'var(--text)' }}>Compliance Threshold</strong>
          <br/>Maintain 80%+ weekly compliance (nutrition, training, cardio) for
          8 consecutive weeks. Track in your Weekly Check-In. 3+ slip-ups = old
          identity creeping back.
        </Checkbox>

        <Checkbox fieldKey="p2.req.checkins">
          <strong style={{ color: 'var(--text)' }}>Zero Missed Check-Ins</strong>
          <br/>Submit 8/8 weekly check-ins on time. Your check-in IS the
          commitment. A missed check-in means you&rsquo;re negotiating with
          yourself again. This proves: &ldquo;I am the man who keeps his word.&rdquo;
        </Checkbox>

        <Checkbox fieldKey="p2.req.deathCert">
          <strong style={{ color: 'var(--text)' }}>Complete &ldquo;I No Longer&hellip;&rdquo; List</strong>
          <br/>Document 10+ old patterns you&rsquo;ve eliminated — your Identity
          Death Certificate (below). Proof the old you is gone.
        </Checkbox>

        <Checkbox fieldKey="p2.req.birthCert">
          <strong style={{ color: 'var(--text)' }}>Complete &ldquo;I Now&hellip;&rdquo; List</strong>
          <br/>Document 10+ new standards that are automatic — your Identity
          Birth Certificate (below). Proof the new you is real.
        </Checkbox>
      </Section>

      {/* ── Weekly Identity Practice ───────────────────────────── */}
      <Section title="Weekly Identity Practice" emoji="📓">
        <Prose>
          In addition to your standard check-in (weight, photos, compliance),
          answer these each week. Append weekly entries so you can re-read your
          own progression.
        </Prose>

        <TextArea
          fieldKey="p2.weekly.refused"
          label="What old pattern did I refuse this week?"
          placeholder={`Week 4 — …\nWeek 5 — …\nWeek 6 — …`}
          hint="Proof you're no longer the old identity."
          rows={8}
          maxLen={6000}
        />
        <TextArea
          fieldKey="p2.weekly.held"
          label="What new standard did I hold this week?"
          placeholder={`Week 4 — …\nWeek 5 — …`}
          hint="Proof you ARE the new identity."
          rows={8}
          maxLen={6000}
        />
        <TextArea
          fieldKey="p2.weekly.tested"
          label="What moment tested my identity, and how did I respond?"
          placeholder={`Week 4 — …\nWeek 5 — …`}
          hint="Stress-testing under pressure."
          rows={8}
          maxLen={6000}
        />
      </Section>

      {/* ── Week 4 Mid-Phase Check ─────────────────────────────── */}
      <Section title="Week 4 · Mid-Phase Check" emoji="🔎">
        <Prose>Halfway through. Target: 5+ entries in each certificate.</Prose>
        <Grid cols={2}>
          <TextField
            fieldKey="p2.mid.noLongerCount"
            label="# of 'I no longer' entries"
            placeholder="Target: 5+"
          />
          <TextField
            fieldKey="p2.mid.nowCount"
            label="# of 'I now' entries"
            placeholder="Target: 5+"
          />
        </Grid>
        <TextField
          fieldKey="p2.mid.complianceAvg"
          label="Compliance average so far"
          placeholder="e.g. 85%"
          width={200}
        />
        <TextArea
          fieldKey="p2.mid.biggestShift"
          label="Biggest identity shift you've noticed"
          placeholder="What feels different about who you are?"
          rows={4}
        />
      </Section>

      {/* ── Week 8 Phase Completion ────────────────────────────── */}
      <Section title="Week 8 · Phase Completion" emoji="🏁">
        <Prose>
          Final review. You move forward to Phase 3 only if the data says you&rsquo;re ready.
        </Prose>
        <Grid cols={2}>
          <TextField fieldKey="p2.week8.noLongerFinal" label="Final 'I no longer' count" placeholder="Need 10+" />
          <TextField fieldKey="p2.week8.nowFinal"      label="Final 'I now' count"      placeholder="Need 10+" />
        </Grid>
        <TextField
          fieldKey="p2.week8.complianceAvg"
          label="8-week compliance average"
          placeholder="e.g. 88%"
          width={200}
        />
        <TextArea
          fieldKey="p2.week8.physiqueChange"
          label="Physique change · Week 1 vs Week 8"
          placeholder="Compare photos. What's visibly different? Weight / waist / composition."
          rows={4}
        />
        <TextArea
          fieldKey="p2.week8.confirmation"
          label="Identity confirmation"
          placeholder="Read your 'I no longer' and 'I now' lists aloud. Do they feel TRUE? If yes, you're ready for Phase 3."
          rows={4}
        />
      </Section>

      {/* ── What Happens If You Slip ───────────────────────────── */}
      <Section title="What Happens If You Slip" emoji="⚠️">
        <SubSection title="Small Slip · 1-2 missed workouts, compliance 75%">
          <Callout>
            Normal. You&rsquo;re human. Document it in your check-in. Identify the
            trigger and pre-program a response for next time.
          </Callout>
        </SubSection>
        <SubSection title="Big Slip · Multiple missed check-ins, compliance &lt;70%">
          <Callout kind="warn">
            Red flag. Old identity is fighting back.
            <br/>Emergency call with your coach.
            <br/>Return to the 14-Day Protocol to reset.
          </Callout>
        </SubSection>
        <Callout kind="gold">
          The standard: progress, not perfection. But the trend must be upward.
        </Callout>
      </Section>

      {/* ── Identity Death Certificate ─────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>
          Ledger · Phase 2
        </div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 3, color: 'var(--text)' }}>
          Identity Death Certificate
        </div>
        <Prose>
          As you progress through Phase 2, add entries whenever you notice
          yourself refusing an old pattern. Format: <em>&ldquo;I no longer [specific
          behavior / pattern].&rdquo;</em> Minimum 10 entries by end of Week 8.
        </Prose>
      </div>

      <Section title="My 'I No Longer…' List" emoji="💀">
        <Example>&ldquo;I no longer hit snooze multiple times.&rdquo;</Example>
        <Example>&ldquo;I no longer eat like shit on weekends and start over Monday.&rdquo;</Example>
        {Array.from({ length: 15 }, (_, i) => i + 1).map(i => (
          <NumberedTextRow
            key={i}
            index={i}
            fieldKey={`p2.deathCert.${i}`}
            placeholder="I no longer…"
          />
        ))}
      </Section>

      {/* ── Identity Birth Certificate ─────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>
          Ledger · Phase 2
        </div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 3, color: 'var(--text)' }}>
          Identity Birth Certificate
        </div>
        <Prose>
          Document every new standard that&rsquo;s become automatic — not something
          you force, but something you ARE. Format: <em>&ldquo;I now [specific
          behavior / standard].&rdquo;</em> Minimum 10 entries by end of Week 8.
        </Prose>
      </div>

      <Section title="My 'I Now…' List" emoji="🌱">
        <Example>&ldquo;I now train 5x/week without thinking about it.&rdquo;</Example>
        <Example>&ldquo;I now say no to things that don&rsquo;t serve my standards.&rdquo;</Example>
        {Array.from({ length: 15 }, (_, i) => i + 1).map(i => (
          <NumberedTextRow
            key={i}
            index={i}
            fieldKey={`p2.birthCert.${i}`}
            placeholder="I now…"
          />
        ))}
      </Section>
    </div>
  )
}
