import React, { useState, useCallback, useEffect } from 'react';
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary';
import { Download, Clock, FileDown, FileUp } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { filesize } from 'filesize';
import { video } from '@/generated/prisma';  // lowercase 'video' type

dayjs.extend(relativeTime);

interface VideoCardProps {
  video: video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // All URL generation functions unchanged:
  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: 'fill',
      gravity: 'auto',
      format: 'jpg',
      quality: 'auto',
      assetType: 'video',
    });
  }, []);

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
      format: 'mp4',
      assetType: 'video',
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ['e_preview:duration_15:max_seg_9:min_seg_dur_1'],
      format: 'mp4',
      assetType: 'video',
    });
  }, []);

  // Convert string to number for filesize formatting
  const formatSize = useCallback((sizeStr?: string) => {
    const size = Number(sizeStr);
    if (!size || isNaN(size)) return '0 B';
    return filesize(size);
  }, []);

  // Duration is already Float in schema, can keep as number
  const formatDuration = useCallback((seconds?: number | null) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Safely parse size strings for calculations
  const originalSize = Number(video.originalsize);
  const compressedSize = Number(video.compressedsize);

  // Compression formula using number conversion
  const compressionPercentage =
    !isNaN(originalSize) &&
    !isNaN(compressedSize) &&
    originalSize > 0
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0;

  useEffect(() => {
    setPreviewError(false);
  }, [isHovered]);

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div
      className="w-full max-w-md rounded-lg shadow-lg border bg-white p-4 flex flex-col gap-3 hover:shadow-2xl transition-all outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
    >
      <div className="relative rounded overflow-hidden mb-2">
        {!previewError && isHovered ? (
          <video
            width={400}
            height={225}
            controls={false}
            autoPlay
            muted
            loop
            src={getPreviewVideoUrl(video.publicId)}
            className="w-full h-[225px] object-cover bg-black"
            onError={handlePreviewError}
            poster={getThumbnailUrl(video.publicId)}
          />
        ) : (
          <img
            src={getThumbnailUrl(video.publicId)}
            alt={`Thumbnail for ${video.title || 'Untitled Video'}`}
            className="w-full h-[225px] object-cover bg-gray-200"
            onError={handlePreviewError}
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-bold text-lg">{video.title || 'Untitled Video'}</div>
        <div className="text-sm text-gray-500">
          Uploaded {dayjs(video.createdAt).fromNow()}
        </div>
        <div className="flex flex-row gap-2 text-sm text-gray-600 items-center">
          <Clock size={16} />
          <span>Duration: {formatDuration(video.duration)}</span>
        </div>
        <div className="flex flex-row gap-2 text-sm text-gray-600 items-center">
          <FileDown size={16} />
          <span>Size: {formatSize(video.compressedsize)}</span>
        </div>
        <div className="flex flex-row gap-2 text-sm text-gray-600 items-center">
          <FileUp size={16} />
          <span>Compression: {compressionPercentage}%</span>
        </div>
      </div>
      <button
        className="mt-3 flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors outline-none"
        onClick={() => onDownload(getFullVideoUrl(video.publicId), video.title || 'Untitled Video')}
      >
        <Download size={18} />
        Download
      </button>
    </div>
  );
};

export default VideoCard;
