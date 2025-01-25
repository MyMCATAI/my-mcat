import React, { useState, useEffect, useMemo } from 'react';
import { Sprite } from '@pixi/react';
import { Direction } from '../types';
import { screenX, screenY } from '../utils';
import { tileHeight } from '../constants';
import { getBaseTexture, getSpriteSheetTexture } from '../utils/textureCache';

interface AnimatedSpriteWalkingProps {
  position: { x: number; y: number };
  direction: Direction;
  scale: number;
}

const AnimatedSpriteWalking = React.memo(({ 
  position, 
  direction, 
  scale 
}: AnimatedSpriteWalkingProps) => {
  const [frame, setFrame] = useState(0);
  const directions = useMemo(() => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'], []);
  const columns = 8;
  const rows = 3;

  const baseTexture = useMemo(() => 
    getBaseTexture('/game-components/Kalypso-Sprite.png'),
    []
  );

  const spriteWidth = baseTexture.width / columns;
  const spriteHeight = baseTexture.height / rows;
  const directionIndex = directions.indexOf(direction);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % rows);
    }, 230);

    return () => clearInterval(interval);
  }, [rows]);

  const texture = useMemo(() => 
    getSpriteSheetTexture(
      baseTexture,
      frame,
      directionIndex,
      spriteWidth,
      spriteHeight
    ),
    [baseTexture, frame, directionIndex, spriteWidth, spriteHeight]
  );

  const fixedWidth = 48;
  const fixedHeight = 64;

  const posX = screenX(position.x, position.y) - fixedWidth / 2;
  const posY = screenY(position.x, position.y) - fixedHeight / 2 - tileHeight / 4;

  return (
    <Sprite
      texture={texture}
      x={posX}
      y={posY}
      width={fixedWidth}
      height={fixedHeight}
      zIndex={8}
    />
  );
});

AnimatedSpriteWalking.displayName = 'AnimatedSpriteWalking';

export default AnimatedSpriteWalking; 