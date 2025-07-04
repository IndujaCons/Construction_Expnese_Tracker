'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (url: string) => void
  onFileRemove?: () => void
  currentFile?: string | null
  accept?: string
  maxSizeMB?: number
  className?: string
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  currentFile,
  accept = "image/*,.pdf",
  maxSizeMB = 10,
  className = ""
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)
    setUploading(true)

    try {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`)
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const data = await response.json()
      onFileSelect(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  }

  const isPDF = (url: string) => {
    return /\.pdf$/i.test(url)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current file display */}
      {currentFile && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isImage(currentFile) ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                  <img 
                    src={currentFile} 
                    alt="Receipt" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : isPDF(currentFile) ? (
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-xl">📄</span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">📎</span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Receipt attached</p>
                <p className="text-xs text-gray-500">
                  {isImage(currentFile) ? 'Image file' : isPDF(currentFile) ? 'PDF file' : 'File'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={currentFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View
              </a>
              {onFileRemove && (
                <button
                  type="button"
                  onClick={onFileRemove}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File upload area */}
      {!currentFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : uploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!uploading ? openFileSelector : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📎</div>
              <p className="text-sm font-medium text-gray-900">
                Drop receipt here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports images (JPEG, PNG, GIF, WebP) and PDF files up to {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  )
}