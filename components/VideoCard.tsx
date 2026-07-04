'use client';
/**
 * TKAG-6: Training Academy — VideoCard component
 * Renders an individual video card with a responsive YouTube embed,
 * title, and description.
 */

import React from 'react';

interface VideoCardProps {
  videoId: string;
  title: string;
  description: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ videoId, title, description }) => {
  return (
    <article className="video-card">
      {/* Responsive 16:9 iframe wrapper */}
      <div className="video-card-wrapper">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <h3 className="video-card__title">{title}</h3>
      <p className="video-card__description">{description}</p>
    </article>
  );
};

export default VideoCard;