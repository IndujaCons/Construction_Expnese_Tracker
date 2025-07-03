import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getSession } from '../../lib/nextauth'

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json(
        { message: 'No file received' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const filepath = join(uploadsDir, filename)

    // Write file
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/receipts/${filename}`

    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        url: publicUrl,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}