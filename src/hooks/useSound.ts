import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'place' | 'win' | 'click' | 'start' | 'background';

const SOUND_URLS = {
  place: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  start: 'https://assets.mixkit.co/active_storage/sfx/1426/1426-preview.mp3',
  background: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Ketsa/Ambient/Ketsa_-_03_-_Glow.mp3' // Nhạc nền nhẹ nhàng
};

export function useSound() {
  const audioRefs = useRef<{ [key in SoundType]?: HTMLAudioElement }>({});

  const playSound = useCallback((type: SoundType, loop = false, volume = 1) => {
    try {
      if (!audioRefs.current[type]) {
        audioRefs.current[type] = new Audio(SOUND_URLS[type]);
      }

      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.loop = loop;
        audio.volume = volume;
        audio.play().catch(error => console.error('Audio play failed:', error));
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, []);

  const stopSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  // Tự động phát và dừng nhạc nền
  useEffect(() => {
    playSound('background', true, 0.2); // Âm lượng thấp 20%

    return () => {
      stopSound('background');
    };
  }, [playSound, stopSound]);

  return playSound;
}