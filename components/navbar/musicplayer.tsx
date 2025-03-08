//components/musicplayer.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FaPlay, FaPause, FaForward, FaVolumeUp } from "react-icons/fa";
import { useAudio } from "@/store/selectors";
import { toast } from "react-hot-toast";

interface Song {
  title: string;
  url: string;
}

// TODO: S3 recommended method:
// 1. Get AWS credentials from team (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
// 2. Add credentials to Vercel environment variables
// 3. Configure S3 bucket CORS to allow access from:
//    - https://your-production-domain.com
//    - http://localhost:3000
// This would provide better performance than proxying through our API.

const createProxyUrl = (url: string) => `/api/audio?url=${encodeURIComponent(url)}`;

const playlists: Record<string, Song[]> = {
  cyberSpace: [
    { title: "CS4", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace4.mp3") },
    { title: "CS1", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace2.mp3") },
    { title: "CS2", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace1.mp3") },
    { title: "CS3", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace3.mp3") },
    { title: "CS5", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace_5.mp3") },
    { title: "CS6", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/CyberSpace+6.mp3") },
    { title: "CS7", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace7.mp3") },
    { title: "CS8", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace8.mp3") },
    { title: "CS9", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace9.mp3") },
    { title: "CS10", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberSpace10.mp3") },
  ],
  sakuraTrees: [
    { title: "ST1", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees1.mp3") },
    { title: "ST2", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees2.mp3") },
    { title: "ST3", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees3.mp3") },
    { title: "ST4", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees4.mp3") },
    { title: "ST5", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/SakuraTrees5.mp3") },
    { title: "ST6", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuratrees6.mp3") },
    { title: "ST7", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees7.mp3") },
    { title: "ST8", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees8.mp3") },
    { title: "ST9", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuratrees9.mp3") },
    { title: "ST10", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees10.mp3") },
  ],
  sunsetCity: [
    { title: "SC1", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity1.mp3") },
    { title: "SC2", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity2.mp3") },
    { title: "SC4", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity4.mp3") },
    { title: "SC3", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity3.mp3") },
    { title: "SC5", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/SunsetCity5.mp3") },
    { title: "SC6", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/SunsetCity6.mp3") },
    { title: "SC7", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetcity7.mp3") },
    { title: "SC8", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity8.mp3") },
    { title: "SC9", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetcity9.mp3") },
    { title: "SC10", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity10.mp3") },
  ],
  mykonosBlue: [
    { title: "MB1", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue1.mp3") },
    { title: "MB2", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue2.mp3") },
    { title: "MB3", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue3.mp3") },
    { title: "MB4", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue4.mp3") },
    { title: "MB5", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue5.mp3") },
    { title: "MB6", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue6.mp3") },
    { title: "MB7", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue7.mp3") },
    { title: "MB8", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosBlue8.mp3") },
    { title: "MB9", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue9.mp3") },
    { title: "MB10", url: createProxyUrl("https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosBlue10.mp3") },
  ],
};

interface MusicPlayerProps {
  theme: string;
}

const MusicPlayer = ({ theme }: MusicPlayerProps) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Song[]>([]);
  const songIndexMap = useRef<Record<string, number>>({});
  
  const { 
    playMusic, 
    stopMusic,
    volume,
    setVolume,
    isPlaying,
    currentSong } = useAudio();

  const playlist = useMemo(() => {
    if (!playlists[theme]) {
      console.warn(`No playlist found for theme: ${theme}`);
      return [];
    }
    return playlists[theme];
  }, [theme]);

  const shufflePlaylist = useCallback(() => {
    const shuffled = [...playlist].sort(() => Math.random() - 0.6);
    setShuffledPlaylist(shuffled);
  }, [playlist]);

  useEffect(() => {
    if (shuffledPlaylist.length === 0) {
      shufflePlaylist();
    }
    if (songIndexMap.current[theme] !== undefined) {
      setCurrentSongIndex(songIndexMap.current[theme]);
    }
  }, [theme, shufflePlaylist, shuffledPlaylist.length]);

  const playNextSong = useCallback(() => {
    // Don't auto-advance if playback is paused
    if (!isPlaying) {
      return;
    }

    const newIndex = (currentSongIndex + 1) % shuffledPlaylist.length;
    const nextSong = shuffledPlaylist[newIndex];
    
    if (nextSong) {      
      // Update index before stopping current playback
      setCurrentSongIndex(newIndex);
      songIndexMap.current[theme] = newIndex;
      
      // Stop current playback
      stopMusic();
      
      // Only start next song if we're still playing
      if (isPlaying) {
        setTimeout(() => {
          playMusic(nextSong.url, true, playNextSong);
        }, 50);
      }
    }
  }, [shuffledPlaylist, currentSongIndex, theme, stopMusic, playMusic, isPlaying]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopMusic();
    } else {
      const currentSong = shuffledPlaylist[currentSongIndex];
      if (currentSong) {
        playMusic(currentSong.url, true, playNextSong);
      }
    }
  }, [isPlaying, currentSongIndex, shuffledPlaylist, stopMusic, playMusic, playNextSong]);

  // Preload current and next song
  useEffect(() => {
    if (shuffledPlaylist.length > 0) {
      const currentSong = shuffledPlaylist[currentSongIndex];
      const nextIndex = (currentSongIndex + 1) % shuffledPlaylist.length;
      const nextSong = shuffledPlaylist[nextIndex];

      // Preload current song
      fetch(currentSong.url).catch(console.error);
      // Preload next song
      fetch(nextSong.url).catch(console.error);
    }
  }, [currentSongIndex, shuffledPlaylist]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, [setVolume]);

  return (
    <div className="flex items-center space-x-2">
      <button onClick={handleTogglePlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <button onClick={playNextSong}>
        <FaForward />
      </button>
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
    </div>
  );
};

export default MusicPlayer;
