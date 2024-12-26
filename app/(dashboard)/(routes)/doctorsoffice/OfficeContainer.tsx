import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Stage, Container, Graphics, Sprite } from '@pixi/react';
import { Texture, Graphics as PIXIGraphics, utils as PIXIUtils, BaseTexture, Rectangle } from 'pixi.js';
import { ImageGroup } from './ShoppingDialog';
import QuestionPromptSprite from './components/QuestionPromptSprite';


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

// Map of images to be used for QuestionPromptSprite
export const roomToSubjectMap: Record<string, string[]> = {
  'WaitingRoom1': ['Tutorial'], // this is handled specially as a tutorial room
  'ExaminationRoom1': ['Psychology'],
  'ExaminationRoom2': ['Psychology'],
  'DoctorsOffice1': ['Sociology'],
  'Bathroom1': [''], // Empty array since it has no content
  'Lab1': ['Biology','Biochemistry'],
  'HighCare1': ['Biology'],
  'HighCare2': ['Biology','Biochemistry'],
  'OperatingRoom1': ['Biochemistry'],
  'MedicalCloset1': ['Biochemistry'],
  'MRIMachine1': ['Chemistry','Physics'],
  'MRIMachine2': ['Physics','Chemistry'],
  'CATScan1': ['Physics'],
  'CATScan2': ['Physics'],
};

export const roomToContentMap: Record<string, string[]> = {
  'WaitingRoom1': ['Tutorial'],
  'ExaminationRoom1': ['6A', '6B', '6C'],
  'ExaminationRoom2': ['7A', '7B', '7C'],
  'DoctorsOffice1': ['9A', '9B', '10A'],
  'Bathroom1': [],  // Empty array since it has no content
  'Lab1': ['2A', '2B', '2C', '1C'],
  'HighCare1': ['3A', '3B'],
  'HighCare2': ['1A', '1B', '5E'],
  'OperatingRoom1': ['1D'],
  'MedicalCloset1': ['5C', '5D'],
  'MRIMachine1': ['4E', '5A', '5B'],
  'MRIMachine2': ['4C', '4D'],
  'CATScan1': ['4B'],
  'CATScan2': ['4A']
};

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
  0: [
    { x: 9.5, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 9.5, y: 8, direction: 'NE' },  // Move up
    { x: 10, y: 8, direction: 'SE' }, // Move right
    { x: 10, y: 9, direction: 'SW' }, // Move down
  ],
  1: [
    { x: 8, y: 9, direction: 'SW' },  // Start at waiting room
    { x: 5, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 5, y: 8, direction: 'NE' },  // Move SE back to waiting room
    { x: 8, y: 8, direction: 'SE' },  // Move SE back to waiting room

  ],
  2: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 3, direction: 'NE' },  // Move NE to top left
    { x: 4, y: 3, direction: 'NW' },  // Move NW to top left
    { x: 4, y: 9, direction: 'SW' },  // Move SW to bottom left
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  3: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 4, direction: 'NE' },  // Move NE to middle left
    { x: 2.5, y: 4, direction: 'NW' },  // Move SE back to waiting room
    { x: 2.5, y: 6.5, direction: 'SW' },  // Move NE to middle left
    { x: 5, y: 9, direction: 'S' },  // Move SE back to waiting room
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  4: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 4, y: 3, direction: 'NE' },  // Move NE to middle left
    { x: 2.5, y: 1.3, direction: 'N' },  // Move SE back to waiting room
    { x: 2.5, y: 7, direction: 'SW' },  // Move NE to middle left
    { x: 4.5, y: 9, direction: 'S' },  // Move SE back to waiting room
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  5: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 3, y: 1.5, direction: 'NE' },  // Move NE to top left
    { x: 8, y: 1.5, direction: 'SE' },  // Move SE to top right
    { x: 3, y: 1.5, direction: 'NW' },  // Move NE to top left
    { x: 4, y: 9, direction: 'SW' },  // Move SE back to waiting room
    { x: 8, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  6: [
    { x: 8, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 4, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 3, y: 2, direction: 'NE' },  // Move NE to top left
    { x: 10, y: 2, direction: 'SE' },  // Move SE to top right
    { x: 10, y: 9, direction: 'SW' },  // Move SE back to waiting room
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
  onNewGame: (fn: () => void) => void;
  visibleImages: Set<string>;
  clinicName: string | null;
  userScore: number;
  userRooms: string[];
  imageGroups: ImageGroup[];
  flashcardRoomId: string;
  setFlashcardRoomId: React.Dispatch<React.SetStateAction<string>>;
  toggleGroup: (groupName: string) => void;
  onUpdateUserScore: (newScore: number) => void;
  setUserRooms: React.Dispatch<React.SetStateAction<string[]>>;
  updateVisibleImages: (newVisibleImages: Set<string>) => void;
  activeRooms: Set<string>;
  setActiveRooms: React.Dispatch<React.SetStateAction<Set<string>>>;
  isFlashcardsOpen: boolean;
  setIsFlashcardsOpen: (open: boolean) => void;
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

// Move RoomSprite outside as a separate component
const RoomSprite: React.FC<{ 
  img: GridImage; 
  setFlashcardRoomId: (id: string) => void;
  activeRooms: Set<string>;
  setActiveRooms: React.Dispatch<React.SetStateAction<Set<string>>>;
  isFlashcardsOpen: boolean;
  setIsFlashcardsOpen: (open: boolean) => void;
}> = ({ img, setFlashcardRoomId, activeRooms, setActiveRooms, isFlashcardsOpen, setIsFlashcardsOpen }) => {
  const texture = Texture.from(img.src);  
  const posX = screenX(img.x, img.y) - img.width / 4;
  const posY = screenY(img.x, img.y) - img.height / 2;

  return (
    <>
      <Sprite
        texture={texture}
        x={posX}
        y={posY}
        width={img.width}
        height={img.height}
        alpha={activeRooms.has(img.id) ? 1 : 0.7} // Dim if not active
        zIndex={img.zIndex}
      />
      
      {activeRooms.has(img.id) && roomToSubjectMap[img.id][0] && (
        <QuestionPromptSprite
          src={`/game-components/questionPopup${roomToSubjectMap[img.id][0]}.png`}
          x={posX + img.width / 2}
          y={posY + img.height / 5}
          scaleConstant={4}  
          zIndex={img.zIndex+100}
          roomId={img.id}
          onClick={() => {
            setFlashcardRoomId(img.id);
            setIsFlashcardsOpen(true);
          }}
        />
      )}
    </>
  );
};

const OfficeContainer: React.FC<OfficeContainerProps> = ({
  onNewGame,
  visibleImages,
  clinicName,
  userScore,
  userRooms,
  imageGroups,
  flashcardRoomId,
  setFlashcardRoomId,
  toggleGroup,
  onUpdateUserScore,
  setUserRooms,
  updateVisibleImages,
  activeRooms,
  setActiveRooms,
  isFlashcardsOpen,
  setIsFlashcardsOpen,
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
    { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.92, y: 4.25, width: 306, height: 274, zIndex: 12},
    { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 12},
    { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 12, opacity: 1.0},
    { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
    { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8},
  ]);

  const [currentLevel, setCurrentLevel] = useState(1);

  // Define zoom levels for each test level
  const zoomLevels: Record<number, { scale: number, offsetX: number, offsetY: number }> = {
    0: { scale: 2.5, offsetX: -50, offsetY: -200 },
    1: { scale: 1.5, offsetX: 150, offsetY: -50 },
    2: { scale: 1.3, offsetX: 150, offsetY: 0 },
    3: { scale: 1.3, offsetX: 150, offsetY: 0 }, // Changed to match level 2
    4: { scale: 1.1, offsetX: 150, offsetY: 50 },
    5: { scale: 1.0, offsetX: 50, offsetY: 50 },
    6: { scale: 1.0, offsetX: 0, offsetY: 90 },
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
    scale *= zoomLevels[currentLevel].scale;

    setStageSize({
      width: baseWidth * scale,
      height: baseHeight * scale,
    });

    return scale * 0.7;
  }, [currentLevel]);

  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [calculateScale]);


  const [currentWaypoints, setCurrentWaypoints] = useState(spriteWaypoints[1]);

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

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const posX = screenX(x, y);
          const posY = screenY(x, y);

          // Determine if the tile should be filled based on the current level
          let shouldFill = false;

          switch (currentLevel) {
            case 1:
              shouldFill = y >= gridHeight - 2 && x >= 2; // Only fill the bottom two rows, starting from the third column
              break;
            case 2:
            case 3:
              shouldFill = y >= gridHeight - 2 || x < 2 || (x >= 2 && x <= 3 && y >= gridHeight - 6);
              shouldFill = shouldFill && y >= 3.3; // Exclude the top three and a half rows
              break;
            case 4:
            case 5:
              shouldFill = (y >= gridHeight - 5 || x < 4 || y < 4) && x < gridWidth - 2;
              break;
            case 6:
              shouldFill = true;
              break;
          }

          // Fill tile with the theme accent color if it should be filled
          if (shouldFill) {
            g.beginFill(PIXIUtils.string2hex(accentColor));
            g.moveTo(posX, posY + tileHeight / 2);
            g.lineTo(posX + tileWidth / 2, posY);
            g.lineTo(posX + tileWidth, posY + tileHeight / 2);
            g.lineTo(posX + tileWidth / 2, posY + tileHeight);
            g.lineTo(posX, posY + tileHeight / 2);
            g.endFill();
          }
        }
      }
    }, [accentColor, currentLevel]);

    return <Graphics draw={drawGrid} />;
  }, [getAccentColor, currentLevel]);

  const levelConfigurations: Record<number, {
    canvasSize: { width: number, height: number },
    rooms: GridImage[]
  }> = {
    0: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.04, width: 280, height: 268, zIndex: 2, opacity: 1.0},
      ]
    },
    1: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.04, width: 280, height: 268, zIndex: 10, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 5.94, width: 300, height: 278, zIndex: 6},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 5.88, width: 300, height: 278, zIndex: 7, opacity: 1.0},        
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 2.06, y: 7.99, width: 296, height: 290, zIndex: 5},
      ]
    },
    2: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 11},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 11, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 299, height: 278, zIndex: 9},
        { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 292, height: 270, zIndex: 10},
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
      { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 299, height: 278, zIndex: 9},
      { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 292, height: 270, zIndex: 10},
      { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
      { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
      { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 12},
      ]
    },
    4: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.0, width: 284, height: 272, zIndex: 12, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 10},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 10, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 296, height: 278, zIndex: 9},
        { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 285, height: 273, zIndex: 9},
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8},
        { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
        { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
        { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
        { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
        { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
      ]
    },
    5: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 8.0, y: 8.05, width: 274, height: 268, zIndex: 12, opacity: 1.0},
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 264, zIndex: 11},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 268, zIndex: 11, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 3.97, width: 296, height: 278, zIndex: 10},
        { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.95, y: 4, width: 285, height: 273, zIndex: 10},
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 294, zIndex: 8},
        { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
        { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
        { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 275, height: 256, zIndex: 5 },
        { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.11, y: 0.11, width: 270, height: 256, zIndex: 4 },
        { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
        { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
      ]
    },
    6: {
      canvasSize: { width: 10, height: 10 },
      rooms: [
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 4, y: 6.1, width: 290, height: 260, zIndex: 11},
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png', x: 6, y: 6.00, width: 292, height: 262, zIndex: 11, opacity: 1.0},
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png', x: 3.98, y: 4.02, width: 294, height: 278, zIndex: 10},
        { id: 'Lab1', src: '/game-components/Lab1.png', x: 5.98, y: 4, width: 285, height: 263, zIndex: 10},
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0.1, y: 7.94, width: 290, height: 290, zIndex: 8},
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

  const determineLevel = useCallback((rooms: string[]) => {
    const levelRooms = [
      'INTERN LEVEL',
      'RESIDENT LEVEL',
      'FELLOWSHIP LEVEL',
      'ATTENDING LEVEL',
      'PHYSICIAN LEVEL',
      'MEDICAL DIRECTOR LEVEL'
    ];
    
    let highestLevel = 0;
    rooms.forEach(room => {
      const index = levelRooms.indexOf(room);
      if (index !== -1 && index + 1 > highestLevel) {
        highestLevel = index + 1;
      }
    });
    
    return highestLevel;
  }, []);

  useEffect(() => {
    const newLevel = determineLevel(userRooms);
    setCurrentLevel(newLevel);
    setCurrentWaypoints(spriteWaypoints[newLevel]);
  }, [userRooms, determineLevel]);

  // Use the current level to get the appropriate room configuration
  const currentLevelConfig = levelConfigurations[currentLevel];

  useEffect(() => {
    // Ensure all rooms for the current level are visible
    const newVisibleImages = new Set(visibleImages);
    currentLevelConfig.rooms.forEach(room => {
      newVisibleImages.add(room.id);
    });
    updateVisibleImages(newVisibleImages);
  }, [currentLevel, updateVisibleImages]);

  const isInitialized = useRef(false);

  // // When the app starts, put all rooms in activeRooms
  // useEffect(() => {
  //   if (!isInitialized.current) {
  //     const availableRooms = currentLevelConfig.rooms
  //         .map(room => room.id)
  //         .filter(roomId => !activeRooms.has(roomId));

  //     if (availableRooms.length > 0) {
  //       setActiveRooms(new Set(availableRooms));
  //       isInitialized.current = true;
  //     }
  //   }
  // }, []);

  const populateRooms = useCallback(() => {
    // Get rooms directly from levelConfigurations
    const rooms = levelConfigurations[currentLevel].rooms;
    
    // Randomly select 4 rooms (excluding WaitingRoom1)

    const otherRooms = rooms
      .filter(room => room.id !== 'WaitingRoom1' && roomToSubjectMap[room.id][0])
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    // Set the active rooms (WaitingRoom1 is already active from the useEffect)
    setActiveRooms(new Set(otherRooms.map(room => room.id)));
  }, [currentLevel]);

  // Pass the stable function reference to parent
  useEffect(() => {
    onNewGame(populateRooms);
  }, [onNewGame, populateRooms]); // Remove populateRooms from dependencies

  // Update the offset based on the current test level
  const offset = useMemo(() => ({
    x: ((gridWidth + gridHeight) * (tileWidth / 3) + zoomLevels[currentLevel].offsetX),
    y: ((gridHeight * tileHeight) / 4 + zoomLevels[currentLevel].offsetY)
  }), [currentLevel]);

  const [isLargeDialogOpen, setIsLargeDialogOpen] = useState(false);

  useEffect(() => {
    // open tutorial room by default and keep it open
    setActiveRooms(prevRooms => new Set([...prevRooms, 'WaitingRoom1']));
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {currentLevelConfig.rooms.map((img) => (
              <RoomSprite 
                key={img.id} 
                img={img}
                setFlashcardRoomId={setFlashcardRoomId}
                activeRooms={activeRooms}
                setActiveRooms={setActiveRooms}
                isFlashcardsOpen={isFlashcardsOpen}
                setIsFlashcardsOpen={setIsFlashcardsOpen}
              />
            ))}
            {Object.values(spritePositions).map(sprite => (
              <AnimatedSpriteWalking
                key={sprite.id}
                position={{ x: sprite.x, y: sprite.y }}
                direction={sprite.direction}
                scale={1} 
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