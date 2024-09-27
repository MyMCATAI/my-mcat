import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Stage, Container, Graphics, Sprite } from '@pixi/react';
import { Texture, Graphics as PIXIGraphics, utils as PIXIUtils, BaseTexture, Rectangle } from 'pixi.js';
import { ImageGroup } from './ShoppingDialog';


type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

interface GridImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity?: number;
}

// Define constants outside the component
const tileWidth = 128;
const tileHeight = 64;
const gridWidth = 10;
const gridHeight = 10;

// Update the waypoint type to include direction
type Waypoint = {
  x: number;
  y: number;
  direction: Direction;
};

// Update the spriteWaypoints to include paths for different levels
const spriteWaypoints: Record<number, Waypoint[]> = {
  1: [
    { x: 9, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 9, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  2: [
    { x: 9, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 3, direction: 'NE' },  // Move NE to top left
    { x: 9, y: 3, direction: 'SE' },  // Move SE to top right
    { x: 4, y: 3, direction: 'NW' },  // Move NW to top left
    { x: 4, y: 9, direction: 'SW' },  // Move SW to bottom left
    { x: 9, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  3: [
    { x: 9, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 4, direction: 'NE' },  // Move NE to middle left
    { x: 2.5, y: 4, direction: 'NW' },  // Move SE back to waiting room
    { x: 2.5, y: 6.5, direction: 'SW' },  // Move NE to middle left
    { x: 5, y: 9, direction: 'S' },  // Move SE back to waiting room
    { x: 9, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  4: [
    { x: 9, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 3, direction: 'NE' },  // Move NE to middle left
    { x: 2.5, y: 1.3, direction: 'NW' },  // Move SE back to waiting room
    { x: 2.5, y: 6, direction: 'SW' },  // Move NE to middle left
    { x: 5, y: 9, direction: 'S' },  // Move SE back to waiting room
    { x: 9, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  5: [
    { x: 9, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 3, y: 1.5, direction: 'NE' },  // Move NE to top left
    { x: 9, y: 1.5, direction: 'SE' },  // Move SE to top right
    { x: 4, y: 1.5, direction: 'NW' },  // Move NW to top left
    { x: 4, y: 9, direction: 'SW' },  // Move SW to bottom left
    { x: 9, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  6: [
    { x: 9, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 3, y: 1.5, direction: 'NE' },  // Move NE to top left
    { x: 9, y: 1.5, direction: 'SE' },  // Move SE to top right
    { x: 4, y: 1.5, direction: 'NW' },  // Move NW to top left
    { x: 4, y: 9, direction: 'SW' },  // Move SW to bottom left
    { x: 9, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
};

// Helper functions for isometric calculations
function screenX(worldX: number, worldY: number): number {
  return (worldX - worldY) * (tileWidth / 2);
}

function screenY(worldX: number, worldY: number): number {
  return (worldX + worldY) * (tileHeight / 2);
}

// AnimatedSpriteWalking component
const AnimatedSpriteWalking: React.FC<{
  position: { x: number; y: number };
  direction: Direction;
  scale: number;
}> = ({ position, direction, scale }) => {
  const [frame, setFrame] = useState(0);
  const [baseTexture, setBaseTexture] = useState<BaseTexture | null>(null);

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const columns = 8;
  const rows = 3;

  useEffect(() => {
    const texture = BaseTexture.from('/game-components/Kalypso-Sprite.png');
    setBaseTexture(texture);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % rows);
    }, 230);

    return () => clearInterval(interval);
  }, []);

  if (!baseTexture) return null;

  const spriteWidth = baseTexture.width / columns;
  const spriteHeight = baseTexture.height / rows;

  const directionIndex = directions.indexOf(direction);
  const sourceX = directionIndex * spriteWidth;
  const sourceY = frame * spriteHeight;

  const texture = new Texture(
    baseTexture,
    new Rectangle(sourceX, sourceY, spriteWidth, spriteHeight)
  );

  // Adjust size as needed
  const drawWidth = Math.round(spriteWidth * scale * 0.5);  // Adjust the multiplier as needed
  const drawHeight = Math.round(spriteHeight * scale * 0.5);  // Adjust the multiplier as needed

  const posX = screenX(position.x, position.y) - drawWidth / 2;
  const posY = screenY(position.x, position.y) - drawHeight / 2 - tileHeight / 4;

  return (
    <Sprite
      texture={texture}
      x={posX}
      y={posY}
      width={drawWidth}
      height={drawHeight}
      zIndex={10}
    />
  );
};

interface OfficeContainerProps {
  visibleImages: Set<string>;
  clinicName: string | null;
  userScore: number;
  userRooms: string[];
  imageGroups: ImageGroup[];
  toggleGroup: (groupName: string) => void;
  onUpdateUserScore: (newScore: number) => void;
}

// Define a type for sprite positions with an index signature
interface SpritePosition {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  character: number;
}

type SpritePositions = {
  [key: string]: SpritePosition;
};

const OfficeContainer: React.FC<OfficeContainerProps> = ({
  visibleImages,
  clinicName,
  userScore,
  userRooms,
  imageGroups,
  toggleGroup,
  onUpdateUserScore,
}) => {
  const [images] = useState<GridImage[]>([
    { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
    { id: 'CATScan1', src: '/game-components/CATScan1.png', x: 8.1, y: 0.15, width: 270, height: 240, zIndex: 7 },
    { id: 'CATScan2', src: '/game-components/CATScan1.png', x: 6.1, y: 0.15, width: 270, height: 240, zIndex: 6 },
    { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
    { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 275, height: 256, zIndex: 5 },
    { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
    { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
    { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
    { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.96, y: 4.3, width: 306, height: 275, zIndex: 12},
    { id: 'Bathroom2', src: '/game-components/Bathroom1.png', x: 5.92, y: 4.25, width: 306, height: 274, zIndex: 12},
    { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 12},
    { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 12, opacity: 1.0},
    { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
    { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8},
  ]);

  // Define offset as a constant instead of state
  const offset = {
    x: (gridWidth + gridHeight) * (tileWidth / 3),
    y: (gridHeight * tileHeight) / 4
  };

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  const [spritePositions, setSpritePositions] = useState<SpritePositions>({
    sprite1: { id: 'sprite1', x: 9, y: 9, direction: 'S', character: 1 },
  });

  const sprite1WaypointIndexRef = useRef(0);

  // Function to calculate positions
  function screenX(worldX: number, worldY: number): number {
    return (worldX - worldY) * (tileWidth / 2);
  }

  function screenY(worldX: number, worldY: number): number {
    return (worldX + worldY) * (tileHeight / 2);
  }

  // Modify the calculateScale function
  const calculateScale = useCallback(() => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const baseWidth = (gridWidth + gridHeight) * (tileWidth / 2);
    const baseHeight = (gridWidth + gridHeight) * (tileHeight / 2);

    const scaleX = containerWidth / baseWidth;
    const scaleY = containerHeight / baseHeight;

    let scale = Math.min(scaleX, scaleY);
    const maxScale = 1.2;
    scale = Math.min(scale, maxScale);

    setStageSize({
      width: baseWidth * scale,
      height: baseHeight * scale,
    });

    return scale * 0.7;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [calculateScale]);

  const [currentWaypoints, setCurrentWaypoints] = useState(spriteWaypoints[1]);

  // New function to fetch rooms from the API
  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch('/api/clinic');
      if (response.ok) {
        const rooms = await response.json();
        const level = determineLevel(rooms);
        setCurrentWaypoints(spriteWaypoints[level]);
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  }, []);

  // Function to determine level based on rooms
  const determineLevel = (rooms: string[]) => {
    const levelRooms = [
      'INTERN LEVEL',
      'RESIDENT LEVEL',
      'FELLOWSHIP LEVEL',
      'ATTENDING LEVEL',
      'PHYSICIAN LEVEL',
      'MEDICAL DIRECTOR LEVEL'
    ];
    
    let highestLevel = 1;
    rooms.forEach(room => {
      const index = levelRooms.indexOf(room);
      if (index !== -1 && index + 1 > highestLevel) {
        highestLevel = index + 1;
      }
    });
    
    return highestLevel;
  };

  // Use useEffect to fetch rooms when the component mounts
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Use another useEffect to refetch rooms when userRooms changes
  useEffect(() => {
    fetchRooms();
  }, [userRooms, fetchRooms]);

  // Modify the moveSprite function to use currentWaypoints
  const moveSprite = useCallback((
    spriteId: string,
    waypointIndexRef: React.MutableRefObject<number>
  ) => {
    setSpritePositions(prevPositions => {
      const newPositions = { ...prevPositions };
      const sprite = newPositions[spriteId];
      const currentWaypoint = currentWaypoints[waypointIndexRef.current];

      const speed = 0.1;
      const dx = currentWaypoint.x - sprite.x;
      const dy = currentWaypoint.y - sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < speed) {
        waypointIndexRef.current = (waypointIndexRef.current + 1) % currentWaypoints.length;
        sprite.direction = currentWaypoint.direction;
      } else {
        sprite.x += (dx / distance) * speed;
        sprite.y += (dy / distance) * speed;
        sprite.direction = currentWaypoint.direction;
      }

      return newPositions;
    });
  }, [currentWaypoints]);

  // Use useEffect to set up the animation loop for all sprites
  useEffect(() => {
    const animationInterval = setInterval(() => {
      moveSprite('sprite1', sprite1WaypointIndexRef);
    }, 70);

    return () => clearInterval(animationInterval);
  }, [moveSprite]);

  // New function to get accent color
  const getAccentColor = useCallback(() => {
    const themeElement =
      document.querySelector('.theme-sunsetCity') ||
      document.querySelector('.theme-sakuraTrees') ||
      document.querySelector('.theme-cyberSpace') ||
      document.documentElement;
    const computedStyle = getComputedStyle(themeElement!);
    const accentColor = computedStyle.getPropertyValue('--theme-doctorsoffice-accent').trim();
    return accentColor || '#001226';
  }, []);

  // Updated IsometricGrid component
  const IsometricGrid = useCallback(() => {
    const accentColor = getAccentColor();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const drawGrid = useCallback((g: PIXIGraphics) => {
      g.clear();
      g.lineStyle(1, 0x000000, 1);

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const posX = screenX(x, y);
          const posY = screenY(x, y);

          // Draw tile outline
          g.moveTo(posX, posY + tileHeight / 2);
          g.lineTo(posX + tileWidth / 2, posY);
          g.lineTo(posX + tileWidth, posY + tileHeight / 2);
          g.lineTo(posX + tileWidth / 2, posY + tileHeight);
          g.lineTo(posX, posY + tileHeight / 2);

          // Fill tile with the theme accent color for specified areas
          if (x < 4 || y < 4 || y >= gridHeight - 2) {
            let fillAlpha = 1;
            if (x < 2 || y < 2) {
              fillAlpha = 0.1;
            }
            g.beginFill(PIXIUtils.string2hex(accentColor), fillAlpha);
            g.moveTo(posX, posY + tileHeight / 2);
            g.lineTo(posX + tileWidth / 2, posY);
            g.lineTo(posX + tileWidth, posY + tileHeight / 2);
            g.lineTo(posX + tileWidth / 2, posY + tileHeight);
            g.lineTo(posX, posY + tileHeight / 2);
            g.endFill();
          }
        }
      }
    }, [accentColor]);

    return <Graphics draw={drawGrid} />;
  }, [getAccentColor]);

  // Modify the RoomSprite component
  const RoomSprite = useCallback(({ img }: { img: GridImage }) => {
    const texture = Texture.from(img.src);
    const posX = screenX(img.x, img.y) - img.width / 4;
    const posY = screenY(img.x, img.y) - img.height / 2;

    return (
      <Sprite
        texture={texture}
        x={posX}
        y={posY}
        width={img.width}
        height={img.height}
        alpha={img.opacity !== undefined ? img.opacity : 1}
        zIndex={img.zIndex}
      />
    );
  }, []);

  return (
    <div className="flex flex-col w-full h-full relative overflow-hidden">
      {/* Pixi.js stage container */}
      <div className="absolute inset-0 z-20 flex justify-center items-center">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          options={{ backgroundAlpha: 0 }}
          style={{
            width: `${stageSize.width}px`,
            height: `${stageSize.height}px`,
          }}
        >
          <Container position={[offset.x * scale, offset.y * scale]} scale={scale} sortableChildren>
            <IsometricGrid />
            {images.map(
              (img) =>
                visibleImages.has(img.id) && (
                  <RoomSprite 
                    key={img.id} 
                    img={{
                      ...img,
                      zIndex: ['ExaminationRoom1', 'WaitingRoom1', 'DoctorsOffice1', 'ExaminationRoom2', 'Bathroom1', 'Bathroom2'].includes(img.id) ? 12 : 
                              img.id === 'DoctorsOffice1' ? 9 : img.zIndex
                    }} 
                  />
                ),
            )}
            {Object.values(spritePositions).map(sprite => (
              <AnimatedSpriteWalking
                key={sprite.id}
                position={{ x: sprite.x, y: sprite.y }}
                direction={sprite.direction}
                scale={scale * .8}
              />
            ))}
          </Container>
        </Stage>
      </div>
      
      {/* UI Elements */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="pointer-events-auto absolute top-2 left-2 text-xl font-bold text-[--theme-text-color]">
          {clinicName && `${clinicName} Medical Center`}
        </div>
      </div>
    </div>
  );
};

export default OfficeContainer;