import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; image: string } }
) {
  // Only work in development mode
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const { slug, image } = params
    
    // Construct the path to the image in the content directory
    const contentDir = join(process.cwd(), 'content', 'blogs', slug)
    const imagePath = join(contentDir, image)
    
    // Security check: ensure the path is within the expected directory
    if (!imagePath.startsWith(contentDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Check if file exists
    if (!existsSync(imagePath)) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // Read the file
    const imageBuffer = await readFile(imagePath)
    
    // Determine content type based on file extension
    const ext = image.split('.').pop()?.toLowerCase()
    let contentType = 'image/jpeg' // default
    
    switch (ext) {
      case 'png':
        contentType = 'image/png'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
    }
    
    // Return the image with appropriate headers
    return new NextResponse(imageBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour in development
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
