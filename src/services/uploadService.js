import api from './api'
import axios from 'axios'

const uploadService = {
  // Get presigned URL for upload
  async getPresignedUrl(filename, contentType) {
    const response = await api.post('/upload/presigned-url', {
      filename,
      content_type: contentType
    })
    
    return response.data // { upload_url, file_key, expires_in }
  },

  // Upload file to S3
  async uploadToS3(file, onProgress) {
    try {
      // Step 1: Get presigned URL
      const { upload_url, file_key } = await this.getPresignedUrl(
        file.name,
        file.type
      )
      
      // Step 2: Upload to S3 using presigned URL
      await axios.put(upload_url, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        }
      })
      
      // Step 3: Return the file key (S3 path)
      // Construct the full S3 URL
      const s3Url = `https://${import.meta.env.VITE_AWS_BUCKET_NAME || 'insightball-videos'}.s3.${import.meta.env.VITE_AWS_REGION || 'eu-west-3'}.amazonaws.com/${file_key}`
      
      return s3Url
      
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload video')
    }
  },

  // Get download URL for a file
  async getDownloadUrl(fileKey) {
    const response = await api.get(`/upload/download-url/${encodeURIComponent(fileKey)}`)
    return response.data.download_url
  }
}

export default uploadService
