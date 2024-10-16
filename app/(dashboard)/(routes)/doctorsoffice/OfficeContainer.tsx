import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Stage, Container, Graphics, Sprite } from '@pixi/react';
import { Texture, Graphics as PIXIGraphics, utils as PIXIUtils, BaseTexture, Rectangle } from 'pixi.js';
import { ImageGroup } from './ShoppingDialog';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'react-hot-toast';


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
    { x: 5, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 5, y: 8, direction: 'NE' },  // Move SE back to waiting room
    { x: 9, y: 8, direction: 'SE' },  // Move SE back to waiting room

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

// Update the AnimatedSpriteWalking component
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

  // Use fixed size for Kalypso
  const fixedWidth = 48;  // Adjust this value as needed
  const fixedHeight = 64; // Adjust this value as needed

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
};

interface OfficeContainerProps {
  visibleImages: Set<string>;
  clinicName: string | null;
  userScore: number;
  userRooms: string[];
  imageGroups: ImageGroup[];
  toggleGroup: (groupName: string) => void;
  onUpdateUserScore: (newScore: number) => void;
  setUserRooms: React.Dispatch<React.SetStateAction<string[]>>;
  updateVisibleImages: (newVisibleImages: Set<string>) => void;
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
  setUserRooms,
  updateVisibleImages,
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

  const [currentTestLevel, setCurrentTestLevel] = useState(1);

  // Define zoom levels for each test level
  const zoomLevels: Record<number, { scale: number, offsetX: number, offsetY: number }> = {
    1: { scale: 1.5, offsetX: 150, offsetY: -50 },
    2: { scale: 1.3, offsetX: 150, offsetY: 0 },
    3: { scale: 1.1, offsetX: 100, offsetY: 20 },
    4: { scale: 0.9, offsetX: 100, offsetY: 100 },
    5: { scale: 0.8, offsetX: 50, offsetY: 50 },
    6: { scale: 0.7, offsetX: 0, offsetY: 0 },
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

    // Apply the zoom level scale
    scale *= zoomLevels[currentTestLevel].scale;

    setStageSize({
      width: baseWidth * scale,
      height: baseHeight * scale,
    });

    return scale * 0.7;
  }, [currentTestLevel]);

  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [calculateScale]);

  const [currentWaypoints, setCurrentWaypoints] = useState(spriteWaypoints[1]);

  // Function to determine level based on rooms
  const determineLevel = useCallback((rooms: string[]) => {
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
  }, []);

  // Use useEffect to update currentWaypoints when userRooms changes
  useEffect(() => {
    const level = determineLevel(userRooms);
    setCurrentWaypoints(spriteWaypoints[level]);
  }, [userRooms, determineLevel]);

  // Modify the moveSprite function to use currentWaypoints
  const moveSprite = useCallback((
    spriteId: string,
    waypointIndexRef: React.MutableRefObject<number>
  ) => {
    setSpritePositions(prevPositions => {
      const newPositions = { ...prevPositions };
      const sprite = newPositions[spriteId];
      const currentWaypoint = currentWaypoints[waypointIndexRef.current];

      const speed = 0.05; // Reduced speed from 0.1 to 0.05
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

  // Updated getAccentColor function
  const getAccentColor = useCallback(() => {
    const themeElement =
      document.querySelector('.theme-sunsetCity') ||
      document.querySelector('.theme-sakuraTrees') ||
      document.querySelector('.theme-cyberSpace') ||
      document.querySelector('.theme-mykonosBlue') ||
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

          // Determine if the tile should be filled based on the current level
          let shouldFill = false;
          let fillAlpha = 1;

          switch (currentTestLevel) {
            case 1:
              shouldFill = y >= gridHeight - 2;
              break;
            case 2:
              shouldFill = y >= gridHeight - 2 || x < 2 || (x >= 2 && x <= 3 && y >= gridHeight - 6);
              break;
            case 3:
              shouldFill = y >= gridHeight - 4 || x < 3 || y < 3;
              break;
            case 4:
              shouldFill = y >= gridHeight - 5 || x < 4 || y < 4;
              break;
            case 5:
            case 6:
              shouldFill = true;
              break;
          }

          // Adjust alpha for edges
          if (shouldFill && (x < 2 || y < 2)) {
            fillAlpha = 0.1;
          }

          // Fill tile with the theme accent color if it should be filled
          if (shouldFill) {
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
    }, [accentColor, currentTestLevel]);

    return <Graphics draw={drawGrid} />;
  }, [getAccentColor, currentTestLevel]);

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

  const levelConfigurations: Record<number, {
    canvasSize: { width: number, height: number },
    rooms: GridImage[]
  }> = {
    1: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 280, height: 268, zIndex: 9, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 5.9, width: 300, height: 275, zIndex: 8},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 5.82, width: 300, height: 275, zIndex: 8, opacity: 1.0},        
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 1.95, y: 8, width: 296, height: 290, zIndex: 7},
      ]
    },
    2: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 11},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 11, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.96, y: 4.3, width: 306, height: 275, zIndex: 9},
        { id: 'Bathroom2', src: '/game-components/Bathroom1.png', x: 5.92, y: 4.25, width: 306, height: 274, zIndex: 10},
        { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
        { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 12},
      ]
    },
    3: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
      { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 11},
      { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 11, opacity: 1.0},
      { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.96, y: 4.3, width: 306, height: 275, zIndex: 9},
      { id: 'Bathroom2', src: '/game-components/Bathroom1.png', x: 5.92, y: 4.25, width: 306, height: 274, zIndex: 10},
      { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
      { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 12},
      ]
    },
    4: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 12},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.96, y: 4.3, width: 306, height: 275, zIndex: 12},
        { id: 'Bathroom2', src: '/game-components/Bathroom1.png', x: 5.92, y: 4.25, width: 306, height: 274, zIndex: 12},
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8},
        { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
        { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
        { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 275, height: 256, zIndex: 5 },
      ]
    },
    5: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 12},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.96, y: 4.3, width: 306, height: 275, zIndex: 12},
        { id: 'Bathroom2', src: '/game-components/Bathroom1.png', x: 5.92, y: 4.25, width: 306, height: 274, zIndex: 12},
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8},
        { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
        { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
        { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 275, height: 256, zIndex: 5 },
        { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
        { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
      ]
    },
    6: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 12},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.96, y: 4.3, width: 306, height: 275, zIndex: 12},
        { id: 'Bathroom2', src: '/game-components/Bathroom1.png', x: 5.92, y: 4.25, width: 306, height: 274, zIndex: 12},
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8},
        { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
        { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
        { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 275, height: 256, zIndex: 5 },
        { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
        { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
        { id: 'CATScan1', src: '/game-components/CATScan1.png', x: 8.1, y: 0.15, width: 270, height: 240, zIndex: 7 },
        { id: 'CATScan2', src: '/game-components/CATScan1.png', x: 6.1, y: 0.15, width: 270, height: 240, zIndex: 6 },
        { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
      ]
    },
  };

  // Use the current level to get the appropriate room configuration
  const currentLevelConfig = levelConfigurations[currentTestLevel];

  useEffect(() => {
    // Ensure all rooms for the current level are visible
    const newVisibleImages = new Set(visibleImages);
    currentLevelConfig.rooms.forEach(room => {
      newVisibleImages.add(room.id);
    });
    updateVisibleImages(newVisibleImages);
  }, [currentTestLevel, updateVisibleImages]);

  // Update the offset based on the current test level
  const offset = useMemo(() => ({
    x: ((gridWidth + gridHeight) * (tileWidth / 3) + zoomLevels[currentTestLevel].offsetX),
    y: ((gridHeight * tileHeight) / 4 + zoomLevels[currentTestLevel].offsetY)
  }), [currentTestLevel]);

  // Add this constant for base scale
  const BASE_ZOOM_LEVEL = zoomLevels[1].scale; // Using level 1 as our base

  const cycleTestLevel = async () => {
    const newLevel = (currentTestLevel % 6) + 1;
    setCurrentTestLevel(newLevel);

    const levelRooms = [
      ['INTERN LEVEL'],
      ['INTERN LEVEL', 'RESIDENT LEVEL'],
      ['INTERN LEVEL', 'RESIDENT LEVEL', 'FELLOWSHIP LEVEL'],
      ['INTERN LEVEL', 'RESIDENT LEVEL', 'FELLOWSHIP LEVEL', 'ATTENDING LEVEL'],
      ['INTERN LEVEL', 'RESIDENT LEVEL', 'FELLOWSHIP LEVEL', 'ATTENDING LEVEL', 'PHYSICIAN LEVEL'],
      ['INTERN LEVEL', 'RESIDENT LEVEL', 'FELLOWSHIP LEVEL', 'ATTENDING LEVEL', 'PHYSICIAN LEVEL', 'MEDICAL DIRECTOR LEVEL'],
    ];

    try {
      const response = await axios.post('/api/set-test-level', { rooms: levelRooms[newLevel - 1] });
      if (response.data.success) {
        setUserRooms(levelRooms[newLevel - 1]);
        
        const newVisibleImages = new Set<string>();
        levelRooms[newLevel - 1].forEach(roomName => {
          const group = imageGroups.find(g => g.name === roomName);
          if (group) {
            group.items.forEach(item => newVisibleImages.add(item.id));
          }
        });
        
        updateVisibleImages(newVisibleImages);
        
        toast.success(`Test level set to ${newLevel}`);
      }
    } catch (error) {
      console.error('Error setting test level:', error);
      toast.error('Failed to set test level');
    }
  };

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
            {currentLevelConfig.rooms.map((img) => (
              <RoomSprite 
                key={img.id} 
                img={img}
              />
            ))}
            {Object.values(spritePositions).map(sprite => (
              <AnimatedSpriteWalking
                key={sprite.id}
                position={{ x: sprite.x, y: sprite.y }}
                direction={sprite.direction}
                scale={1} // We're not using this for sizing anymore, but keep it for consistency
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
      
      {/* Test Level Button */}
      <Button
        className="absolute bottom-4 right-4 z-50"
        onClick={cycleTestLevel}
      >
        Test Level: {currentTestLevel}
      </Button>
    </div>
  );
};

export default OfficeContainer;