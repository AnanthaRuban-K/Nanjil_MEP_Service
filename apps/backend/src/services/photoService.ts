// src/services/photo.ts
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export class PhotoService {
  private uploadDir = './uploads/photos'

  constructor() {
    this.ensureUploadDir()
  }

  private async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true })
    }
  }

  async uploadPhoto(file: File, bookingId: string): Promise<string> {
  try {
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${bookingId}-${timestamp}.${extension}`
    const filepath = path.join(this.uploadDir, filename)

    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Save file
    await writeFile(filepath, uint8Array)

    return `/uploads/photos/${filename}`
  } catch (error) {
    console.error('Photo upload failed:', error)
    throw new Error('Failed to upload photo')
  }
}

// Make return type match async
async getPhotoPath(filename: string): Promise<string> {
  return path.join(this.uploadDir, filename)
}
}