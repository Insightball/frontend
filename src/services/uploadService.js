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

  // Upload file to S3 — retourne le file_key, pas une URL publique
  async uploadToS3(file, onProgress) {
    try {
      // Step 1: Get presigned URL
      const { upload_url, file_key } = await this.getPresignedUrl(
        file.name,
        file.type
      )

      // Step 2: Upload direct vers S3 (bypass Render — pas de timeout)
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

      // FIX — retourner le file_key uniquement
      // L'URL publique permanente est supprimée : le bucket est privé,
      // les accès se font via presigned download URLs générées à la demande
      return file_key

    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload video')
    }
  },

  // Get download URL for a file (presigned, expire après 1h)
  async getDownloadUrl(fileKey) {
    const response = await api.get(`/upload/download-url/${encodeURIComponent(fileKey)}`)
    return response.data.download_url
  }
}

export default uploadService
