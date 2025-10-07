export interface Video {
  id: string;
  title: string;
  description: string | null;
  publicId: string;
  originalsize: string;
  compressedsize: string;
  duration: number | null;  // <-- required but nullable
  utility: string;
  createdAt: Date;
  updatedAt: Date;
}

