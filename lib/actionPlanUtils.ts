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

// Replace em dash, en dash, and horizontal bar with a plain hyphen.
// The AI sometimes emits these despite prompt instructions, so we normalise
// at render time to guarantee none ever appear in the PDF.
function normalizeDashes(s: string): string {
  return s.replace(/[—–―]/g, '-')
}

function escapeHTML(s: string | null | undefined): string {
  if (!s) return ''
  return normalizeDashes(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Converts the raw action plan text (markdown-ish) to clean HTML for the PDF.
// Handles: **bold** inline, blank lines → paragraph breaks, plain lines → <p>
function actionPlanToHTML(text: string): string {
  const lines = normalizeDashes(text).split('\n')
  let html = ''
  for (const line of lines) {
    if (line.trim() === '') {
      html += '<br>'
      continue
    }
    // Strip ** for clean-text matching
    const cleanLine = line.replace(/\*\*/g, '')
    // Convert **bold** segments and strip any remaining orphaned **
    const formatted = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*\*/g, '')

    const labelMatch = cleanLine.match(/^your practical action this week\s*:?\s*/i)
    if (labelMatch) {
      // Render label as small caps header, then body text on the next line
      const remaining = escapeHTML(cleanLine.slice(labelMatch[0].length).trim())
      html += `<p class="action-label">Your Practical Action This Week</p>`
      if (remaining) html += `<p class="body-line">${remaining}</p>`
    } else if (/^day\s+\d/i.test(cleanLine)) {
      // Only the "Day X-Y - Label:" prefix is navy bold; content after colon is normal black
      const colonIdx = cleanLine.indexOf(':')
      const prefix = colonIdx !== -1 ? escapeHTML(cleanLine.slice(0, colonIdx + 1)) : escapeHTML(cleanLine)
      const rest = colonIdx !== -1 ? escapeHTML(cleanLine.slice(colonIdx + 1)) : ''
      html += `<p class="day-line"><strong>${prefix}</strong>${rest}</p>`
    } else {
      html += `<p class="body-line">${formatted}</p>`
    }
  }
  return html
}

export function downloadActionPlanPDF(plan: ActionPlan): void {
  const date = formatPlanDate(plan.created_at)

  // Domain-aware branding for the footer
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const isOwnerIndex = host.includes('ownerindex') || host.includes('owner.reinventor')
  const footerBrand = isOwnerIndex
    ? 'The Owner’s Index · ownerindex.ai'
    : 'The Reinventor’s Mindset™ · reinventor.ai'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(plan.framework_explored) || 'Action Plan'} \u00b7 ${date}</title>
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
      border-radius: 0 8px 8px 0;
      padding: 18px 22px;
    }
    .action-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #9CA3AF;
      font-family: system-ui, sans-serif;
      margin: 0 0 12px 0;
    }
    .body-line {
      font-size: 15px;
      color: #1a1a1a;
      margin: 0 0 6px 0;
      line-height: 1.75;
    }
    .day-line {
      font-size: 14px;
      color: #334a69;
      margin: 14px 0 4px 0;
      line-height: 1.65;
    }
    .day-line strong {
      font-weight: 700;
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
    <div class="action-box">${actionPlanToHTML(plan.practical_action)}</div>
  </div>
  ${plan.open_questions ? `<div class="section"><p class="label">Open Questions</p><p class="content">${escapeHTML(plan.open_questions)}</p></div>` : ''}
  ${plan.shift_observed ? `<div class="section"><p class="label">Shift Observed</p><p class="content">${escapeHTML(plan.shift_observed)}</p></div>` : ''}
  <div class="footer">${footerBrand}</div>
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
