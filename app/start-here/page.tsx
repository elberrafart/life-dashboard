export default function StartHerePage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        .sh-heading {
          font-family: var(--font-bebas);
          letter-spacing: 4px;
          color: var(--text);
          text-transform: uppercase;
        }
        .sh-section-label {
          font-family: var(--font-bebas);
          font-size: 13px;
          letter-spacing: 4px;
          color: var(--text3);
          text-transform: uppercase;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sh-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .sh-body { font-size: 14px; color: var(--text2); line-height: 1.7; }
        .sh-body strong { color: var(--text); font-weight: 600; }
        .sh-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 12px; }
        .sh-list > li { font-size: 14px; color: var(--text2); line-height: 1.6; }
        .sh-list > li > strong { color: var(--text); }
        .sh-sublist { margin: 6px 0 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
        .sh-sublist > li { font-size: 13px; color: var(--text3); line-height: 1.55; }
        .sh-link {
          color: var(--gold);
          text-decoration: none;
          border-bottom: 1px solid rgba(245,197,24,0.35);
          transition: border-color 150ms, color 150ms;
        }
        .sh-link:hover { color: #ffd84d; border-bottom-color: var(--gold); }
        .sh-cred-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .sh-cred-label {
          font-family: var(--font-dm); font-weight: 700;
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--text3);
          min-width: 80px;
        }
        .sh-cred-value {
          font-family: 'SF Mono', Menlo, monospace;
          font-size: 13px;
          color: var(--text2);
          flex: 1;
        }
        .sh-cred-empty { color: var(--text3); font-style: italic; font-family: var(--font-dm); }
        .sh-note {
          margin-top: 16px;
          padding: 12px 14px;
          background: rgba(245,197,24,0.06);
          border: 1px solid rgba(245,197,24,0.25);
          border-radius: 8px;
          font-size: 12px;
          color: var(--silver);
          line-height: 1.6;
        }
      `}</style>

      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <div className="sh-heading" style={{ fontSize: 36, lineHeight: 1 }}>START HERE</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6, fontFamily: 'var(--font-dm)' }}>
          Onboarding · Watch · Set up · Book your first call
        </div>
      </div>

      {/* Welcome video */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          marginBottom: 36,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: '#000',
        }}
      >
        <iframe
          src="https://www.loom.com/embed/50756d86202a4ba0b59ae4bfee82bd3a"
          title="Welcome video"
          allow="fullscreen"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>

      {/* Welcome section */}
      <section style={{ marginBottom: 40 }}>
        <div className="sh-section-label">Welcome</div>
        <div className="sh-body" style={{ fontFamily: 'var(--font-dm)' }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 3, color: 'var(--text)', marginBottom: 14, lineHeight: 1.15 }}>
            WELCOME TO ELITE <span style={{ color: 'var(--gold)' }}>ACTION</span> COACHING
          </div>
          <p style={{ margin: '0 0 14px 0' }}>
            After watching the introduction video, be sure to complete the onboarding steps and schedule a call with Andrew directly for your first 1-1 <strong>Growth session</strong>.
          </p>
          <p style={{ margin: 0 }}>
            We&rsquo;re excited to help you build your dream physique, design your lifestyle, and evolve in every aspect.
          </p>
        </div>
      </section>

      {/* Training App + Login */}
      <section style={{ marginBottom: 40 }}>
        <div className="sh-section-label">Training App Download &amp; Login</div>
        <div className="card" style={{ padding: '20px 22px' }}>
          <p className="sh-body" style={{ margin: '0 0 16px 0' }}>
            Download the app:{' '}
            <a
              href="https://apps.apple.com/ca/app/kahunas/id1638377758"
              target="_blank"
              rel="noopener noreferrer"
              className="sh-link"
            >
              Kahunas on the App Store →
            </a>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="sh-cred-row">
              <span className="sh-cred-label">Username</span>
              <span className="sh-cred-value sh-cred-empty">provided by Andrew</span>
            </div>
            <div className="sh-cred-row">
              <span className="sh-cred-label">Password</span>
              <span className="sh-cred-value sh-cred-empty">provided by Andrew</span>
            </div>
          </div>
          <div className="sh-note">
            Your Kahunas login will be sent to you directly. Reach out on WhatsApp if you haven&rsquo;t received it within 24 hours of your first call.
          </div>
        </div>
      </section>

      {/* Weekly Check-In */}
      <section style={{ marginBottom: 40 }}>
        <div className="sh-section-label">Weekly Check-In (Form Submission)</div>
        <div className="sh-body" style={{ fontFamily: 'var(--font-dm)' }}>
          <p style={{ margin: '0 0 18px 0' }}>
            Every week, you&rsquo;ll complete a short <strong>check-in form</strong> inside Kahunas. Fill it out <strong>every [day of week] by [time]</strong>.
          </p>
          <p style={{ margin: '0 0 14px 0', color: 'var(--silver)' }}>You&rsquo;ll report on:</p>
          <ol className="sh-list">
            <li>
              <strong>Progress Data</strong>
              <ul className="sh-sublist">
                <li>Morning weight (average if possible).</li>
                <li>Compliance % (nutrition, training, cardio).</li>
              </ul>
            </li>
            <li>
              <strong>Photos</strong>
              <ul className="sh-sublist">
                <li>Front / side / back, shirtless, consistent lighting.</li>
              </ul>
            </li>
            <li>
              <strong>Wins</strong>
              <ul className="sh-sublist">
                <li>Top 1–2 things you executed well this week.</li>
              </ul>
            </li>
            <li>
              <strong>Struggles</strong>
              <ul className="sh-sublist">
                <li>Where you fell short, slipped, or had challenges.</li>
              </ul>
            </li>
            <li>
              <strong>Questions</strong>
              <ul className="sh-sublist">
                <li>Anything you want me to cover in my Loom feedback.</li>
              </ul>
            </li>
            <li>
              <strong>Vital Markers</strong>
              <ul className="sh-sublist">
                <li>Tracking your digestion, energy, recovery, and sleep.</li>
              </ul>
            </li>
          </ol>
        </div>
      </section>

      {/* Coach Feedback */}
      <section style={{ marginBottom: 16 }}>
        <div className="sh-section-label">➡️ Coach Feedback (My Loom Response)</div>
        <div className="sh-body" style={{ fontFamily: 'var(--font-dm)' }}>
          <ul className="sh-list">
            <li>
              Within <strong>24–48 hours</strong> of your check-in, I&rsquo;ll record a <strong>private Loom video</strong> for you.
            </li>
            <li>
              In the Loom I&rsquo;ll cover:
              <ul className="sh-sublist">
                <li>Progress breakdown (weight / photos).</li>
                <li>Adjustments (training, nutrition, cardio).</li>
                <li>Wins reinforced, struggles addressed.</li>
                <li>Action steps for the next week.</li>
              </ul>
            </li>
            <li>
              This will be sent directly to you in <strong>Kahunas messages</strong>.
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
