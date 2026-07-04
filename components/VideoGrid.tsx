'use client';
/**
 * TKAG-6: Training Academy — VideoGrid component
 * Renders a responsive CSS grid of VideoCard components.
 */

import React from 'react';
import VideoCard from './VideoCard';

export interface Video {
  id: string;
  title: string;
  description: string;
}

interface VideoGridProps {
  videos: Video[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard
          key={video.id + video.title} // title included to keep keys unique when IDs are identical placeholders
          videoId={video.id}
          title={video.title}
          description={video.description}
        />
      ))}
    </div>
  );
};

export default VideoGrid;