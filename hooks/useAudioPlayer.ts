
import { useState, useEffect, useRef, useCallback } from 'react';

const decode = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};


export const useAudioPlayer = (base64Audio: string | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    if (!audioContextRef.current) {
        // @ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
    }
    
    // Decode audio data when it becomes available
    const prepareAudio = async () => {
      if (base64Audio && audioContextRef.current && !audioBufferRef.current) {
        try {
          const audioBytes = decode(base64Audio);
          const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
          audioBufferRef.current = buffer;
        } catch (error) {
          console.error("Failed to decode audio data:", error);
        }
      }
    };
    prepareAudio();
    
    // Cleanup function
    return () => {
        if(sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            // audioContextRef.current.close(); // Closing can cause issues on re-render
        }
    };
  }, [base64Audio]);

  const play = useCallback(() => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    source.start();
    source.onended = () => {
      setIsPlaying(false);
    };
    sourceRef.current = source;
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);
  
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return { isPlaying, togglePlayPause };
};
