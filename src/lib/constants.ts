/**
 * Constants file for placeholder images and other app-wide constants
 */

// Placeholder image URLs - using reliable services that are already configured
export const PLACEHOLDER_IMAGES = [
  'https://placehold.co/1920x1080/1a1a1a/ffffff?text=Image+Not+Available',
  'https://placehold.co/1920x1080/2a2a2a/ffffff?text=Loading+Error',
  'https://placehold.co/1920x1080/3a3a3a/ffffff?text=Image+Failed',
  'https://placehold.co/1920x1080/4a4a4a/ffffff?text=Placeholder',
  'https://picsum.photos/1920/1080?random=1',
  'https://picsum.photos/1920/1080?random=2',
  'https://picsum.photos/1920/1080?random=3',
  'https://picsum.photos/1920/1080?random=4',
  'https://picsum.photos/1920/1080?random=5',
] as const;

// Default placeholder for images
export const DEFAULT_PLACEHOLDER_IMAGE = 'https://placehold.co/1920x1080/1a1a1a/ffffff?text=Image+Not+Available';

// Default placeholder for avatars
export const DEFAULT_AVATAR_PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/ffffff?text=User';

/**
 * Get a random placeholder image URL
 * @returns A random placeholder image URL
 */
export function getRandomPlaceholderImage(): string {
  const randomIndex = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
  return PLACEHOLDER_IMAGES[randomIndex];
}

/**
 * Get a placeholder image URL based on a seed (for consistent randomness)
 * @param seed - A seed value to generate consistent random selection
 * @returns A placeholder image URL
 */
export function getPlaceholderImageBySeed(seed: number | string): string {
  const index = typeof seed === 'string' 
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : seed;
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
}
