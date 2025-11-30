import { useState } from "react"

const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const speak = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: '21m00Tcm4TlvDq8ikWAM' })
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const audioBlob = await response.blob();
      const audio = new Audio(URL.createObjectURL(audioBlob));
      await audio.play();
      
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsPlaying(false);
    }
  };
  return { speak, isPlaying };
};