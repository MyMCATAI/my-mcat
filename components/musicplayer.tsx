import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaForward, FaVolumeUp } from "react-icons/fa";

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
    { title: "CS5", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace_5.mp3" },
    { title: "CS6", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/CyberSpace+6.mp3" },
    { title: "CS7", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/cyberspace7.mp3" },
  ],
  sakuraTrees: [
    { title: "ST1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees1.mp3" },
    { title: "ST2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees2.mp3" },
    { title: "ST3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees3.mp3" },
    { title: "ST4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees4.mp3" },
    { title: "ST5", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/SakuraTrees5.mp3" },
    { title: "ST6", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuratrees6.mp3" },
    { title: "ST7", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sakuraTrees7.mp3" },
  ],
  sunsetCity: [
    { title: "SC1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity1.mp3" },
    { title: "SC2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity2.mp3" },
    { title: "SC4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity4.mp3" },
    { title: "SC3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetCity3.mp3" },
    { title: "SC5", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/SunsetCity5.mp3" },
    { title: "SC6", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/SunsetCity6.mp3" },
    { title: "SC7", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/sunsetcity7.mp3" },
  ],
  mykonosBlue: [
    { title: "MB1", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue1.mp3" },
    { title: "MB2", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue2.mp3" },
    { title: "MB3", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue3.mp3" },
    { title: "MB4", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue4.mp3" },
    { title: "MB5", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue5.mp3" },
    { title: "MB6", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue6.mp3" },
    { title: "MB7", url: "https://my-mcat.s3.us-east-2.amazonaws.com/music/mykonosblue7.mp3" },
  ],
};

const MusicPlayer = ({ theme }: { theme: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Song[]>([]);
  const songIndexMap = useRef<Record<string, number>>({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const playlist = playlists[theme] || [];

  const shufflePlaylist = useCallback(() => {
    const shuffled = [...playlist].sort(() => Math.random() - 0.6);
    setShuffledPlaylist(shuffled);
    setCurrentSongIndex(0);
  }, [playlist]);

  useEffect(() => {
    if (songIndexMap.current[theme] !== undefined) {
      setCurrentSongIndex(songIndexMap.current[theme]);
    } else {
      shufflePlaylist();
      setCurrentSongIndex(0);
    }
    // Remove this line to prevent autoplay when theme changes
    // setIsPlaying(true);
  }, [theme, shufflePlaylist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex, shuffledPlaylist, isPlaying]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (shuffledPlaylist.length === 0) {
          shufflePlaylist();
        }
        audioRef.current.play().catch(() => {
          // Silently handle the error without setting an error message
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextSong = () => {
    setCurrentSongIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % shuffledPlaylist.length;
      songIndexMap.current[theme] = newIndex;
      return newIndex;
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handlePlayError = (e: any) => {
    console.error("Error playing audio:", e);
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <audio
        ref={audioRef}
        src={shuffledPlaylist[currentSongIndex]?.url}
        onEnded={playNextSong}
        onError={() => {
          console.log("audio error")
          setIsPlaying(false);
        }}
      />
      <button onClick={togglePlayPause}>
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
