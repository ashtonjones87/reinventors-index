export interface ActionPlan {
  id: string
  created_at: string
  context_detected: string | null
  framework_explored: string | null
  core_tension: string | null
  practical_action: string
  open_questions: string | null
  shift_observed: string | null
}

export function formatPlanDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function escapeHTML(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function downloadActionPlanPDF(plan: ActionPlan): void {
  const date = formatPlanDate(plan.created_at)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(plan.framework_explored) || 'Action Plan'} \u2014 ${date}</title>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      max-width: 640px;
      margin: 48px auto;
      padding: 0 24px;
      color: #1a1a1a;
      line-height: 1.75;
    }
    h1 { font-size: 28px; color: #334a69; margin-bottom: 6px; line-height: 1.25; }
    .meta { color: #9CA3AF; font-size: 13px; margin-bottom: 40px; font-family: system-ui, sans-serif; }
    .section { margin-bottom: 28px; }
    .label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #9CA3AF;
      font-family: system-ui, sans-serif;
      margin-bottom: 8px;
    }
    .content { font-size: 16px; color: #1a1a1a; }
    .action-box {
      background: #F5F3EE;
      border-left: 3px solid #334a69;
      padding: 18px 22px;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      margin-top: 48px;
      border-top: 1px solid #E2DDD6;
      padding-top: 20px;
      font-size: 12px;
      color: #C4BFB8;
      font-family: system-ui, sans-serif;
    }
    @media print {
      body { margin: 20px auto; }
    }
  </style>
</head>
<body>
  <h1>${escapeHTML(plan.framework_explored) || 'Session Action Plan'}</h1>
  <p class="meta">${date}${plan.context_detected ? ` \u00b7 ${capitalize(escapeHTML(plan.context_detected))} journey` : ''}</p>
  ${plan.core_tension ? `<div class="section"><p class="label">Core Tension</p><p class="content">${escapeHTML(plan.core_tension)}</p></div>` : ''}
  <div class="section">
    <p class="label">Your Practical Action This Week</p>
    <div class="action-box"><p class="content">${escapeHTML(plan.practical_action)}</p></div>
  </div>
  ${plan.open_questions ? `<div class="section"><p class="label">Open Questions</p><p class="content">${escapeHTML(plan.open_questions)}</p></div>` : ''}
  ${plan.shift_observed ? `<div class="section"><p class="label">Shift Observed</p><p class="content">${escapeHTML(plan.shift_observed)}</p></div>` : ''}
  <div class="footer">The Reinventor\u2019s Mindset\u2122 \u00b7 reinventor.ai</div>
  <script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const w = window.open(url, '_blank', 'width=820,height=920')
  if (w) {
    // Revoke the object URL after the window has had time to load
    setTimeout(() => URL.revokeObjectURL(url), 15_000)
  }
}
