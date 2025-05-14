import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export async function middleware(request) {
  const path = request.nextUrl.pathname
  
  // Public paths that don't require authentication
  if (path === '/' || path.startsWith('/api/auth/login')) {
    return NextResponse.next()
  }

  const token = cookies().get('token')?.value

  // No token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET)
    const { role } = decoded

    // Role-based access control
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (path.startsWith('/doctor') && role !== 'doctor') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (path.startsWith('/receptionist') && role !== 'receptionist') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('user', JSON.stringify(decoded))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/receptionist/:path*',
    '/api/:path*',
  ],
} 