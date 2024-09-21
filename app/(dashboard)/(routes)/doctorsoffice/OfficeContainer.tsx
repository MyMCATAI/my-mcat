import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

// Define an interface for the image objects
interface GridImage {
  id: string;  // Add this line
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

const OfficeContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Move the images state declaration up
  const [images] = useState<GridImage[]>([
    { id: 'OperatingRoom1', src: '/game-components/OperatingRoom1.png', x: 0.04, y: 2, width: 268, height: 256, zIndex: 2 },
    { id: 'CATScan1', src: '/game-components/CATScan1.png', x: 8.1, y: 0.15, width: 270, height: 240, zIndex: 7 },
    { id: 'CATScan2', src: '/game-components/CATScan1.png', x: 6.1, y: 0.15, width: 270, height: 240, zIndex: 6 },
    { id: 'MedicalCloset1', src: '/game-components/MedicalCloset1.png', x: 0, y: 0.1, width: 302, height: 255, zIndex: 1 },
    { id: 'MRIMachine1', src: '/game-components/MRIMachine.png', x: 4.06, y: 0.11, width: 256, height: 256, zIndex: 5 },
    { id: 'MRIMachine2', src: '/game-components/MRIMachine.png', x: 2.06, y: 0.11, width: 256, height: 256, zIndex: 4 },
    { id: 'HighCare1', src: '/game-components/HighCare1.png', x: 0.06, y: 4, width: 276, height: 260, zIndex: 6 },
    { id: 'HighCare2', src: '/game-components/HighCare1.png', x: 0.1, y: 6, width: 275, height: 265, zIndex: 7 },
    { id: 'ExaminationRoom1', src: '/game-components/ExaminationRoom1.png', x: 3.8, y: 5.9, width: 304, height: 288, zIndex: 12},
    { id: 'WaitingRoom1', src: '/game-components/WaitingRoom1.png', x: 7.76, y: 7.95, width: 285, height: 280, zIndex: 12, opacity: 1.0},
    { id: 'DoctorsOffice1', src: '/game-components/DoctorsOffice1.png', x: 0, y: 7.95, width: 280, height: 280, zIndex: 8},
  ]);

  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set(images.map(img => img.id)));
  
  // Adjust initial offset to move the grid up
  const initialOffset = {
    x: (gridWidth + gridHeight) * (tileWidth / 4),
    y: (gridHeight * tileHeight) / 2 - 200  // Subtract a value to move up
  };
  
  const [offset, setOffset] = useState(initialOffset);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const [scale, setScale] = useState(1);

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
      const maxScale = .8;
      scale = Math.min(scale, maxScale);

      // Apply a small reduction factor for better fit on laptops
      return scale * 1.0;
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
      setOffset({...offset});
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas size calculation
    const canvasWidth = (gridWidth + gridHeight) * (tileWidth / 2);
    const canvasHeight = (gridWidth + gridHeight) * (tileHeight / 2);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const drawScene = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply the offset and scale
      ctx.save();
      ctx.scale(scale, scale);
      ctx.translate(offset.x, offset.y);

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

          // Fill tile with white color for specified areas, transparent for others
          if (x < 4 || y < 4 || y >= gridHeight - 2) {
            ctx.fillStyle = '#FFFFFF'; // White color for specified areas
            ctx.fill();
          }
          // No else block needed, as we want other tiles to be transparent
        }
      }

      // Sort images by zIndex before rendering
      const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex);

      // Draw images
      sortedImages.forEach((img) => {
        if (visibleImages.has(img.id)) {  // Change this line
          const loadedImg = loadedImages[img.src];
          if (loadedImg) {
            const posX = screenX(img.x, img.y) - img.width / 4;
            const posY = screenY(img.x, img.y) - img.height / 2;
            
            // Apply opacity if specified
            if (img.opacity !== undefined) {
              ctx.globalAlpha = img.opacity;
            }
            
            ctx.drawImage(loadedImg, posX, posY, img.width, img.height);
            
            // Reset globalAlpha to 1 (fully opaque) after drawing each image
            ctx.globalAlpha = 1;
          }
        }
      });

      ctx.restore();
    };

    drawScene();
  }, [images, offset, loadedImages, scale, visibleImages]);  // Add visibleImages to the dependency array

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setStartDragPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const newOffset = {
      x: e.clientX - startDragPos.x,
      y: e.clientY - startDragPos.y
    };
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleImage = (id: string) => {
    setVisibleImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-wrap gap-2 p-4 bg-gray-100">
        {images.map((img) => (
          <Button
            key={img.id}
            onClick={() => toggleImage(img.id)}
            variant={visibleImages.has(img.id) ? "default" : "outline"}
          >
            {img.id.replace(/\d+$/, '')}
          </Button>
        ))}
      </div>
      <div ref={containerRef} className="flex-grow flex justify-center items-center">
        <div className="w-full h-full bg-[#001226] rounded-lg flex justify-center items-center overflow-hidden">
          <canvas
            ref={canvasRef}
            className="cursor-move"
            style={{
              width: `${(gridWidth + gridHeight) * (tileWidth / 2) * scale}px`,
              height: `${(gridWidth + gridHeight) * (tileHeight / 2) * scale}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
};

export default OfficeContainer;
