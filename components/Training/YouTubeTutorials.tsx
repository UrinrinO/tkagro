'use client';
/**
 * TKAG-28: Training Academy — Static YouTube tutorials grid
 * Video IDs are placeholder values; replace with actual T.kays Agrocosmetics content.
 */

import React, { useState } from 'react';
import type { YouTubePlaceholder } from '../../types/training';
import styles from './YouTubeTutorials.module.css';

// Placeholder YouTube video IDs — replace with actual brand content
const YOUTUBE_VIDEOS: YouTubePlaceholder[] = [
  { videoId: 'dQw4w9WgXcQ', title: 'Natural Skincare Routine with Botanical Ingredients' },
  { videoId: 'ScMzIvxBSi4', title: 'Understanding Agrocosmetics: Farm to Face' },
  { videoId: 'kJQP7kiw5Fk', title: 'DIY Hair Mask with Natural Oils' },
  { videoId: '9bZkp7q19f0', title: 'Balanced Wellness: Holistic Beauty Tips' },
];

interface YouTubeEmbedProps {
  video: YouTubePlaceholder;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ video }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`;

  return (
    <div className={styles.embedWrapper}>
      {!isLoaded ? (
        /* Lazy-load: show thumbnail until user clicks to avoid performance hit */
        <button
          className={styles.thumbnailButton}
          onClick={() => setIsLoaded(true)}
          aria-label={`Play video: ${video.title}`}
        >
          <img
            src={thumbnailUrl}
            alt={video.title}
            className={styles.thumbnailImg}
            loading="lazy"
          />
          <div className={styles.playOverlay} aria-hidden="true">
            <div className={styles.playIcon}>▶</div>
          </div>
        </button>
      ) : (
        <iframe
          className={styles.iframe}
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
      <p className={styles.videoTitle}>{video.title}</p>
    </div>
  );
};

const YouTubeTutorials: React.FC = () => {
  return (
    <section className={styles.section} aria-labelledby="youtube-heading">
      <div className={styles.header}>
        <h2 id="youtube-heading" className={styles.heading}>
          Free Tutorials
        </h2>
        <p className={styles.subheading}>
          Watch our expert guides on natural beauty and agrocosmetics
        </p>
      </div>

      <div className={styles.grid}>
        {YOUTUBE_VIDEOS.map((video) => (
          <YouTubeEmbed key={video.videoId} video={video} />
        ))}
      </div>
    </section>
  );
};

export default YouTubeTutorials;