import { BaseTexture, Texture, Rectangle } from 'pixi.js';

// Cache for storing loaded textures
const textureCache = new Map<string, Texture>();
const baseTextureCache = new Map<string, BaseTexture>();

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