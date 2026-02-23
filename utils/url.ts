
export const formatUrl = (url: string): string => {
  if (!url) return '';
  let trimmed = url.trim();
  
  // Handle protocol-relative URLs (//example.com)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  
  // Check if it already has a protocol (http or https)
  // Case-insensitive check
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
};
