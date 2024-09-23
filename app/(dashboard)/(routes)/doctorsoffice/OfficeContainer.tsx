import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SpriteWalking from './SpriteWalking';
import ShoppingDialog from './ShoppingDialog';
import { Home, ShoppingCart } from 'lucide-react';

// Define the Direction type at the top of the file
type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

// Define an interface for the image objects
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

// Define an interface for sprite objects
interface Sprite {
  id: string;
  type: 'sprite';
  x: number;
  y: number;
  direction: Direction;
  character: number;
  zIndex: number;
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

// Define the ImageGroup interface
interface ImageGroup {
  name: string;
  items: { id: string; src: string }[];
}

// Modify the spriteWaypoints to include directions
const spriteWaypoints: Record<string, Waypoint[]> = {
  sprite1: [
    { x: 9, y: 9, direction: 'NW' },  // Start at waiting room
    { x: 3, y: 9, direction: 'NW' },  // Move NW to bottom left
    { x: 3, y: 1.5, direction: 'NE' },  // Move NE to top left
    { x: 9, y: 1.5, direction: 'SE' },  // Move SE to top right
    { x: 3, y: 1.5, direction: 'NW' },  // Move NW to top left
    { x: 3, y: 9, direction: 'SW' },  // Move SW to bottom left
    { x: 9, y: 9, direction: 'SE' },  // Move SE back to waiting room
  ],
  sprite2: [
    { x: 1, y: 1, direction: 'N' },  // Start near top left
    { x: 1, y: 8, direction: 'S' },  // Move down
    { x: 8, y: 8, direction: 'SW' },  // Move to bottom right
    { x: 8, y: 1, direction: 'N' },  // Move up
    { x: 1, y: 1, direction: 'NE' }   // Return to start
  ],
  sprite3: [
    { x: 8, y: 8, direction: 'SW' },  // Start near bottom right
    { x: 0, y: 8, direction: 'W' },  // Move to bottom left
    { x: 0, y: 0, direction: 'NW' },  // Move to top left
    { x: 8, y: 0, direction: 'E' },  // Move to top right
    { x: 8, y: 8, direction: 'SE' },  // Return to start
  ]
};

const OfficeContainer: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Move the images state declaration up
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

  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set(images.map(img => img.id)));
  
  // Define offset as a constant instead of state
  const offset = {
    x: (gridWidth + gridHeight) * (tileWidth / 3.5),
    y: (gridHeight * tileHeight) / 2 - 160
  };
  
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const [scale, setScale] = useState(1);

  // Update the sprite1PositionRef to include direction
  const sprite1PositionRef = useRef<{ x: number; y: number; direction: Direction }>({ x: 9, y: 9, direction: 'S' });
  const sprite2PositionRef = useRef<{ x: number; y: number; direction: Direction }>({ x: 1, y: 1, direction: 'N' });
  const sprite3PositionRef = useRef<{ x: number; y: number; direction: Direction }>({ x: 8, y: 8, direction: 'SW' });

  const sprite1WaypointIndexRef = useRef(0);
  const sprite2WaypointIndexRef = useRef(0);
  const sprite3WaypointIndexRef = useRef(0);

  // Function to calculate positions
  function screenX(worldX: number, worldY: number): number {
    return (worldX - worldY) * (tileWidth / 2);
  }

  function screenY(worldX: number, worldY: number): number {
    return (worldX + worldY) * (tileHeight / 2);
  }

  // Modify the calculateScale function
  const calculateScale = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const baseWidth = (gridWidth + gridHeight) * (tileWidth / 2);
      const baseHeight = (gridWidth + gridHeight) * (tileHeight / 2);
      
      const scaleX = containerWidth / baseWidth;
      const scaleY = containerHeight / baseHeight;

      // Use the smaller scale to ensure the canvas fits in both dimensions
      let scale = Math.min(scaleX, scaleY);
      
      // Apply a maximum scale to prevent the grid from becoming too large on big screens
      const maxScale = .72;
      scale = Math.min(scale, maxScale);

      // Apply a small reduction factor for better fit on laptops
      return scale * 1.1;
    }
    return 1;
  };

  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Preload images
    const imagePromises = images.map(img => {
      return new Promise<void>((resolve) => {
        const imgObj = new Image();
        imgObj.onload = () => {
          setLoadedImages(prev => ({ ...prev, [img.src]: imgObj }));
          resolve();
        };
        imgObj.src = img.src;
      });
    });

    Promise.all(imagePromises).then(() => {
      // All images are loaded, force a re-render
      // Remove this line as we no longer need to update offset
      // setOffset({...offset});
    });
  }, [images]);

  // Update the moveSprite function to use the specified direction
  const moveSprite = useCallback((
    positionRef: React.MutableRefObject<{ x: number; y: number; direction: Direction }>,
    waypoints: Waypoint[],
    waypointIndexRef: React.MutableRefObject<number>
  ) => {
    const speed = 0.1; // Increase this value to make the sprite move faster
    const currentWaypoint = waypoints[waypointIndexRef.current];
    const position = positionRef.current;
    
    const dx = currentWaypoint.x - position.x;
    const dy = currentWaypoint.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
      waypointIndexRef.current = (waypointIndexRef.current + 1) % waypoints.length;
      position.direction = currentWaypoint.direction;
    } else {
      position.x += (dx / distance) * speed;
      position.y += (dy / distance) * speed;
      position.direction = currentWaypoint.direction;
    }
  }, []);

  // Use useEffect to set up the animation loop for all sprites
  useEffect(() => {
    const animationInterval = setInterval(() => {
      moveSprite(sprite1PositionRef, spriteWaypoints.sprite1, sprite1WaypointIndexRef);
      moveSprite(sprite2PositionRef, spriteWaypoints.sprite2, sprite2WaypointIndexRef);
      moveSprite(sprite3PositionRef, spriteWaypoints.sprite3, sprite3WaypointIndexRef);
    }, 50);

    return () => clearInterval(animationInterval);
  }, [moveSprite]);

  // Update the drawScene function
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable image smoothing for the entire canvas
    ctx.imageSmoothingEnabled = true;

    // Adjust canvas size calculation
    const canvasWidth = (gridWidth + gridHeight) * (tileWidth / 2);
    const canvasHeight = (gridWidth + gridHeight) * (tileHeight / 2);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply the offset and scale
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offset.x, offset.y);

    // Get the computed style of the canvas element
    const themeElement = 
      document.querySelector('.theme-sunsetCity') || 
      document.querySelector('.theme-sakuraTrees') || 
      document.querySelector('.theme-cyberSpace') || 
      document.documentElement;
    const computedStyle = getComputedStyle(themeElement);
    const accentColor = computedStyle.getPropertyValue('--theme-doctorsoffice-accent').trim();

    // Draw isometric grid
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const posX = screenX(x, y);
        const posY = screenY(x, y);

        // Draw tile outline
        ctx.beginPath();
        ctx.moveTo(posX, posY + tileHeight / 2);
        ctx.lineTo(posX + tileWidth / 2, posY);
        ctx.lineTo(posX + tileWidth, posY + tileHeight / 2);
        ctx.lineTo(posX + tileWidth / 2, posY + tileHeight);
        ctx.closePath();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Fill tile with the theme accent color for specified areas
        if (x < 4 || y < 4 || y >= gridHeight - 2) {
          ctx.fillStyle = accentColor || '#001226'; // Fallback color if CSS variable is not set
          
          // Set opacity to 10% for the two rows on the far left and the two rows on top
          if (x < 2 || y < 2) {
            ctx.globalAlpha = 0.1;
          } else {
            ctx.globalAlpha = 1;
          }
          
          ctx.fill();
        }
        // Reset globalAlpha to 1 after each tile
        ctx.globalAlpha = 1;
      }
    }

    // Sort images and sprites by zIndex
    const allElements = [
      ...images.map(img => ({ ...img, type: 'image' as const })),
      { id: 'sprite1', type: 'sprite' as const, ...sprite1PositionRef.current, character: 1, zIndex: 11 },
      //{ id: 'sprite2', type: 'sprite' as const, ...sprite2PositionRef.current, character: 2, zIndex: 11 },
      //{ id: 'sprite3', type: 'sprite' as const, ...sprite3PositionRef.current, character: 3, zIndex: 11 },
    ].sort((a, b) => a.zIndex - b.zIndex);

    // Draw all elements in order
    allElements.forEach((element) => {
      if (element.type === 'image') {
        // Draw image
        const img = element as GridImage;
        if (visibleImages.has(img.id) && loadedImages[img.src]) {
          const loadedImg = loadedImages[img.src];
          const posX = screenX(img.x, img.y) - img.width / 4;
          const posY = screenY(img.x, img.y) - img.height / 2;
          
          if (img.opacity !== undefined) {
            ctx.globalAlpha = img.opacity;
          }
          
          ctx.drawImage(loadedImg, posX, posY, img.width, img.height);
          
          ctx.globalAlpha = 1;
        }
      } else if (element.type === 'sprite') {
        // Draw sprite
        const sprite = element as Sprite;
        const posX = screenX(sprite.x, sprite.y);
        const posY = screenY(sprite.x, sprite.y);
        
        // Adjust the drawing position to align with the grid
        const adjustedPosX = Math.round(posX);
        const adjustedPosY = Math.round(posY - tileHeight / 4);
        
        console.log(`Drawing sprite ${sprite.character} at (${sprite.x}, ${sprite.y}) facing ${sprite.direction}`);
        
        SpriteWalking.drawSprite(ctx, spriteSheetUrl, { x: adjustedPosX, y: adjustedPosY }, sprite.character, sprite.direction, scale);
      }
    });

    ctx.restore();
  }, [images, offset, loadedImages, scale, visibleImages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawScene();
      requestAnimationFrame(animate);
    };

    animate();
  }, [drawScene]);

  const imageGroups: ImageGroup[] = [
    {
      name: "Basic Rooms",
      items: [
        { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png' },
        { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png' },
        { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png' },
      ]
    },
    {
      name: "Examination and Bathrooms",
      items: [
        { id: 'ExaminationRoom2', src: '/game-components/ExaminationRoom1.png' },
        { id: 'Bathroom1', src: '/game-components/Bathroom1.png' },
        { id: 'Bathroom2', src: '/game-components/Bathroom1.png' },
      ]
    },
    {
      name: "High Care Rooms",
      items: [
        { id: 'HighCare1', src: '/game-components/HighCare1.png' },
        { id: 'HighCare2', src: '/game-components/HighCare1.png' },
      ]
    },
    {
      name: "Operating Suite",
      items: [
        { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png' },
        { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png' },
        { id: 'MRIMachine2', src: '/game-components/MRIMachine.png' },
      ]
    },
    {
      name: "Additional MRI",
      items: [
        { id: 'MRIMachine1', src: '/game-components/MRIMachine.png' },
      ]
    },
    {
      name: "CAT-Scan Suite",
      items: [
        { id: 'CATScan1', src: '/game-components/CATScan1.png' },
        { id: 'CATScan2', src: '/game-components/CATScan1.png' },
      ]
    },
  ];

  const toggleGroup = (groupName: string) => {
    const group = imageGroups.find(g => g.name === groupName);
    if (!group) return;

    const allVisible = group.items.every(item => visibleImages.has(item.id));
    setVisibleImages(prev => {
      const newSet = new Set(prev);
      group.items.forEach(item => {
        if (allVisible) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
      });
      return newSet;
    });
  };

  const spriteSheetUrl = '/game-components/sprite-sheet.png'; // Update with the actual path

  const handleHomeClick = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col w-full h-full relative">
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <ShoppingDialog
          imageGroups={imageGroups}
          visibleImages={visibleImages}
          toggleGroup={toggleGroup}
          buttonContent={
            <div className="flex items-center justify-start gap-2 w-full">
              <ShoppingCart size={20} />
              <span>Marketplace</span>
            </div>
          }
        />
        <button
          onClick={handleHomeClick}
          className="flex items-center justify-start gap-2 px-4 py-2 bg-[--theme-doctorsoffice-accent] border border-[--theme-border-color] text-[--theme-text-color] rounded-md hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] transition-colors w-full"
        >
          <Home size={20} />
          <span>Home</span>
        </button>
      </div>
      <div ref={containerRef} className="flex-grow flex justify-center items-center">
        <div className="w-full h-full rounded-lg flex justify-center items-center overflow-hidden">
          <div className="absolute inset-0 bg-[--theme-leaguecard-color] border-2 border-[--theme-border-color] opacity-40"></div>
          <canvas
            ref={canvasRef}
            className="relative z-10"
            style={{
              width: `${(gridWidth + gridHeight) * (tileWidth / 2) * scale}px`,
              height: `${(gridWidth + gridHeight) * (tileHeight / 2) * scale}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OfficeContainer;