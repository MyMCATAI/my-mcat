import React, { useEffect, useState, useCallback, useRef, useMemo, memo, forwardRef } from 'react';
import { Stage, Container, Graphics, Sprite } from '@pixi/react';
import { Texture, Graphics as PIXIGraphics, utils as PIXIUtils, BaseTexture, Rectangle } from 'pixi.js';
import type { EventMode } from '@pixi/events';
import { ImageGroup } from './ShoppingDialog';
import QuestionPromptSprite from './components/QuestionPromptSprite';
import { levelConfigurations, roomToContentMap, roomToSubjectMap, spriteWaypoints } from './constants';
import { GridImage } from './types';
import { cleanupTextures, preloadTextures, getTexture } from './utils/textureCache';
import { useUserInfo } from "@/hooks/useUserInfo";
import { useGame } from "@/store/selectors";
import { useAudio } from "@/store/selectors";

type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

// Define constants outside the component
const tileWidth = 128;
const tileHeight = 64;
const gridWidth = 10;
const gridHeight = 10;


// Helper functions for isometric calculations
function screenX(worldX: number, worldY: number): number {
  return (worldX - worldY) * (tileWidth / 2);
}

function screenY(worldX: number, worldY: number): number {
  return (worldX + worldY) * (tileHeight / 2);
}

// Move RoomSprite outside as a separate memoized component
const RoomSprite = React.memo(({ 
  img, 
  setFlashcardRoomId, 
  activeRooms, 
  setActiveRooms,
  isFlashcardsOpen,
  setIsFlashcardsOpen 
}: { 
  img: GridImage; 
  setFlashcardRoomId: (id: string) => void;
  activeRooms: Set<string>;
  setActiveRooms: React.Dispatch<React.SetStateAction<Set<string>>>;
  isFlashcardsOpen: boolean;
  setIsFlashcardsOpen: (open: boolean) => void;
}) => {
  const texture = getTexture(img.src);
  const position = useMemo(() => ({
    x: screenX(img.x, img.y) - img.width / 4,
    y: screenY(img.x, img.y) - img.height / 2
  }), [img.x, img.y, img.width, img.height]);
  
  // Get audio from the store
  const audio = useAudio();
  
  return (
    <>
      <Sprite
        texture={texture}
        x={position.x}
        y={position.y}
        width={img.width}
        height={img.height}
        alpha={activeRooms.has(img.id) ? 1 : 0.7}
        zIndex={img.zIndex}
      />
      
      {activeRooms.has(img.id) && roomToSubjectMap[img.id][0] && (
        <QuestionPromptSprite
          src={`/game-components/questionPopup${roomToSubjectMap[img.id][0]}.png`}
          x={position.x + img.width / 2}
          y={position.y + img.height / 5}
          scaleConstant={4}  
          zIndex={img.zIndex+100}
          roomId={img.id}
          onClick={() => {
            setFlashcardRoomId(img.id);
            // Play the door open sound before opening the flashcard dialog
            audio.playSound('flashcard-door-open');
            
            // Keep the small delay to ensure the sound plays before the dialog opens
            setTimeout(() => {
              setIsFlashcardsOpen(true);
            }, 100);
          }}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.img.id === nextProps.img.id &&
    prevProps.img.src === nextProps.img.src &&
    prevProps.img.x === nextProps.img.x &&
    prevProps.img.y === nextProps.img.y &&
    prevProps.activeRooms.has(prevProps.img.id) === nextProps.activeRooms.has(nextProps.img.id) &&
    prevProps.isFlashcardsOpen === nextProps.isFlashcardsOpen
  );
});

// Add display name for debugging
RoomSprite.displayName = 'RoomSprite';

// Also memoize AnimatedSpriteWalking
const AnimatedSpriteWalking = React.memo(({ 
  position, 
  direction, 
  scale 
}: {
  position: { x: number; y: number };
  direction: Direction;
  scale: number;
}) => {
  const [frame, setFrame] = useState(0);
  const [baseTexture, setBaseTexture] = useState<BaseTexture | null>(null);

  const directions = useMemo(() => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'], []);
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
  }, [rows]);

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

interface Category {
  id: string;
  subjectCategory: string;
  contentCategory: string;
  conceptCategory: string;
  section: string;
}

interface OfficeContainerProps {
  onNewGame: (fn: () => GridImage[]) => void;
  visibleImages: Set<string>;
  imageGroups: ImageGroup[];
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

// Update PixiJS configuration to use modern APIs
const pixiConfig = {
  eventMode: 'dynamic' as EventMode, // Type assertion to EventMode
  backgroundAlpha: 0,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
};

// Convert to forwardRef
const OfficeContainer = forwardRef<HTMLDivElement, OfficeContainerProps>(({ 
  onNewGame,
  visibleImages,
  imageGroups,
  updateVisibleImages
}, ref) => {
  // Get game state from Zustand store
  const {
    userRooms,
    activeRooms,
    setActiveRooms,
    isFlashcardsOpen,
    setIsFlashcardsOpen,
    setFlashcardRoomId
  } = useGame();

  // All useState hooks first
  const [currentLevel, setCurrentLevel] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [currentWaypoints, setCurrentWaypoints] = useState(spriteWaypoints[1]);
  const [spritePositions, setSpritePositions] = useState<SpritePositions>({
    sprite1: { id: 'sprite1', x: 9, y: 9, direction: 'S', character: 1 },
  });

  // Then all useRef hooks
  const sprite1WaypointIndexRef = useRef(0);
  
  // Then custom hooks
  const { userInfo } = useUserInfo();

  // Tutorial room effect
  useEffect(() => {
    if(currentLevel === 1) {
      setActiveRooms(prevRooms => new Set([...prevRooms, 'WaitingRoom0']));
    }
  }, [currentLevel, setActiveRooms]);

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

  // Modify the moveSprite function to use currentWaypoints
  const moveSprite = useCallback((
    spriteId: string,
    waypointIndexRef: React.MutableRefObject<number>
  ) => {
    setSpritePositions(prevPositions => {
      const newPositions = { ...prevPositions };
      const sprite = newPositions[spriteId];
      const currentWaypoint = currentWaypoints[waypointIndexRef.current];

      const speed = 0.07
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, updateVisibleImages]);

  const populateRooms = useCallback(() => {
    // Get available rooms for current level (excluding tutorial room)
    const availableRooms = levelConfigurations[currentLevel].rooms
      .filter(room => 
        room.id !== 'WaitingRoom0' && 
        roomToSubjectMap[room.id][0] // Must have a subject
      );
    
    // Randomly select 4 rooms
    const selectedRooms = availableRooms
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    // Set active rooms and return the selected rooms for the toast
    setActiveRooms(new Set(selectedRooms.map(room => room.id)));
    return selectedRooms;
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

  return (
    <div ref={ref} className="relative w-full h-full">
      {/* Pixi.js stage container - Add pointer-events-none by default */}
      <div className="absolute inset-0 z-20 flex justify-center items-center pointer-events-none">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          options={{ 
            backgroundAlpha: 0,
            eventMode: 'static'
          }}
          style={{
            width: `${stageSize.width}px`,
            height: `${stageSize.height}px`,
            pointerEvents: 'auto'
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
        <div className="pointer-events-auto absolute bottom-2 left-2 text-xl font-bold text-[--theme-text-color]">
          {userInfo?.firstName && `${userInfo.firstName} Medical Center`}
        </div>
      </div>
    </div>
  );
});

OfficeContainer.displayName = 'OfficeContainer';

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(OfficeContainer, (prevProps, nextProps) => {
  // Deep compare the props we care about
  return (
    prevProps.visibleImages === nextProps.visibleImages &&
    prevProps.imageGroups === nextProps.imageGroups
  );
});