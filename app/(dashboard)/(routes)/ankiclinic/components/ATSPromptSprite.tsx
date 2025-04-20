import React, { useState, useEffect, useCallback } from 'react';
import { Sprite } from '@pixi/react';
import { Texture } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

interface ATSPromptSpriteProps {
  src: string;
  x: number;
  y: number;
  scaleConstant: number;
  zIndex: number;
  onClick: () => void;
}

const ATSPromptSprite: React.FC<ATSPromptSpriteProps> = ({ 
  src, 
  x, 
  y, 
  scaleConstant,
  zIndex,
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
      // Create a distinct animation pattern for ATS sprite
      if (!isHovered) {
        // Create a bouncing effect different from the other sprites
        const bounce = Math.abs(Math.sin(time * 0.7) * 0.01);
        setScale(0.15 + scaleConstant * (0.015 + bounce)); 
      }
    });

    ticker.start();

    return () => {
      ticker.stop();
      ticker.destroy();
    };
  }, [isHovered, scaleConstant]);

  // Interaction handlers
  const handlePointerOver = useCallback(() => {
    setIsHovered(true);
    setScale((0.1 + scaleConstant * 1 * 0.05)); // Slightly larger scale up on hover
    document.body.style.cursor = 'pointer';
  }, [scaleConstant]);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    setScale((0.1 + scaleConstant * 1 * 0.02));
    document.body.style.cursor = 'default';
  }, [scaleConstant]);

  const handleClick = useCallback(() => {
    console.log('ATSPromptSprite clicked or tapped');
    if (onClick) {
        onClick(); // Call the onClick prop to extend functionality
    }
  }, [onClick]);

  // Add a specific mobile tap handler with a small touch area tolerance
  const handleTap = useCallback(() => {
    console.log('ATSPromptSprite tapped on mobile');
    if (onClick) {
        onClick();
    }
  }, [onClick]);

  // Add a purple glow for ATS
  const glowFilter = new GlowFilter({
    distance: 3,
    outerStrength: 2,
    innerStrength: 0.5,
    color: 0xA020F0, // Purple glow for ATS
    quality: 0.6,
  });

  if (!texture) return null;

  return (
    <Sprite
      texture={texture}
      x={x}
      y={y}
      zIndex={zIndex}
      scale={scale}
      eventMode='static'
      onpointerover={handlePointerOver}
      onpointerout={handlePointerOut}
      onpointerdown={handleClick}
      ontap={handleTap}
      cursor="pointer"
      filters={[glowFilter]}
      anchor={0.5}
    />
  );
};

export default ATSPromptSprite; 