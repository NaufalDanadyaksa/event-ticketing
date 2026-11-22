/**
 * Helper utility to normalize backend asset / image URLs.
 * Handles relative upload paths, absolute URLs, and data URLs.
 */
export const getImageUrl = (path?: string | null): string => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return '';
  }

  const trimmed = path.trim();

  // If already absolute or data URL, return as-is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Prepend backend base URL
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:3000');

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendUrl}${cleanPath}`;
};

export default getImageUrl;
