// Email access control — no Clerk Pro required.
// All @insead.edu addresses are allowed, plus the specific exceptions below.

const ALLOWED_DOMAIN = 'insead.edu'

const ALLOWED_EXCEPTIONS = new Set([
  'ashton@ashtonjones.com.au',
  'ashton.jones@iinet.net.au',
  'ashton.jones@insead.edu',
  'utkarshdubey3102@gmail.com',
  'uad3105@gmail.com',
])

export function isEmailAllowed(email: string): boolean {
  const normalised = email.toLowerCase().trim()
  if (ALLOWED_EXCEPTIONS.has(normalised)) return true
  return normalised.endsWith(`@${ALLOWED_DOMAIN}`)
}
