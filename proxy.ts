import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy',
  '/owner-privacy',
  '/api/webhooks(.*)',
  '/api/ping',
  '/api/purge-deleted',
])

function isOwnerIndexHost(host: string): boolean {
  return host.includes('ownerindex.ai') || host.includes('ownerindex.localhost') || host.includes('owner.reinventor.ai')
}

function isRetirementHost(host: string): boolean {
  return host.includes('retirementindex.ai') || host.includes('retirement.reinventor.ai')
}

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get('host') ?? ''

  const isOwnerIndex = isOwnerIndexHost(host)
  const isRetirement = isRetirementHost(host)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-is-owner-index', isOwnerIndex ? '1' : '0')
  requestHeaders.set('x-is-retirement', isRetirement ? '1' : '0')

  // Retirement domain is a marketing landing page only - root is public,
  // no auth required. CTAs link out to reinventor.ai.
  const path = request.nextUrl.pathname
  const isRetirementPublicPath = isRetirement && (path === '/' || path.startsWith('/_next') || path.startsWith('/api/ping'))

  if (!isPublicRoute(request) && !isRetirementPublicPath) {
    await auth.protect()
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.cookies.set('x_is_owner', isOwnerIndex ? '1' : '0', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
