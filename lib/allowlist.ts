// Email access control — temporarily disabled.
// Uncomment to restrict signups to @insead.edu + exceptions.

// const ALLOWED_DOMAIN = 'insead.edu'

// const ALLOWED_EXCEPTIONS = new Set([
//   'ashton@ashtonjones.com.au',
//   'ashton.jones@iinet.net.au',
//   'ashton.jones@insead.edu',
//   'utkarshdubey3102@gmail.com',
//   'uad3105@gmail.com',
// ])

export function isEmailAllowed(_email: string): boolean {
  return true
}
