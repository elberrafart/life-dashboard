'use client'
import {
  PhaseHeader, Section, SubSection, Prose, Callout,
  TextField, TextArea, NumberedTextRow, Checkbox, Grid, Example,
} from './primitives'

export default function Phase3() {
  return (
    <div>
      <PhaseHeader
        eyebrow="Phase 3 · Weeks 8–16"
        title="Identity Anchors"
        anchor="The Man Who Executes"
        anchorSub="Phase 2 proved you can commit. Phase 3 is where you build unstoppable momentum and visible transformation."
      />

      {/* ── Intro ─────────────────────────────────────────────────── */}
      <Section title="What This Phase Is" emoji="⚡">
        <Prose>
          You&rsquo;ve passed the first 8 weeks. Your new identity is holding under
          normal conditions. Now we accelerate.
        </Prose>
        <Prose>Phase 3 is about:</Prose>
        <Callout kind="gold">
          <strong style={{ color: 'var(--text)' }}>Visible physique transformation</strong> — the world sees you&rsquo;re progressing.
          <br/><strong style={{ color: 'var(--text)' }}>Building evidence</strong> — undeniable proof you ARE this man.
          <br/><strong style={{ color: 'var(--text)' }}>Expanding beyond fitness</strong> — discipline bleeds into other life domains.
        </Callout>
        <Prose>
          This is where the compound effect kicks in. Your confidence builds
          because you have <strong style={{ color: 'var(--gold)' }}>proof</strong>.
        </Prose>
      </Section>

      {/* ── Requirements ───────────────────────────────────────── */}
      <Section title="Phase 3 Requirements" emoji="✅">
        <Checkbox fieldKey="p3.req.physique">
          <strong style={{ color: 'var(--text)' }}>Visible Physique Transformation</strong>
          <br/>Progress photos prove the change. Compare Week 1 vs Week 12-16.
          Others notice without you saying anything. Clothes fit differently.
          <br/><em style={{ color: 'var(--silver2)' }}>Standard: if your physique looks the same as Phase 1, something&rsquo;s wrong. Adjust with your coach.</em>
        </Checkbox>

        <Checkbox fieldKey="p3.req.prs">
          <strong style={{ color: 'var(--text)' }}>Strength PRs</strong>
          <br/>Hit 3+ personal records. Proves your training intensity is real,
          not just &ldquo;showing up.&rdquo; Celebrate every PR in your check-ins.
        </Checkbox>

        <Checkbox fieldKey="p3.req.evidence">
          <strong style={{ color: 'var(--text)' }}>Evidence List · 20+ proof points</strong>
          <br/>Specific moments you proved it (not just &ldquo;I no longer / I
          now&rdquo;). Record these in the Evidence List below. When doubt creeps
          in, you read this list. Proof kills doubt.
        </Checkbox>

        <Checkbox fieldKey="p3.req.vision">
          <strong style={{ color: 'var(--text)' }}>Update Your Visionary Sheet</strong>
          <br/>You&rsquo;ve evolved. Your original Sovereign Blueprint was written
          by a different version of you. Update theater of the mind (6→12 mo),
          target stats, secondary targets. Keeps the servo-mechanism locked on
          a moving target.
        </Checkbox>

        <Checkbox fieldKey="p3.req.domain">
          <strong style={{ color: 'var(--text)' }}>Add 1 Life Domain Beyond Fitness</strong>
          <br/>Financial · Professional · Relational · Mental. Pick one. Set a
          measurable goal. Execute for 8 weeks. Proves: &ldquo;I&rsquo;m not just a
          guy who works out. I&rsquo;m a man who executes across all domains.&rdquo;
        </Checkbox>
      </Section>

      {/* ── Strength PRs ───────────────────────────────────────── */}
      <Section title="Strength PRs Logged" emoji="🏋️">
        <Prose>Track the lifts and numbers. At least 3 by Week 16.</Prose>
        {[1, 2, 3, 4, 5].map(i => (
          <Grid key={i} cols={2}>
            <TextField fieldKey={`p3.pr.${i}.lift`} label={`PR ${i} · Lift`}   placeholder="e.g. Back Squat" />
            <TextField fieldKey={`p3.pr.${i}.change`} label="From → To"        placeholder="e.g. 225 → 255 lbs" />
          </Grid>
        ))}
      </Section>

      {/* ── Evidence List ──────────────────────────────────────── */}
      <Section title="Evidence List · 20+ proof points" emoji="📜">
        <Prose>
          Document specific moments you proved you ARE the new identity. Format:
          week number, then the moment.
        </Prose>
        <Example>&ldquo;Week 10: Trained at 5am despite sleeping 5 hours.&rdquo;</Example>
        <Example>&ldquo;Week 13: Friend said &lsquo;you look different, what are you doing?&rsquo;&rdquo;</Example>
        <Example>&ldquo;Week 15: Chose the gym over a last-minute happy hour invite.&rdquo;</Example>
        {Array.from({ length: 20 }, (_, i) => i + 1).map(i => (
          <NumberedTextRow
            key={i}
            index={i}
            fieldKey={`p3.evidence.${i}`}
            placeholder="Week X — …"
          />
        ))}
      </Section>

      {/* ── Updated Visionary Sheet ────────────────────────────── */}
      <Section title="Updated Visionary Sheet · 12-month vision" emoji="🔭">
        <Prose>
          Your original blueprint was written by a different you. Expand it.
        </Prose>

        <SubSection title="Theater of the Mind · 12 months from today">
          <TextArea
            fieldKey="p3.vision.theater"
            placeholder="Who are you 12 months from now? Physical, mental, how people respond to you, what you've built."
            rows={6}
          />
        </SubSection>

        <SubSection title="Target Stats · raise the bar if you're ahead of schedule">
          <Grid cols={2}>
            <TextField fieldKey="p3.vision.weight"   label="Weight"    placeholder="new target" />
            <TextField fieldKey="p3.vision.bodyFat"  label="Body Fat"  placeholder="new target" />
            <TextField fieldKey="p3.vision.waist"    label="Waist"     placeholder="new target" />
            <TextField fieldKey="p3.vision.other"    label="Other"     placeholder="lift PRs, arms, etc." />
          </Grid>
        </SubSection>

        <SubSection title="Secondary Targets · add a new life domain">
          <TextArea fieldKey="p3.vision.financial"    label="Financial"    placeholder="12-month target" rows={2} />
          <TextArea fieldKey="p3.vision.professional" label="Professional" placeholder="12-month target" rows={2} />
          <TextArea fieldKey="p3.vision.relational"   label="Relational"   placeholder="12-month target" rows={2} />
          <TextArea fieldKey="p3.vision.mental"       label="Mental"       placeholder="12-month target" rows={2} />
        </SubSection>
      </Section>

      {/* ── Life Domain Choice ─────────────────────────────────── */}
      <Section title="Life Domain · 8-week execution" emoji="🎯">
        <Prose>
          The discipline you built in the gym now shows up somewhere else. Pick
          one. Set a measurable goal. Execute for 8 weeks.
        </Prose>
        <TextField
          fieldKey="p3.domain.choice"
          label="Domain I'm focusing on"
          placeholder="Financial · Professional · Relational · Mental"
        />
        <TextArea
          fieldKey="p3.domain.goal"
          label="Specific, measurable 8-week goal"
          placeholder={`e.g. "I save $500/month" · "I read 20 minutes daily" · "I launch my side project by Week 16"`}
          rows={3}
        />
        <TextArea
          fieldKey="p3.domain.log"
          label="Weekly execution log"
          placeholder={`Week 9 — …\nWeek 10 — …\nWeek 11 — …`}
          rows={10}
          maxLen={8000}
        />
      </Section>

      {/* ── Weekly Identity Practice ───────────────────────────── */}
      <Section title="Weekly Identity Practice" emoji="📓">
        <Prose>Continue Phase 2&rsquo;s weekly questions, plus these three.</Prose>
        <TextArea
          fieldKey="p3.weekly.evidence"
          label="What evidence did I create this week?"
          placeholder={`Week 9 — …\nWeek 10 — …`}
          hint="Specific proof moment you ARE the new identity."
          rows={8}
          maxLen={6000}
        />
        <TextArea
          fieldKey="p3.weekly.outsideGym"
          label="Where did discipline show up outside the gym?"
          placeholder={`Week 9 — …\nWeek 10 — …`}
          hint="Proof it's transferring to other life areas."
          rows={8}
          maxLen={6000}
        />
        <TextArea
          fieldKey="p3.weekly.raised"
          label="What's one way I raised my standard this week?"
          placeholder={`Week 9 — …\nWeek 10 — …`}
          hint="You're not maintaining, you're ascending."
          rows={8}
          maxLen={6000}
        />
      </Section>
    </div>
  )
}
