import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy',
  '/api/webhooks(.*)',
  '/api/ping',
  '/api/purge-deleted',
])

function isOwnerIndexHost(host: string): boolean {
  // TODO: remove localhost before deploying - for local testing only
  return host.includes('ownerindex.ai') || host.includes('ownerindex.localhost') || host.includes('localhost')
}

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get('host') ?? ''
  const isOwnerIndex = isOwnerIndexHost(host)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-is-owner-index', isOwnerIndex ? '1' : '0')

  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
