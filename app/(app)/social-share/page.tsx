'use client';

import { CldImage } from 'next-cloudinary';
import React, { useEffect, useState, useRef } from 'react';

const socialFormats = {
  'Instagram Square (1:1)': { width: 1080, height: 1080, aspectRatio: '1:1' },
  'Instagram Portrait (4:5)': { width: 1200, height: 1500, aspectRatio: '4:5' },
  'Twitter Post (16:9)': { width: 1200, height: 675, aspectRatio: '16:9' },
  'Twitter Header (3:1)': { width: 1500, height: 500, aspectRatio: '3:1' },
  'Facebook Cover (205:78)': { width: 2050, height: 780, aspectRatio: '205:78' },
};

type SocialFormat = keyof typeof socialFormats;

export default function Socialshare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>('Instagram Square (1:1)');
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
      const timer = setTimeout(() => setIsTransforming(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedFormat, uploadedImage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/image-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      setUploadedImage(data.publicId);
    } catch (error: any) {
      alert(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current) return;
    fetch(imageRef.current.src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedFormat.replace(/\s+/g, '_').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div style={styles.bg}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>Social Media Image Creator</h1>
        <div style={styles.section}>
          <label style={styles.label}>Upload an Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading || isTransforming}
            style={styles.fileInput}
          />
          {isUploading && (
            <div style={styles.spinnerContainer}>
              <div style={styles.spinner}></div>
              <span style={styles.statusText}>Uploading image...</span>
            </div>
          )}
        </div>

        {uploadedImage && (
          <div style={styles.section}>
            <label htmlFor="format-select" style={styles.label}>
              Select Format
            </label>
            <select
              id="format-select"
              onChange={(e) => setSelectedFormat(e.target.value as SocialFormat)}
              value={selectedFormat}
              disabled={isUploading || isTransforming}
              style={styles.select}
            >
              {Object.keys(socialFormats).map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>

            <div style={styles.previewArea}>
              {isTransforming ? (
                <div style={styles.spinnerContainer}>
                  <div style={styles.spinner}></div>
                  <span style={styles.statusText}>Transforming image...</span>
                </div>
              ) : (
                <CldImage
                  width={socialFormats[selectedFormat].width}
                  height={socialFormats[selectedFormat].height}
                  src={uploadedImage}
                  alt="Uploaded"
                  ref={imageRef}
                  style={styles.image}
                  crop="fill"
                  gravity="auto"
                  quality="auto"
                />
              )}
            </div>
            <button
              onClick={handleDownload}
              disabled={isUploading || isTransforming}
              style={{
                ...styles.downloadButton,
                ...(isUploading || isTransforming ? styles.downloadButtonDisabled : {}),
              }}
            >
              Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #181f2a 0%, #232946 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    background: '#232946',
    borderRadius: 18,
    boxShadow: '0 6px 32px rgba(0,0,0,0.18)',
    padding: '32px 24px',
    maxWidth: 420,
    width: '100%',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  title: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 28,
    color: '#fff',
    letterSpacing: 0.5,
  },
  section: {
    background: '#1a1a2e',
    borderRadius: 12,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.13)',
  },
  label: {
    fontWeight: 600,
    fontSize: 16,
    color: '#eaeaea',
    letterSpacing: 0.2,
  },
  fileInput: {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #2d3a4a',
    fontSize: 15,
    background: '#232946',
    color: '#fff',
  },
  select: {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #2d3a4a',
    fontSize: 15,
    background: '#232946',
    color: '#fff',
    width: '100%',
  },
  previewArea: {
    margin: '18px 0 12px 0',
    minHeight: 180,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#232946',
    borderRadius: 10,
    padding: 12,
    position: 'relative',
    border: '1px solid #2d3a4a',
  },
  image: {
    maxWidth: '100%',
    maxHeight: 260,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.17)',
    background: '#232946',
    border: '1px solid #2d3a4a',
  },
  statusText: {
    color: '#b8c1ec',
    fontStyle: 'italic',
    fontWeight: 500,
    marginLeft: 12,
    fontSize: 15,
  },
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 40,
  },
  spinner: {
    width: 22,
    height: 22,
    border: '3px solid #2d3a4a',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  downloadButton: {
    marginTop: 10
  }}
  
