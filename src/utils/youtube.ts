const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export const extractYouTubeVideoId = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;

  if (YOUTUBE_ID_REGEX.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || '';
      return YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const watchId = url.searchParams.get('v') || '';
      if (YOUTUBE_ID_REGEX.test(watchId)) return watchId;

      const pathParts = url.pathname.split('/').filter(Boolean);
      const markerIndex = pathParts.findIndex((part) => part === 'embed' || part === 'shorts' || part === 'live');
      if (markerIndex !== -1) {
        const id = pathParts[markerIndex + 1] || '';
        return YOUTUBE_ID_REGEX.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const getYouTubeWatchUrl = (videoId: string): string => `https://www.youtube.com/watch?v=${videoId}`;
export const getYouTubeEmbedUrl = (videoId: string): string => `https://www.youtube.com/embed/${videoId}`;
export const getYouTubeThumbnailUrl = (videoId: string): string => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
