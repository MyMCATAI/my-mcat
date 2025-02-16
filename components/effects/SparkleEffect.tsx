import React, { useState, useCallback, useRef } from 'react';

type DispersionType = 'burst' | 'float';

interface SparkleEffectProps {
  enabled: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  customParticle?: string[];
  dispersion?: DispersionType;
  size?: 'normal' | 'small';
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({ 
  enabled, 
  children, 
  onClick,
  customParticle = [],
  dispersion = 'burst',
  size = 'normal'
}) => {
  const MAX_BURST_PARTICLES = 35;
  const currentParticleCount = useRef(0);
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    tx: number;
    ty: number;
    rotation: number;
    scale: number;
    content: string;
  }>>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const isHovering = useRef(false);
  const floatTimeoutRef = useRef<NodeJS.Timeout>();
  const burstTimeoutRef = useRef<NodeJS.Timeout>();

  const getSizeConfig = () => {
    return size === 'small' ? {
      baseSize: 12,
      sizeVariation: 8,
      radius: 25,
      tx: 75,
      ty: 75
    } : {
      baseSize: 15,
      sizeVariation: 15,
      radius: 40,
      tx: 150,
      ty: 150
    };
  };

  const generateSparkles = useCallback((centerX: number, centerY: number) => {
    if (!enabled) return;
    
    if (dispersion === 'burst' && currentParticleCount.current >= MAX_BURST_PARTICLES) {
      return;
    }

    const numParticles = dispersion === 'burst' ? 2 : 1;
    const sizeConfig = getSizeConfig();
    const newSparkles = Array.from({ length: numParticles }, (_, i) => {
      if (dispersion === 'burst') {
        const angle = (Math.random() * 2 * Math.PI);
        const radius = Math.random() * sizeConfig.radius;
        
        return {
          id: Date.now() + i,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          size: Math.random() * sizeConfig.sizeVariation + sizeConfig.baseSize,
          tx: (Math.random() - 0.5) * sizeConfig.tx,
          ty: (Math.random() - 0.5) * sizeConfig.ty,
          rotation: Math.random() * 720 - 360,
          scale: Math.random() * 0.5 + 1.5,
          content: customParticle.length > 0 
            ? customParticle[Math.floor(Math.random() * customParticle.length)]
            : '⭐'
        };
      } else {
        // Float dispersion - continuous gentle upward flow
        const horizontalDirection = Math.random() > 0.5 ? 1 : -1;
        const horizontalRange = 30 + Math.random() * 20; // Random range between 30-50px
        const floatSpeed = 100 + Math.random() * 50; // Random speed between 100-150px
        const startOffset = (Math.random() - 0.5) * 20;

        return {
          id: Date.now() + i,
          x: centerX + startOffset,
          y: centerY,
          size: Math.random() * 15 + 30,
          tx: horizontalDirection * horizontalRange,
          ty: -floatSpeed,
          rotation: 0,
          scale: Math.random() * 0.3 + 1.2,
          content: customParticle.length > 0 
            ? customParticle[Math.floor(Math.random() * customParticle.length)]
            : '⭐'
        };
      }
    });

    if (dispersion === 'burst') {
      currentParticleCount.current += numParticles;
    }
    setSparkles(prev => [...prev, ...newSparkles]);
    
    if (dispersion === 'burst') {
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => !newSparkles.find(n => n.id === s.id)));
        currentParticleCount.current -= numParticles;
      }, 1500);

      if (isHovering.current) {
        clearTimeout(burstTimeoutRef.current);
        burstTimeoutRef.current = setTimeout(() => {
          if (mousePosition) {
            generateSparkles(mousePosition.x, mousePosition.y);
          }
        }, 150);
      }
    } else {
      // For float, remove particles after they've floated up
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => !newSparkles.find(n => n.id === s.id)));
      }, 2000);

      // Continue generating particles if still hovering
      if (isHovering.current) {
        clearTimeout(floatTimeoutRef.current);
        floatTimeoutRef.current = setTimeout(() => {
          if (mousePosition) {
            generateSparkles(mousePosition.x, mousePosition.y);
          }
        }, 100);
      }
    }
  }, [enabled, customParticle, mousePosition, dispersion, size]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    generateSparkles(x, y);
  }, [generateSparkles]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    isHovering.current = true;
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    isHovering.current = false;
    setMousePosition(null);
  };

  // Clean up both timeouts
  React.useEffect(() => {
    return () => {
      if (floatTimeoutRef.current) {
        clearTimeout(floatTimeoutRef.current);
      }
      if (burstTimeoutRef.current) {
        clearTimeout(burstTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className="w-full h-full"
      >
        {children}
      </div>

      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animation: 'sparkle-float 1.5s ease-out forwards',
            '--tx': `${sparkle.tx}px`,
            '--ty': `${sparkle.ty}px`,
            '--r': `${sparkle.rotation}deg`,
            '--s': sparkle.scale,
            fontSize: `${sparkle.size}px`,
            lineHeight: 1
          } as any}
        >
          {sparkle.content}
        </div>
      ))}
    </div>
  );
}; 