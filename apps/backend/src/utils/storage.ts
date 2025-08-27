// utils/storage.ts - File Storage Utilities (MinIO)
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!
  },
  forcePathStyle: true // Required for MinIO
})

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'nanjil-mep-files'

export async function uploadToStorage(fileName: string, file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: new Uint8Array(buffer),
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadDate: new Date().toISOString()
      }
    })

    await s3Client.send(command)
    
    // Return public URL
    return `${process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT}/${BUCKET_NAME}/${fileName}`
  } catch (error) {
    console.error('Storage upload error:', error)
    throw new Error('File upload failed')
  }
}

export async function deleteFromStorage(fileName: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('Storage delete error:', error)
    throw new Error('File deletion failed')
  }
}

export async function getSignedUploadUrl(fileName: string, contentType: string): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType
    })

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
  } catch (error) {
    console.error('Signed URL error:', error)
    throw new Error('Failed to generate upload URL')
  }
}