import React, { useState, useEffect, useCallback } from 'react';
import { Sprite } from '@pixi/react';
import { Texture } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';



interface QuestionPromptSpriteProps {
  src: string;
  x: number;
  y: number;
  scaleConstant: number;
  zIndex: number;
  roomId: string;
  onClick: () => void; // Add this prop
}

const QuestionPromptSprite: React.FC<QuestionPromptSpriteProps> = ({ 
  src, 
  x, 
  y, 
  scaleConstant,
  zIndex,
  roomId,
  onClick
}) => {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [scale, setScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Load texture
  useEffect(() => {
    const imgTexture = Texture.from(src);
    setTexture(imgTexture);
  });

  // Animation ticker
  useEffect(() => {
    let ticker = new PIXI.Ticker();
    let time = 0;

    ticker.add(() => {
      time += 0.10;
      // Create a subtle floating/pulsing effect

      if (!isHovered) {
        setScale(0.15 + scaleConstant * Math.abs(Math.sin(time) * 0.005)); // Subtle pulse between 0.97 and 1.03
      }
    });

    ticker.start();

    return () => {
      ticker.stop();
      ticker.destroy();
    };
  }, [isHovered]);

  // Interaction handlers
  const handlePointerOver = useCallback(() => {
    setIsHovered(true);
    setScale((0.1 + scaleConstant * 1 * 0.03)); // Scale up on hover
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    setScale((0.1 + scaleConstant * 1 * 0.02));
    document.body.style.cursor = 'default';
  }, []);

  const handleClick = useCallback(() => {
    // Add your click handler logic here
    if (onClick) {
        onClick(); // Call the onClick prop to extend functionality
    }

  }, [onClick]);

  const glowFilter = new GlowFilter({
    distance: 2,
    outerStrength: 1,
    innerStrength: 0,
    color: 0xffffff,
    quality: 0.5,
  });

  if (!texture) return null;

  return (
    <Sprite
      texture={texture}
      x={x}
      y={y}
      zIndex={zIndex}
      scale={scale}
      interactive={true}
      pointerover={handlePointerOver}
      pointerout={handlePointerOut}
      click={handleClick}
      cursor="pointer"
      // Apply the glow filter here
      filters={[glowFilter]}
      anchor={0.5} // Center the sprite for better scaling
    />
  );
};

export default QuestionPromptSprite;