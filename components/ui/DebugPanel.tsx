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
  const [audioTab, setAudioTab] = useState<'basic'|'advanced'|'nodes'>('basic')
  
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
    musicSource: audioState.musicSource ? 'active' : 'null',
    loopSource: audioState.loopSource ? 'active' : 'null',
    voiceSource: audioState.voiceSource ? 'active' : 'null',
    
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
          <h4 className="font-bold">Audio System</h4>
          <div className="flex space-x-2 mb-2">
            <button 
              className={`px-2 py-1 text-xs rounded ${audioTab === 'basic' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setAudioTab('basic')}
            >
              Basic
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${audioTab === 'advanced' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setAudioTab('advanced')}
            >
              Advanced
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${audioTab === 'nodes' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setAudioTab('nodes')}
            >
              Nodes
            </button>
          </div>
          
          {audioTab === 'basic' && (
            <div>
              <div className="grid grid-cols-2 gap-1">
                <div className="font-semibold">Playing:</div>
                <div>{displayAudioState.isPlaying ? 'Yes' : 'No'}</div>
                
                <div className="font-semibold">Current Song:</div>
                <div className="truncate">{displayAudioState.currentSong ? audioState.getCurrentSongTitle() : 'None'}</div>
                
                <div className="font-semibold">Current Loop:</div>
                <div className="truncate">{displayAudioState.currentLoop || 'None'}</div>
                
                <div className="font-semibold">Volume:</div>
                <div>{displayAudioState.volume}</div>
                
                <div className="font-semibold">Queue Size:</div>
                <div>{displayAudioState.queueLength}</div>
              </div>
            </div>
          )}
          
          {audioTab === 'advanced' && (
            <div>
              <div className="grid grid-cols-2 gap-1">
                <div className="font-semibold">Current Music:</div>
                <div className="truncate">{displayAudioState.currentMusic || 'None'}</div>
                
                <div className="font-semibold">Master Volume:</div>
                <div>{displayAudioState.masterVolume}</div>
                
                <div className="font-semibold">Song Index:</div>
                <div>{displayAudioState.currentSongIndex}</div>
                
                <div className="font-semibold">Audio Context:</div>
                <div>{displayAudioState.audioContext}</div>
              </div>
              
              <div className="mt-2">
                <div className="font-semibold mb-1">Active Sources:</div>
                <div className="grid grid-cols-3 gap-1">
                  <div className={`px-1 py-0.5 rounded ${displayAudioState.musicSource === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                    Music: {displayAudioState.musicSource}
                  </div>
                  <div className={`px-1 py-0.5 rounded ${displayAudioState.loopSource === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                    Loop: {displayAudioState.loopSource}
                  </div>
                  <div className={`px-1 py-0.5 rounded ${displayAudioState.voiceSource === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                    Voice: {displayAudioState.voiceSource}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {audioTab === 'nodes' && (
            <div>
              <div className="font-semibold mb-1">Gain Nodes:</div>
              <div className="grid grid-cols-3 gap-1">
                <div className={`px-1 py-0.5 rounded ${displayAudioState.gainNodes.master === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                  Master: {displayAudioState.gainNodes.master}
                </div>
                <div className={`px-1 py-0.5 rounded ${displayAudioState.gainNodes.music === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                  Music: {displayAudioState.gainNodes.music}
                </div>
                <div className={`px-1 py-0.5 rounded ${displayAudioState.gainNodes.sfx === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                  SFX: {displayAudioState.gainNodes.sfx}
                </div>
                <div className={`px-1 py-0.5 rounded ${displayAudioState.gainNodes.loop === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                  Loop: {displayAudioState.gainNodes.loop}
                </div>
                <div className={`px-1 py-0.5 rounded ${displayAudioState.gainNodes.voice === 'active' ? 'bg-green-700' : 'bg-gray-700'}`}>
                  Voice: {displayAudioState.gainNodes.voice}
                </div>
              </div>
            </div>
          )}
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