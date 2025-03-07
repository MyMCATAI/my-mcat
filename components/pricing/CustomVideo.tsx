import dynamic from 'next/dynamic';

/* ----- Types ---- */
export interface CustomVideoProps {
  src: string;
  poster?: string;
  options?: Plyr.Options;
}

// Dynamically import Plyr with no SSR
const Plyr = dynamic(() => import('plyr-react'), { 
  ssr: false,
  loading: () => <div className="w-full aspect-video bg-black/50 animate-pulse rounded-lg"></div>
});

export const CustomVideo = ({ src, poster, options = {} }: CustomVideoProps) => {
  const defaultOptions: Plyr.Options = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'fullscreen'
    ],
    ratio: '16:9',
    fullscreen: { enabled: true, fallback: true, iosNative: true },
    ...options
  };

  const source: { type: 'video'; sources: { src: string; type: string; }[]; poster?: string } = {
    type: 'video',
    sources: [{ src, type: 'video/mp4' }],
    poster
  };

  return (
    <div className="w-full aspect-video relative">
      <Plyr source={source} options={defaultOptions} />
    </div>
  );
}; 