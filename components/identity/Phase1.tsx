'use client'
import {
  PhaseHeader, Section, SubSection, Prose, Callout,
  TextField, TextArea, NumberedTextRow, Grid, Example, useWorkbook,
} from './primitives'

export default function Phase1() {
  const { getField } = useWorkbook()
  const commitmentName = getField('p1.commitment.name').trim() || 'Your Name'

  return (
    <div>
      <PhaseHeader
        eyebrow="Phase 1 · Weeks 0–4"
        title="The Identity Blueprint"
        anchor="I am becoming the man I've always said I would be."
        anchorSub="This is the foundation of your transformation. Not your training plan. Not your meal prep. Your identity."
      />

      {/* ── Intro blocks ─────────────────────────────────────────── */}
      <Section title="What This Is" emoji="🧭">
        <Prose>
          The Sovereign Blueprint is a psycho-cybernetic protocol that
          reprograms your self-image and activates your subconscious mind to
          automatically guide you toward the man you&rsquo;re becoming.
        </Prose>
        <Prose>
          Think of it as installing new software into your operating system.
          Your subconscious doesn&rsquo;t care about willpower or motivation.
          It only cares about one thing: <strong style={{ color: 'var(--gold)' }}>who you believe you are</strong>.
        </Prose>
        <Callout kind="gold">Change that belief → your actions change automatically.</Callout>
      </Section>

      <Section title="How This Works" emoji="⚙️">
        <SubSection title="Step 1 · Complete The Sovereign Blueprint (30–60 minutes)">
          <Prose>
            You&rsquo;ll define the old identity you&rsquo;re deleting, the new
            identity you&rsquo;re installing, and the mental movie your subconscious
            will play on repeat.
          </Prose>
        </SubSection>
        <SubSection title="Step 2 · Daily Reinforcement">
          <Prose>
            Morning and evening reinforcement that locks in your new self-image.
            No thinking required &mdash; just read, visualize, check the box.
          </Prose>
        </SubSection>
      </Section>

      <Section title="Why This Matters" emoji="🎯">
        <Prose>
          You&rsquo;ve tried the &ldquo;grind harder&rdquo; approach.
          It works&hellip; until it doesn&rsquo;t. This is different.
        </Prose>
        <Prose>
          When your subconscious accepts <em>&ldquo;I am the man who trains 5x/week&rdquo;</em> as fact,
          you don&rsquo;t need discipline anymore. You just show up. Because that&rsquo;s who you are.
        </Prose>
        <Callout kind="gold">Identity → Actions → Results. Not the other way around.</Callout>
      </Section>

      {/* ── VISIONARY SHEET ──────────────────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>
          Worksheet
        </div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 3, color: 'var(--text)' }}>
          The Visionary Sheet
        </div>
        <Prose>
          A declaration that programs your self-image, activates your
          subconscious mind, and locks in the identity of the man you are becoming.
        </Prose>
      </div>

      {/* 1. Self-Image Reprogramming */}
      <Section title="1. Self-Image Reprogramming">
        <SubSection title="The Identity I'm Deleting">
          <Prose>Write 3 traits/behaviors of your old self-image you are erasing from your mental hard drive.</Prose>
          <Example>&ldquo;I am the man who negotiates with his alarm clock.&rdquo;</Example>
          {[1, 2, 3].map(i => (
            <NumberedTextRow
              key={i}
              index={i}
              fieldKey={`p1.delete.${i}`}
              placeholder="I am the man who…"
            />
          ))}
        </SubSection>

        <SubSection title="The Identity I'm Installing">
          <Prose>
            Write 3 new traits/behaviors in <strong>present tense</strong> as if
            already true. Your subconscious doesn&rsquo;t distinguish between real and vividly imagined.
          </Prose>
          <Example>&ldquo;I am the man who trains even when I don&rsquo;t feel like it.&rdquo;</Example>
          {[1, 2, 3].map(i => (
            <NumberedTextRow
              key={i}
              index={i}
              fieldKey={`p1.install.${i}`}
              placeholder="I am the man who…"
            />
          ))}
        </SubSection>
      </Section>

      {/* 2. Theater of the Mind */}
      <Section title="2. Theater of the Mind (Mental Rehearsal)">
        <Prose>
          Close your eyes. See yourself 6 months from now. Make it detailed.
          Play this mental movie daily for 5 minutes.
        </Prose>

        <SubSection title="Physical State">
          <Grid cols={2}>
            <TextField fieldKey="p1.physical.weight"  label="Weight"            placeholder="e.g. 160 lbs" />
            <TextField fieldKey="p1.physical.bodyFat" label="Body Fat"          placeholder="e.g. 12%" />
            <TextField fieldKey="p1.physical.move"    label="How You Move"      placeholder="Confident, strong…" />
            <TextField fieldKey="p1.physical.clothes" label="How Clothes Fit"   placeholder="Tight, fitted…" />
          </Grid>
        </SubSection>

        <SubSection title="Mental / Emotional State">
          <TextField fieldKey="p1.mental.firstThought" label="First thought when you wake up" placeholder="I am a strong, capable, competent man…" />
          <TextField fieldKey="p1.mental.room"        label="How you feel walking into a room" placeholder="Confident" />
          <TextField fieldKey="p1.mental.dayEnergy"   label="Your energy throughout the day"   placeholder="Strong and capable" />
        </SubSection>
      </Section>

      {/* 3. Success Mechanism */}
      <Section title="3. Success Mechanism Activation">
        <Prose>
          Your subconscious is a servo-mechanism. Give it a clear target and it
          will find the path.
        </Prose>

        <SubSection title="Primary Target · Physique">
          <TextArea
            fieldKey="p1.primary.visualRef"
            label="Visual Reference"
            placeholder="Paste a link or describe in vivid detail."
            rows={3}
          />
          <Grid cols={2}>
            <TextField fieldKey="p1.primary.weight" label="Weight"  placeholder="e.g. 160 lbs" />
            <TextField fieldKey="p1.primary.waist"  label="Waist"   placeholder="e.g. 29 in" />
            <TextField fieldKey="p1.primary.other1" label="Other stat"  placeholder="e.g. chest, arms…" />
            <TextField fieldKey="p1.primary.other2" label="Other stat"  placeholder="e.g. bf%, lift PR…" />
          </Grid>
        </SubSection>

        <SubSection title="Secondary Targets · Life Domains">
          <TextField fieldKey="p1.secondary.financial"    label="Financial"    placeholder="e.g. $20k/month" />
          <TextField fieldKey="p1.secondary.relational"   label="Relational"   placeholder="e.g. close friend group, partner…" />
          <TextField fieldKey="p1.secondary.professional" label="Professional" placeholder="e.g. jobs lined up, consistent work…" />
        </SubSection>
      </Section>

      {/* 4. Daily Auto-Suggestion Protocol */}
      <Section title="4. Daily Auto-Suggestion Protocol">
        <SubSection title="Morning Imprint · First 10 Minutes Awake">
          <Callout kind="gold">
            Read aloud with emotion:<br/>
            <em style={{ color: 'var(--text)' }}>
              &ldquo;I am strong, competent, and capable. My subconscious mind is
              now directing me toward becoming better every day. Every action I
              take today reinforces the man I am becoming. My body is transforming.
              My mind is sharp. My discipline is absolute.&rdquo;
            </em>
          </Callout>
          <TextArea
            fieldKey="p1.morning.personalized"
            label="Personalize it (optional)"
            placeholder="Replace or extend the script with language that hits you harder."
            rows={4}
          />
        </SubSection>

        <SubSection title="Evening Rehearsal · Last 10 Minutes Before Sleep">
          <Prose>
            1) Review today&rsquo;s wins (proof of new identity) · 2) Replay mental
            movie (6-month vision) · 3) Set tomorrow&rsquo;s intention.
          </Prose>
          <TextField
            fieldKey="p1.evening.intention"
            label="Tomorrow I will…"
            placeholder="One sentence. Your subconscious processes this overnight."
          />
        </SubSection>
      </Section>

      {/* 5. Non-Negotiable Standards */}
      <Section title="5. Non-Negotiable Standards">
        <Prose>
          These aren&rsquo;t goals. These are identity statements that your
          subconscious accepts as fact.
        </Prose>

        <SubSection title="Physical Standards">
          <TextField fieldKey="p1.std.sleep"      label="Sleep"      placeholder="e.g. 8 hours nightly — non-negotiable" />
          <TextField fieldKey="p1.std.training"   label="Training"   placeholder="e.g. 4 sessions weekly — missed sessions don't exist in my reality" />
          <TextField fieldKey="p1.std.nutrition"  label="Nutrition"  placeholder="e.g. protein every meal, whole foods 80%+" />
        </SubSection>

        <SubSection title="Mental Standards">
          <TextField fieldKey="p1.std.morning"      label="Morning Routine"      placeholder="e.g. wake, teeth, breakfast, read" />
          <TextField fieldKey="p1.std.evening"      label="Evening Routine"      placeholder="e.g. shower, journal, sleep" />
          <TextField fieldKey="p1.std.weeklyReview" label="Weekly Review"        placeholder="e.g. every Sunday at 6 pm — locked in calendar" />
        </SubSection>

        <SubSection title="The 3 Absolutes">
          <Prose>
            The bare minimum that proves you&rsquo;re still this man, even on your worst day.
          </Prose>
          {[1, 2, 3].map(i => (
            <NumberedTextRow key={i} index={i} fieldKey={`p1.absolute.${i}`} placeholder="Non-negotiable #1…" />
          ))}
        </SubSection>
      </Section>

      {/* 6. Cost/Reward Equation */}
      <Section title="6. The Cost / Reward Equation">
        <SubSection title="What Changes If I Achieve This">
          <Prose>Be specific. Engage emotion. Your subconscious responds to feelings.</Prose>
          <TextArea fieldKey="p1.change.physically"  label="Physically"    placeholder="What will your body feel and look like?"  rows={2} />
          <TextArea fieldKey="p1.change.mentally"    label="Mentally"      placeholder="What's different in your head?"            rows={2} />
          <TextArea fieldKey="p1.change.socially"    label="Socially"      placeholder="How do people respond to you?"            rows={2} />
          <TextArea fieldKey="p1.change.financially" label="Financially"   placeholder="What opens up financially?"                rows={2} />
        </SubSection>

        <SubSection title="What I Lose If I Don't">
          <Prose>Pain is a stronger motivator than pleasure. Make it visceral.</Prose>
          <TextArea fieldKey="p1.lose.oneYear"     label="In 1 year"     placeholder="Where will you be?"              rows={2} />
          <TextArea fieldKey="p1.lose.fiveYears"   label="In 5 years"    placeholder="What becomes harder to fix?"     rows={2} />
          <TextArea fieldKey="p1.lose.deathbed"    label="On my deathbed" placeholder="What will you regret?"           rows={2} />
        </SubSection>
      </Section>

      {/* 7. Irrevocable Commitment */}
      <Section title="7. The Irrevocable Commitment">
        <Grid cols={2}>
          <TextField fieldKey="p1.commitment.name"      label="Your Name"      placeholder="Full name" />
          <TextField fieldKey="p1.commitment.date"      label="Date"           placeholder="e.g. 2026-02-22" />
          <TextField fieldKey="p1.commitment.signature" label="Signature"      placeholder="Sign" />
          <TextField fieldKey="p1.commitment.witness"   label="Witness (optional)" placeholder="Coach / accountability partner" />
        </Grid>
        <Callout kind="gold">
          <em style={{ color: 'var(--text)' }}>
            &ldquo;I, <strong style={{ color: 'var(--gold)' }}>{commitmentName}</strong>, declare that the man described
            above is not a goal &mdash; it is my current identity. My subconscious mind accepts
            this as truth. My actions will align automatically. There is no version of my
            future where I am not this man.&rdquo;
          </em>
        </Callout>
      </Section>

      {/* ── LETTER TO OLD SELF ───────────────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>
          Ritual · Journal
        </div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 3, color: 'var(--text)' }}>
          Letter to Your Old Self
        </div>
        <Prose>
          A ceremonial farewell to the identity that kept you small. This is not
          therapy. This is execution.
        </Prose>
      </div>

      <Section title="Why This Matters" emoji="🔥">
        <Prose>
          Your subconscious mind responds to ritual and ceremony. Writing this
          letter and sealing it sends a clear signal: <em>that man is dead. I am him now.</em>
        </Prose>
        <Prose>
          This isn&rsquo;t about blame or shame. It&rsquo;s about closure and release.
        </Prose>
      </Section>

      <Section title="Instructions" emoji="📝">
        <Prose>
          1. Write this letter by hand (if possible) or type it below.<br/>
          2. Be honest. Be specific. Be ruthless.<br/>
          3. When complete, either burn it, archive it in a sealed envelope, or
             save it here and never read it again.
        </Prose>
        <Callout>Set a 20-minute timer. Write without editing. Let it flow.</Callout>
      </Section>

      <Section title="The Letter" emoji="✉️">
        <TextArea
          fieldKey="p1.letter.oldSelf"
          placeholder={
`Dear [Your Name],

I'm writing this to tell you the truth about who you've been. Not to punish you, but to release you.

You were the man who:
• …

Here's what those choices cost you:
• …

But here's the truth: you did the best you could with the awareness you had. And now, you have more.

I forgive you for:
• …

And now, I'm done.
I'm not you anymore.

I am the man who:
• …

This is not a promise. This is a declaration.
You are gone. I remain.

Signed,
[Your Name]
[Today's Date]`
          }
          rows={20}
          maxLen={10000}
        />
      </Section>

      {/* ── 14 DAY RESET ─────────────────────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>
          Protocol
        </div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 3, color: 'var(--text)' }}>
          14-Day Identity Reset
        </div>
        <Prose>
          A step-by-step system to rebuild clarity and identity coherence.
          Best for feeling stuck, burned out, or disconnected — for when
          you&rsquo;re productive but not aligned.
        </Prose>
      </div>

      <Section title="Core Principle" emoji="🧠">
        <Callout kind="gold">
          Your identity shapes your behavior more than your goals ever will.
        </Callout>
        <Grid cols={2}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: '#f4b8ad', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>When identity is unclear</div>
            <ul style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
              <li>Discipline feels heavy</li>
              <li>Motivation comes in waves</li>
              <li>Progress collapses under pressure</li>
            </ul>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>When identity is clear</div>
            <ul style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
              <li>Decisions simplify</li>
              <li>Energy stabilizes</li>
              <li>Progress compounds</li>
            </ul>
          </div>
        </Grid>
      </Section>

      <Section title="Step 1 · Define the Next Version" emoji="1️⃣">
        <Prose>
          <strong>&ldquo;What is the next version of me trying to learn how to live?&rdquo;</strong><br/>
          Not the final version. Not perfection. Just the next evolution.
        </Prose>
        <TextArea
          fieldKey="p1.reset.step1.answer"
          label="Your answer"
          placeholder="Write freely. 3–5 sentences."
          rows={5}
        />
        <Example>The Balanced Builder · The Present Leader · The Calm Creator · The Grounded Professional · The Resilient Self</Example>
        <TextField
          fieldKey="p1.reset.step1.name"
          label="Name this next version (3–6 words)"
          placeholder="The _____ _____"
          width={360}
        />
      </Section>

      <Section title="Step 2 · Retire the Old Identity" emoji="2️⃣">
        <Prose>List the habits, patterns, behaviors, and mindsets you&rsquo;re retiring.</Prose>
        <TextArea
          fieldKey="p1.reset.step2.retiring"
          label="Version of me I'm retiring"
          placeholder={`• overworking to avoid feelings
• isolating
• people-pleasing
• emotional reactivity
• constant distraction`}
          rows={6}
        />
        <Callout kind="gold">
          <em>&ldquo;This version helped me survive. It is no longer in control.&rdquo;</em>
        </Callout>
      </Section>

      <Section title="Step 3 · Define the New Identity in Actions" emoji="3️⃣">
        <Prose>
          Write 5 statements in the format <em>&ldquo;I am the person who ____.&rdquo;</em>
          &nbsp;No adjectives (confident, disciplined, successful). Only observable behaviors.
        </Prose>
        {[1, 2, 3, 4, 5].map(i => (
          <NumberedTextRow
            key={i}
            index={i}
            fieldKey={`p1.reset.step3.${i}`}
            placeholder="I am the person who…"
          />
        ))}
        <Callout>Identity only installs when it&rsquo;s provable.</Callout>
      </Section>

      <Section title="Step 4 · Install a Simple Daily Structure" emoji="4️⃣">
        <Prose>Each day must include all three elements.</Prose>
        <TextField fieldKey="p1.reset.step4.production" label="Production"
          placeholder="Something that moves life forward — work, study, creation, execution." />
        <TextField fieldKey="p1.reset.step4.input"     label="Input"
          placeholder="Something that nourishes the mind — reading, walking, conversation, nature, art." />
        <TextField fieldKey="p1.reset.step4.connection" label="Connection"
          placeholder="One form of human / environmental contact." />
        <Callout kind="warn">
          If one of these is missing consistently, identity degrades.
        </Callout>
      </Section>

      <Section title="Step 5 · Daily Proof" emoji="5️⃣">
        <Prose>At the end of each day, write 3 short lines — no essays, just evidence.</Prose>
        <Callout kind="gold">
          1) One action that proved the new identity<br/>
          2) One moment the old identity showed up<br/>
          3) One adjustment for tomorrow
        </Callout>
        <TextArea
          fieldKey="p1.reset.step5.journal"
          label="Your daily-proof journal (append each day)"
          placeholder={`Day 1 (date) — …\nDay 2 (date) — …`}
          rows={10}
          maxLen={12000}
        />
      </Section>

      <Section title="Step 6 · Set One Non-Negotiable Rule" emoji="6️⃣">
        <Prose>
          Choose one rule you will not break for 14 days. One rule. Zero exceptions.
          This anchors the identity.
        </Prose>
        <TextField
          fieldKey="p1.reset.step6.rule"
          label="My one rule for 14 days"
          placeholder="e.g. I don't scroll before noon. I train or walk daily. I read for 20 minutes."
        />
      </Section>

      <Section title="Step 7 · Midpoint Check · Day 7" emoji="7️⃣">
        <Prose>No fixes yet — just awareness.</Prose>
        <TextArea fieldKey="p1.reset.step7.easier"   label="What feels easier?"      rows={3} />
        <TextArea fieldKey="p1.reset.step7.harder"   label="What feels harder?"      rows={3} />
        <TextArea fieldKey="p1.reset.step7.resisting" label="Where am I resisting change?" rows={3} />
        <TextArea fieldKey="p1.reset.step7.lessOf"   label="What do I need less of?" rows={3} />
      </Section>

      <Section title="Step 8 · Completion · Day 14" emoji="8️⃣">
        <Prose>One page answering the following. Then decide what to keep, discard, and evolve next.</Prose>
        <TextArea fieldKey="p1.reset.step8.internal"  label="What changed internally?"               rows={4} />
        <TextArea fieldKey="p1.reset.step8.stuck"     label="What habits stuck naturally?"           rows={4} />
        <TextArea fieldKey="p1.reset.step8.coherent"  label="What identity feels more 'me'?"         rows={4} />
        <TextArea fieldKey="p1.reset.step8.next"      label="Keep · Discard · Evolve — what's next?" rows={4} />
        <Callout kind="gold">The framework ends. The identity continues.</Callout>
      </Section>
    </div>
  )
}
