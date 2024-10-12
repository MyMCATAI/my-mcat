import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaForward, FaVolumeUp } from 'react-icons/fa';

interface Song {
  title: string;
  url: string;
}

const playlists: Record<string, Song[]> = {
  cyberSpace: [
    { title: "CS4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace4.mp3" },
    { title: "CS1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace2.mp3" },
    { title: "CS2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace1.mp3" },
    { title: "CS3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace3.mp3" },
  ],
  sakuraTrees: [
    { title: "ST1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees1.mp3" },
    { title: "ST2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees2.mp3" },
    { title: "ST3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees3.mp3" },
    { title: "ST4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees4.mp3" },
  ],
  sunsetCity: [
    { title: "SC1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity1.mp3" },
    { title: "SC2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity2.mp3" },
    { title: "SC4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity4.mp3" },
    { title: "SC3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity3.mp3" },
  ],
};

const MusicPlayer = ({ theme }: { theme: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playlist = playlists[theme] || [];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(handlePlayError);
      }
    }
  }, [currentSongIndex, theme]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(handlePlayError);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handlePlayError = (e: any) => {
    console.error("Error playing audio:", e);
    setError("Unable to play audio. Please try again.");
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <audio
        ref={audioRef}
        src={playlist[currentSongIndex]?.url}
        onEnded={playNextSong}
        onError={() => {
          setError("Error loading audio. Please try another song.");
          setIsPlaying(false);
        }}
      />
      <button onClick={togglePlayPause} disabled={!!error}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <button onClick={playNextSong}><FaForward /></button>
      <div className="relative group flex items-center">
        <FaVolumeUp className="cursor-pointer mr-2" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-16 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

export default MusicPlayer;
