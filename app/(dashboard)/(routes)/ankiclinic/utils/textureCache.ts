import { BaseTexture, Texture, Rectangle } from 'pixi.js';

// Cache for storing loaded textures
const textureCache = new Map<string, Texture>();
const baseTextureCache = new Map<string, BaseTexture>();

// Add a new function to preload all textures
export const preloadTextures = (imageSources: string[]): Promise<void> => {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalImages = imageSources.length;
    
    // If no images to load, resolve immediately
    if (totalImages === 0) {
      resolve();
      return;
    }
    
    // Load each image
    imageSources.forEach(src => {
      if (!textureCache.has(src)) {
        const texture = Texture.from(src);
        textureCache.set(src, texture);
        
        // Check if texture is already loaded
        if (texture.baseTexture.valid) {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        } else {
          // Add load event for textures that aren't loaded yet
          texture.baseTexture.once('loaded', () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              resolve();
            }
          });
          
          // Handle load errors
          texture.baseTexture.once('error', () => {
            console.error(`Failed to load texture: ${src}`);
            loadedCount++;
            if (loadedCount === totalImages) {
              resolve();
            }
          });
        }
      } else {
        // Texture already in cache
        loadedCount++;
        if (loadedCount === totalImages) {
          resolve();
        }
      }
    });
  });
};

export const getTexture = (src: string): Texture => {
  if (!textureCache.has(src)) {
    textureCache.set(src, Texture.from(src));
  }
  return textureCache.get(src)!;
};

export const getBaseTexture = (src: string): BaseTexture => {
  if (!baseTextureCache.has(src)) {
    baseTextureCache.set(src, BaseTexture.from(src));
  }
  return baseTextureCache.get(src)!;
};

export const getSpriteSheetTexture = (
  baseTexture: BaseTexture,
  frame: number,
  directionIndex: number,
  spriteWidth: number,
  spriteHeight: number
): Texture => {
  const cacheKey = `${baseTexture.cacheId}-${frame}-${directionIndex}`;
  
  if (!textureCache.has(cacheKey)) {
    const sourceX = directionIndex * spriteWidth;
    const sourceY = frame * spriteHeight;
    
    textureCache.set(
      cacheKey,
      new Texture(
        baseTexture,
        new Rectangle(sourceX, sourceY, spriteWidth, spriteHeight)
      )
    );
  }
  
  return textureCache.get(cacheKey)!;
};

// Clean up textures when they're no longer needed
export const cleanupTextures = () => {
  textureCache.forEach(texture => texture.destroy());
  baseTextureCache.forEach(baseTexture => baseTexture.destroy());
  textureCache.clear();
  baseTextureCache.clear();
}; 