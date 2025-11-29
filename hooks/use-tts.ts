import { useState, useCallback } from 'react';
import { ElevenLabsClient } from 'elevenlabs'; // Client-side or proxy via backend

const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const speak = useCallback(async (text: string) => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: '21m00Tcm4TlvDq8ikWAM' }) // Voz por defecto
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const audio = new Audio();
      audio.src = URL.createObjectURL(await response.blob());
      audio.play();
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return { speak, isPlaying };
};