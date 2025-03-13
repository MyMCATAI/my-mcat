import React, { useEffect, useState, useCallback, useRef, useMemo, memo, forwardRef, useImperativeHandle } from 'react';
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
import { useWindowSize } from '@/store/selectors';

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
  resolution: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
};

// Convert to forwardRef
const OfficeContainer = forwardRef<HTMLDivElement, OfficeContainerProps>(({ 
  onNewGame,
  visibleImages,
  imageGroups,
  updateVisibleImages
}, ref) => {
  // Check for browser environment
  const isBrowser = typeof window !== 'undefined';
  
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

  // User control for zoom and pan - use a default value first
  const [userZoom, setUserZoom] = useState(1.0); // Will be updated based on device
  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Then all useRef hooks
  const sprite1WaypointIndexRef = useRef(0);
  const containerRef = useRef<any>(null);
  const lastTouchDistance = useRef<number | null>(null);
  
  // Then custom hooks
  const { userInfo } = useUserInfo();
  const windowSize = useWindowSize();
  const isMobile = !windowSize.isDesktop;
  
  // Set initial zoom based on device type and orientation - runs once on mount
  useEffect(() => {
    if (isMobile) {
      const isPortrait = windowSize.height > windowSize.width;
      if (isPortrait) {
        setUserZoom(1.3); // Higher initial zoom for mobile portrait
      } else {
        setUserZoom(1.1); // Slightly lower for landscape
      }
    }
  }, [isMobile, windowSize]);

  // Update zoom when orientation changes
  useEffect(() => {
    if (!isBrowser) return;
    
    const handleOrientationChange = () => {
      if (isMobile) {
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
          setUserZoom(prev => Math.max(prev, 1.3)); // Ensure minimum zoom in portrait
        } else {
          setUserZoom(prev => Math.min(prev, 1.5)); // Cap zoom in landscape
        }
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [isMobile, isBrowser]);

  // Tutorial room effect
  useEffect(() => {
    if(currentLevel === 1) {
      setActiveRooms(prevRooms => new Set([...prevRooms, 'WaitingRoom0']));
    }
  }, [currentLevel, setActiveRooms]);

  // Define zoom levels for each test level
  const zoomLevels: Record<number, { scale: number, offsetX: number, offsetY: number }> = {
    0: { scale: 3.2, offsetX: -50, offsetY: -450 },
    1: { scale: 2.3, offsetX: 150, offsetY: -300 },
    2: { scale: 1.9, offsetX: 150, offsetY: -250 },
    3: { scale: 1.8, offsetX: 150, offsetY: -250 },
    4: { scale: 1.6, offsetX: 150, offsetY: -200 },
    5: { scale: 1.3, offsetX: 50, offsetY: -200 },
    6: { scale: 1.2, offsetX: 0, offsetY: -160 },
  };

  // Level-specific horizontal adjustment for better centering
  const levelHorizontalAdjustment = useMemo(() => {
    // As level increases, we need to adjust the horizontal position differently
    const baseAdjustment = isMobile ? -950 : -800; // Base adjustment from above
    
    // Additional adjustments based on level - higher levels need more adjustment
    // to keep hospital centered as it grows
    const levelFactor = currentLevel * (isMobile ? -15 : -20);
    
    return baseAdjustment + levelFactor;
  }, [currentLevel, isMobile]);

  // Level-specific vertical adjustment for better centering
  const levelVerticalAdjustment = useMemo(() => {
    // Larger base adjustment to move content higher up
    const baseAdjustment = isMobile ? 200 : 200;
    
    // Additional adjustments based on level
    const levelFactor = currentLevel * (isMobile ? 10 : 12);
    
    return baseAdjustment + levelFactor;
  }, [currentLevel, isMobile]);

  // Modify the calculateScale function
  const calculateScale = useCallback(() => {
    // Use the current stage size instead of window size directly
    const containerWidth = stageSize.width;
    const containerHeight = stageSize.height;
    
    // Base dimensions of the isometric grid
    const baseWidth = (gridWidth + gridHeight) * (tileWidth / 2);
    const baseHeight = (gridWidth + gridHeight) * (tileHeight / 2);

    // Calculate scale to fit container
    const scaleX = containerWidth / baseWidth;
    const scaleY = containerHeight / baseHeight;

    // Use the smaller scale to ensure content fits
    let scale = Math.min(scaleX, scaleY);
    
    // For mobile, ensure the scale is large enough to see content clearly
    if (isMobile) {
      // Set minimum scale for mobile
      const minScale = 0.5;
      scale = Math.max(scale, minScale);
    }
    
    // Apply level-specific scaling
    const levelScaleFactor = Math.max(0.5, 1.0 - (currentLevel * 0.07));
    scale *= levelScaleFactor;
    
    // Apply zoom level adjustment from predefined values
    scale *= zoomLevels[currentLevel].scale;
    
    // Apply user zoom factor
    scale *= userZoom;

    return scale;
  }, [currentLevel, stageSize, isMobile, userZoom]);

  // Update our calculations to get accurate window and container dimensions
  useEffect(() => {
    if (!isBrowser) return;
    
    const updateDimensions = () => {
      // Adjust for the navbar height
      const navbarHeight = 80; // Navbar is h-20 (80px)
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - navbarHeight;
      
      // Set stage dimensions accounting for navbar
      setStageSize({
        width: window.innerWidth,
        height: isMobile ? availableHeight : window.innerHeight * 0.9,
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile, isBrowser]);

  // Separate effect for scale calculation to break the dependency cycle
  useEffect(() => {
    setScale(calculateScale());
  }, [calculateScale, stageSize]);

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

  // Update the offset based on the current test level and user pan
  const offset = useMemo(() => {
    // Base offset calculation
    let baseOffsetX, baseOffsetY;
    
    // Different offset adjustments for mobile
    if (isMobile) {
      baseOffsetX = ((gridWidth + gridHeight) * (tileWidth / 3) + zoomLevels[currentLevel].offsetX) * 1.1;
      baseOffsetY = ((gridHeight * tileHeight) / 4 + zoomLevels[currentLevel].offsetY) * 1.0; // Reduced multiplier
      // Apply horizontal adjustment for centering the content
      baseOffsetX += levelHorizontalAdjustment;
      // Reduce Y offset to move content up
      baseOffsetY -= 40;
    } else {
      // Desktop offset
      baseOffsetX = ((gridWidth + gridHeight) * (tileWidth / 3) + zoomLevels[currentLevel].offsetX);
      baseOffsetY = ((gridHeight * tileHeight) / 4 + zoomLevels[currentLevel].offsetY);
      // Apply horizontal adjustment for centering the content
      baseOffsetX += levelHorizontalAdjustment;
      // Reduce Y offset to move content up
      baseOffsetY -= 30;
    }
    
    // Apply user pan offset - adjust pan sensitivity based on zoom level
    // When zoomed in more, pan should move the view more to give a natural feeling
    const panMultiplier = 1 / userZoom;
    return {
      x: baseOffsetX + (userPan.x * panMultiplier),
      y: baseOffsetY + (userPan.y * panMultiplier)
    };
  }, [currentLevel, isMobile, userPan, userZoom, levelHorizontalAdjustment]);

  // Update the Container position to use these adjustments
  const containerPosition = useMemo(() => {
    return {
      x: (windowSize.width / 2) + (offset.x * scale),
      y: (windowSize.height / 2) + (offset.y * scale) - levelVerticalAdjustment
    };
  }, [windowSize, offset, scale, levelVerticalAdjustment]);

  // Add handlers for mouse and touch interactions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Pan sensitivity - adjust as needed
    const sensitivity = 1.0;
    
    setUserPan(prev => ({
      x: prev.x + dx * sensitivity,
      y: prev.y + dy * sensitivity
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Zoom speed - adjust as needed
    const zoomSpeed = 0.1;
    
    // Calculate new zoom - negative delta means zoom in
    const zoomDelta = -Math.sign(e.deltaY) * zoomSpeed;
    
    // Limit zoom range
    const minZoom = 0.5;
    const maxZoom = 3.0;
    
    setUserZoom(prev => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, prev + zoomDelta));
      return newZoom;
    });
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Check if the target is an interactive Pixi.js element (like our room sprites)
    const target = e.target as HTMLElement;
    const isPixiInteractive = target.closest('canvas') && 
      !target.closest('.drag-container'); // Assuming we'll add this class to the container div
    
    if (isPixiInteractive) {
      // Let Pixi.js handle the event for interactive elements
      return;
    }
    
    if (e.touches.length === 1) {
      // Single touch - for panning
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    } else if (e.touches.length === 2) {
      // Double touch - for pinch zoom
      setIsZooming(true);
      
      // Calculate initial distance between two touch points
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      // Handle panning
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      
      // Pan sensitivity - adjust as needed
      const sensitivity = 1.0;
      
      setUserPan(prev => ({
        x: prev.x + dx * sensitivity,
        y: prev.y + dy * sensitivity
      }));
      
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    } else if (e.touches.length === 2 && isZooming && lastTouchDistance.current) {
      // Handle pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate new distance
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calculate zoom delta based on distance change
      const zoomDelta = (distance - lastTouchDistance.current) * 0.01;
      
      // Limit zoom range
      const minZoom = 0.5;
      const maxZoom = 3.0;
      
      setUserZoom(prev => {
        const newZoom = Math.max(minZoom, Math.min(maxZoom, prev + zoomDelta));
        return newZoom;
      });
      
      lastTouchDistance.current = distance;
    }
  }, [isDragging, isZooming, dragStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 1) {
      setIsDragging(false);
    }
    
    if (e.touches.length < 2) {
      setIsZooming(false);
      lastTouchDistance.current = null;
    }
  }, []);

  return (
    <div ref={ref} className="relative w-full h-full">
      {/* Pixi.js stage container - We need to make it have pointer events for pan/zoom */}
      <div 
        className={`absolute inset-0 z-20 flex justify-center items-center ${isMobile ? 'items-start pt-4' : ''}`}
      >
        <div
          className="w-full h-full flex items-center justify-center drag-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none' // Prevent browser handling of touch events
          }}
        >
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            options={{ 
              backgroundAlpha: 0,
              eventMode: 'static',
              eventFeatures: {
                move: true,
                globalMove: true,
                click: true,
                wheel: false // We handle wheel events at the container level
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'auto',
              objectFit: 'contain',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Container 
              ref={containerRef}
              position={containerPosition} 
              scale={scale} 
              sortableChildren
            >
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
      </div>
      
      {/* UI Elements */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className={`pointer-events-auto absolute ${isMobile ? 'bottom-20' : 'bottom-6'} left-0 w-full text-center text-xl font-bold text-[--theme-text-color]`}>
          {userInfo?.firstName && `${userInfo.firstName} Medical Center`}
        </div>
        
        {/* Zoom controls - moved to bottom right */}
        <div className={`pointer-events-auto absolute ${isMobile ? 'bottom-28' : 'bottom-4'} ${isMobile ? 'right-4' : 'right-4'} flex ${isMobile ? 'flex-row' : 'flex-col'} gap-2`}>
          <button 
            onClick={() => {
              const minZoom = 0.5;
              const maxZoom = 3.0;
              const zoomDelta = 0.2;
              setUserZoom(prev => Math.min(maxZoom, prev + zoomDelta));
            }}
            className={`${isMobile ? 'bg-[--theme-gradient-startstreak] bg-opacity-50' : 'bg-[--theme-gradient-startstreak]'} rounded-full ${isMobile ? 'p-3' : 'p-2'} shadow-lg flex items-center justify-center text-white`}
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "28" : "24"} height={isMobile ? "28" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button 
            onClick={() => {
              const minZoom = 0.5;
              const maxZoom = 3.0;
              const zoomDelta = 0.2;
              setUserZoom(prev => Math.max(minZoom, prev - zoomDelta));
            }}
            className={`${isMobile ? 'bg-[--theme-gradient-startstreak] bg-opacity-50' : 'bg-[--theme-gradient-startstreak]'} rounded-full ${isMobile ? 'p-3' : 'p-2'} shadow-lg flex items-center justify-center text-white`}
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "28" : "24"} height={isMobile ? "28" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button 
            onClick={() => {
              setUserZoom(1.0);
              setUserPan({ x: 0, y: 0 });
            }}
            className={`${isMobile ? 'bg-[--theme-gradient-startstreak] bg-opacity-50' : 'bg-[--theme-gradient-startstreak]'} rounded-full ${isMobile ? 'p-3' : 'p-2'} shadow-lg flex items-center justify-center text-white`}
            aria-label="Reset view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "28" : "24"} height={isMobile ? "28" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
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