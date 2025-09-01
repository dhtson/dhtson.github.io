import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join the path segments
    const imagePath = params.path.join('/')
    
    // Construct the full path to the content directory
    const contentDir = join(process.cwd(), 'content')
    const fullImagePath = join(contentDir, imagePath)
    
    // Security check: ensure the path is within the content directory
    if (!fullImagePath.startsWith(contentDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Check if file exists
    if (!existsSync(fullImagePath)) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // Read the file
    const imageBuffer = await readFile(fullImagePath)
    
    // Determine content type based on file extension
    const ext = imagePath.split('.').pop()?.toLowerCase()
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
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
