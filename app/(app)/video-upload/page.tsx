"use client"

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const MAX_FILE_SIZE = 70 * 1024 * 1024 // 70 MB

const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [previewURL, setPreviewURL] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0]
    if (uploaded) {
      setFile(uploaded)
      setPreviewURL(URL.createObjectURL(uploaded))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      alert("File size is too large. Maximum allowed is 70 MB.")
      return
    }
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("description", description)
    formData.append("originalsize", file.size.toString()) // Correct key spelling

    try {
      // DO NOT set Content-Type header explicitly; Axios handles this
      const response = await axios.post("/api/video-upload", formData)
      alert("Video uploaded successfully!")
      router.push("/your-video-list-page") // Change to your route
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          // Try to parse HTML error as JSON if possible, otherwise show a generic error
          let errorMsg = ""
          if (typeof error.response.data === "string" && error.response.data.startsWith("<!DOCTYPE html")) {
            errorMsg = "Server error: Please check your backend logs. (Possible Prisma or server misconfiguration)"
          } else if (error.response.data.message) {
            errorMsg = error.response.data.message
          } else {
            errorMsg = JSON.stringify(error.response.data)
          }
          console.error("Backend error:", error.response.data)
          alert("Backend error: " + errorMsg)
        } else if (error.request) {
          alert("No response from server. Please check your network or backend.")
        } else {
          alert("Request error: " + error.message)
        }
      } else {
        alert("Unexpected error: " + String(error))
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Video Uploader</h1>
      <div style={styles.card}>
        <form style={styles.cardBody} onSubmit={handleSubmit}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            value={title}
            placeholder="Enter video title"
            required
            disabled={isUploading}
            style={styles.input}
            onChange={e => setTitle(e.target.value)}
          />

          <label style={styles.label}>Description</label>
          <textarea
            value={description}
            placeholder="Describe your video"
            required
            disabled={isUploading}
            style={styles.textarea}
            onChange={e => setDescription(e.target.value)}
          />

          <label style={styles.label}>Select a video file (max 70 MB)</label>
          <input
            type="file"
            accept="video/*"
            disabled={isUploading}
            onChange={handleFileChange}
            style={styles.inputFile}
          />

          {previewURL && (
            <video
              src={previewURL}
              controls
              style={styles.videoPreview}
            />
          )}

          {isUploading && <div style={styles.statusText}>Uploading...</div>}

          <button
            type="submit"
            disabled={isUploading}
            style={styles.uploadButton}
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 440,
    margin: '40px auto',
    padding: 16,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "bold",
    fontSize: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: 24,
    padding: 20,
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: 500,
    fontSize: 15,
  },
  input: {
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 6,
  },
  textarea: {
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    height: 80,
    resize: "vertical",
    marginBottom: 6,
  },
  inputFile: {
    fontSize: 15,
    margin: "8px 0 6px 0",
  },
  videoPreview: {
    width: "100%",
    maxHeight: "220px",
    borderRadius: 8,
    background: "#dce1e8",
    margin: "6px 0",
  },
  statusText: {
    color: "#0070f3",
    fontStyle: "italic",
    fontWeight: 500,
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: "#0070f3",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    border: "none",
    borderRadius: 6,
    padding: "10px 16px",
    cursor: "pointer",
    marginTop: 6,
    transition: "background-color 0.3s ease",
    minHeight: 41,
  },
}

export default VideoUpload