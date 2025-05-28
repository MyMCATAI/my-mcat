import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ----- Types ---- */
interface VoiceRecorderProps {
  onComplete: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onComplete }) => {
  /* ---- State ----- */
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);

  /* ---- Refs --- */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const audioChunksRef = useRef<Blob[]>([]);

  /* ----- Callbacks --- */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        setHasRecording(true);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /* --- Animations & Effects --- */
  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  /* ---- Render Methods ----- */
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-8 py-12"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent text-center mb-4"
      >
        Tell Me What You Struggle With 🎤
      </motion.div>
      
      {/* Enhanced Recording Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative overflow-hidden ${
          isRecording 
            ? 'bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700' 
            : hasRecording
              ? 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
              : 'bg-gradient-to-br from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700'
        }`}
      >
        {isRecording && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-300/30 to-red-500/30 animate-ping rounded-full"></div>
        )}
        {isRecording ? (
          <Square className="w-16 h-16 text-white relative z-10" />
        ) : hasRecording ? (
          <CheckCircle className="w-16 h-16 text-white relative z-10" />
        ) : (
          <Mic className="w-16 h-16 text-white relative z-10" />
        )}
      </motion.button>

      {/* Enhanced Recording Status */}
      <div className="text-center">
        {isRecording ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-red-600 dark:text-red-400 font-bold text-2xl">
              Recording... {formatTime(recordingTime)}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-xl">
              Press the button again to stop
            </p>
          </motion.div>
        ) : hasRecording ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <p className="text-green-600 dark:text-green-400 font-bold text-2xl">
              Recording complete! ({formatTime(recordingTime)})
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 text-xl font-bold shadow-lg"
            >
              Analyze My Input
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-gray-900 dark:text-white font-bold text-2xl">
              Press to start recording
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-6 py-3 rounded-xl">
              Tell me about what you struggle with
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceRecorder; 