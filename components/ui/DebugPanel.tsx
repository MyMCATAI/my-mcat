"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUI, useUser, useGame, useAudio } from '@/store/selectors'

/* --- Constants ----- */
const DEBUG_PARAM = 'debug'

const DebugPanel = () => {
  /* ---- State ----- */
  const searchParams = useSearchParams()
  const pathname = usePathname() || ''
  const [isDebug, setIsDebug] = useState(false)
  
  // Zustand state
  const uiState = useUI()
  const userState = useUser()
  const gameState = useGame()
  const audioState = useAudio()

  /* --- Effects --- */
  // Simple debug mode logic - only use URL parameter
  useEffect(() => {
    const debugValue = searchParams?.get(DEBUG_PARAM)
    
    if (debugValue === 'true') {
      setIsDebug(true)
      document.body.classList.add('debug-mode')
    } else {
      // Any other value (including null) - disable debug mode
      setIsDebug(false)
      document.body.classList.remove('debug-mode')
    }
  }, [searchParams, pathname])

  // Create a safe version of audio state for display (without functions)
  const displayAudioState = {
    // Basic state
    isPlaying: audioState.isPlaying,
    currentSong: audioState.currentSong,
    currentSongTitle: audioState.getCurrentSongTitle ? audioState.getCurrentSongTitle() : 'Unknown',
    currentLoop: audioState.currentLoop,
    volume: audioState.volume,
    songQueue: Array.isArray(audioState.songQueue) ? audioState.songQueue : [],
    queueLength: Array.isArray(audioState.songQueue) ? audioState.songQueue.length : 0,
    
    // Advanced state
    currentMusic: audioState.currentMusic,
    masterVolume: audioState.masterVolume,
    currentSongIndex: audioState.currentSongIndex,
    audioContext: audioState.audioContext ? 'initialized' : 'null',
    
    // Audio sources
    sources: {
      music: audioState.musicSource ? 'active' : 'null',
      loop: audioState.loopSource ? 'active' : 'null',
      voice: audioState.voiceSource ? 'active' : 'null',
    },
    
    // Gain nodes
    gainNodes: {
      master: audioState.masterGainNode ? 'active' : 'null',
      music: audioState.musicGainNode ? 'active' : 'null',
      sfx: audioState.sfxGainNode ? 'active' : 'null',
      loop: audioState.loopGainNode ? 'active' : 'null',
      voice: audioState.voiceGainNode ? 'active' : 'null'
    }
  };

  // Don't render anything if not in debug mode
  if (!isDebug) return null;

  // Debug panel UI
  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-4 rounded-lg max-w-[400px] max-h-[80vh] overflow-auto text-xs">
      <h3 className="text-lg font-bold mb-2">Debug Panel</h3>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <h4 className="font-bold">Audio State</h4>
          <pre>{JSON.stringify(displayAudioState, null, 2)}</pre>
        </div>
        
        <hr className="border-white/30 my-2" />
        <div>
          <h4 className="font-bold">Game State</h4>
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
        <hr className="border-white/30 my-2" />
        <div>
          <h4 className="font-bold">UI State</h4>
          <pre>{JSON.stringify(uiState, null, 2)}</pre>
        </div>
        <hr className="border-white/30 my-2" />
        <div>
          <h4 className="font-bold">User State</h4>
          <pre>{JSON.stringify(userState, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel