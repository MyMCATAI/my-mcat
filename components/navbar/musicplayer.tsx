//components/navbar/musicplayer.tsx
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { FaPlay, FaPause, FaForward, FaVolumeUp } from "react-icons/fa";
import { useAudio } from "@/store/selectors";
import { ThemeType } from "@/store/slices/uiSlice";

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
  theme: ThemeType;
}

const MusicPlayer = ({ theme }: MusicPlayerProps) => {
  const hasInitialized = useRef(false);
  const queueInitialized = useRef(false);
  
  const { 
    volume,
    setVolume,
    isPlaying,
    skipToNext,
    togglePlayPause,
    handleThemeChange,
    initializeAudioContext,
    setSongQueue,
    songQueue,
    audioContext,
  } = useAudio();

  const playlist = useMemo(() => {
    if (!playlists[theme]) {
      return [];
    }
    return playlists[theme];
  }, [theme]);

  // Initialize audio context on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('[MusicPlayer] Initializing audio context');
      initializeAudioContext().then(() => {
        hasInitialized.current = true;
        console.log('[MusicPlayer] Audio context initialized successfully');
      }).catch((error) => {
        console.error('[MusicPlayer] Failed to initialize audio context:', error);
      });
    }
  }, [initializeAudioContext, audioContext]);

  // Initialize playlist and handle theme changes
  useEffect(() => {
    console.log('[MusicPlayer] Theme changed or component mounted, theme:', theme);
    // Use the playlist in its original order instead of shuffling
    const orderedPlaylist = [...playlist];
    
    // Check if the first song URL contains the current theme name
    const firstSongMatchesTheme = songQueue.length > 0 && 
                                 songQueue[0] && 
                                 typeof songQueue[0] === 'string' && 
                                 songQueue[0].toLowerCase().includes(theme.toLowerCase());
    
    // Only update queue if it's empty or theme has changed
    const shouldUpdateQueue = !queueInitialized.current || 
                             songQueue.length === 0 || 
                             !firstSongMatchesTheme;
    
    console.log('[MusicPlayer] Queue status:', { 
      initialized: queueInitialized.current, 
      queueLength: songQueue.length, 
      firstSongMatchesTheme, 
      shouldUpdateQueue 
    });
    
    if (shouldUpdateQueue && orderedPlaylist.length > 0) {
      console.log('[MusicPlayer] Updating song queue for theme:', theme);
      // Update song queue in audio store
      const songUrls = orderedPlaylist.map(song => song.url);
      queueInitialized.current = true;
      setSongQueue(songUrls);
      handleThemeChange(theme);
    }
  }, [theme, playlist, handleThemeChange, setSongQueue, songQueue]);

  // UI handlers that delegate to audio slice
  const handleTogglePlay = useCallback(() => {    
    console.log('[MusicPlayer] Toggle play button clicked');
    if (!audioContext) {
      console.log('[MusicPlayer] No audio context, initializing first');
      initializeAudioContext().then(() => {
        console.log('[MusicPlayer] Audio context initialized, now toggling playback');
        togglePlayPause();
      }).catch((error) => {
        console.error('[MusicPlayer] Failed to initialize audio context:', error);
      });
      return;
    }
    
    if (songQueue.length === 0) {
      console.log('[MusicPlayer] Empty song queue, initializing with current theme');
      // Try to initialize the queue
      const orderedPlaylist = [...playlist];
      const songUrls = orderedPlaylist.map(song => song.url);
      setSongQueue(songUrls);
      
      // Small delay to ensure queue is set before playing
      setTimeout(() => {
        console.log('[MusicPlayer] Queue set, now toggling playback');
        togglePlayPause();
      }, 100);
      return;
    }
    
    console.log('[MusicPlayer] Toggling playback with existing queue');
    togglePlayPause();
  }, [togglePlayPause, songQueue.length, audioContext, initializeAudioContext, playlist, setSongQueue]);

  const handleNextSong = useCallback(() => {
    console.log('[MusicPlayer] Next song button clicked');
    if (!audioContext || songQueue.length === 0) {
      console.log('[MusicPlayer] Cannot skip, no audio context or empty queue');
      return;
    }
    
    console.log('[MusicPlayer] Skipping to next song');
    skipToNext();
  }, [skipToNext, songQueue.length, audioContext]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, [setVolume]);

  // Render the UI with the same layout/look
  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={handleTogglePlay}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        style={{ color: theme === 'cleanWhite' ? '#2ab2b0' : 'inherit' }}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <button 
        onClick={handleNextSong}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        style={{ color: theme === 'cleanWhite' ? '#2ab2b0' : 'inherit' }}
      >
        <FaForward />
      </button>
      <div className="relative group flex items-center">
        <FaVolumeUp 
          className="cursor-pointer mr-2" 
          style={{ color: theme === 'cleanWhite' ? '#2ab2b0' : 'inherit' }}
        />
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
