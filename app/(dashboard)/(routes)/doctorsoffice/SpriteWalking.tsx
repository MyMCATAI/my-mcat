import React from 'react';

interface SpriteWalkingProps {
  spriteSheet: string;
  position: { x: number; y: number };
  character: 1 | 2 | 3;
  direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  scale: number;
}

class SpriteWalking extends React.Component<SpriteWalkingProps> {
  private static spriteImage: HTMLImageElement | null = null;
  private static frame = 0;
  private static lastUpdateTime = 0;

  private static spriteWidth = 13;
  private static spriteHeight = 17;
  private static frameHeight = 24;
  private static directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  static drawSprite(
    ctx: CanvasRenderingContext2D, 
    spriteSheet: string, 
    position: { x: number; y: number }, 
    character: number, 
    direction: string,
    scale: number
  ) {
    if (!this.spriteImage) {
      this.spriteImage = new Image();
      this.spriteImage.src = spriteSheet;
    }

    if (!this.spriteImage.complete) return;

    const currentTime = Date.now();
    if (currentTime - this.lastUpdateTime > 200) {
      this.frame = (this.frame + 1) % 3;
      this.lastUpdateTime = currentTime;
    }

    const directionIndex = this.directions.indexOf(direction);
    const characterOffset = (character - 1) * (3 * this.frameHeight + 25);
    const sourceX = directionIndex * (this.spriteWidth + 3);
    const sourceY = 23 + characterOffset + this.frame * this.frameHeight;

    // Increase the size of the sprite
    const sizeFactor = 4; // Adjust this value to change the sprite size
    const drawWidth = Math.round(this.spriteWidth * scale * sizeFactor);
    const drawHeight = Math.round(this.frameHeight * scale * sizeFactor);

    // Use crisp-edges image rendering
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      this.spriteImage,
      sourceX,
      sourceY,
      this.spriteWidth,
      this.frameHeight,
      Math.round(position.x - drawWidth / 2),
      Math.round(position.y - drawHeight / 2),
      drawWidth,
      drawHeight
    );

    // Reset image smoothing
    ctx.imageSmoothingEnabled = true;
  }

  render() {
    return null; // This component no longer renders anything directly
  }
}

export default SpriteWalking;
