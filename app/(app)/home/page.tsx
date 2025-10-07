// pages/index.tsx or your Home component file
"use client"

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import VideoCard from "@/components/VideoCard";
import { Video } from "@/types";

function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get("/api/videos");
      if (Array.isArray(response.data)) {
        // Normalize data to ensure type safety
        const normalizedVideos: Video[] = response.data.map((video: any) => ({
          id: video.id,
          title: video.title,
          description: video.description ?? "",
          publicId: video.publicId,
          originalsize: video.originalsize ?? "",
          compressedsize: video.compressedsize ?? "",
          duration: video.duration ?? null,
          utility: video.utility ?? "",
          createdAt: video.createdAt ? new Date(video.createdAt) : new Date(),
          updatedAt: video.updatedAt ? new Date(video.updatedAt) : new Date(),
        }));
        setVideos(normalizedVideos);
      } else {
        throw new Error("error 404");
      }
    } catch (error) {
      console.log(error);
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDownload = useCallback((url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_").toLowerCase()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // window.URL.revokeObjectURL(url); // only for blob URLs
  }, []);
  if(loading){
    return <div>loading...</div>
    
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && videos.length === 0 && <div>No videos found.</div>}
      <div className="grid grid-cols-1 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onDownload={handleDownload} />
        ))}
      </div>
    </div>
  );
}

export default Home;
