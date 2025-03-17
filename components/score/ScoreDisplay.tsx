import Image from 'next/image';

interface ScoreDisplayProps {
  score: number;
  textClassName?: string;
}

const ScoreDisplay = ({ score, textClassName="font-bold text-2xl" }: ScoreDisplayProps) => {
  return (
    <div 
      className="flex items-center gap-2 rounded-2xl px-4 py-2 transition-all duration-200"
      style={{
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 30
      }}
    >
      <span 
        className={textClassName} 
        style={{ color: 'var(--theme-text-color)' }}
      >
        {score}
      </span>
      <div className="relative">
        <Image
          src="/game-components/PixelCupcake.png"
          alt="Coins"
          width={36}
          height={36}
          className="transform hover:scale-110 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default ScoreDisplay;