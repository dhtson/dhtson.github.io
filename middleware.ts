import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only handle image requests in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  // Check if this is an image request for a blog post
  const blogImageMatch = pathname.match(/^\/blogs\/([^\/]+)\/(.+\.(png|jpg|jpeg|gif|webp|svg))$/i)
  
  if (blogImageMatch) {
    const [, slug, imageName] = blogImageMatch
    
    // Rewrite to serve from content directory
    const url = request.nextUrl.clone()
    url.pathname = `/api/content-images/${slug}/${imageName}`
    
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/blogs/:slug/:path*'
  ]
}
