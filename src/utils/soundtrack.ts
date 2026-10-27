// Nigerian Campus Soundtrack & Radio Manager for UNDERGRAD
// Features: Aṣa classics & YG Marley, random shuffle, track selection, and dynamic building fade/ducking

export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  year: string;
  genre: string;
  src: string;
  album: string;
  accentColor: string;
}

export const SOUNDTRACK_PLAYLIST: SoundtrackTrack[] = [
  {
    id: 'fire_on_the_mountain',
    title: 'Fire On The Mountain',
    artist: 'Aṣa',
    year: '2007',
    genre: 'Afro-Soul / Classic',
    album: 'Aṣa (Asha)',
    accentColor: '#f97316',
    src: '/assets/aistudio/A_a_-_2007_-_A_a_-_Fire_on_the_mountain__mp3.pm__cd0a3e00.mp3'
  },
  {
    id: 'jailer',
    title: 'Jailer',
    artist: 'Aṣa',
    year: '2007',
    genre: 'Afro-Soul / Pop',
    album: 'Aṣa (Asha)',
    accentColor: '#eab308',
    src: '/assets/aistudio/Asa_-_Jailer__mp3.pm__1e5fbf7a.mp3'
  },
  {
    id: 'be_my_man',
    title: 'Be My Man',
    artist: 'Aṣa',
    year: '2010',
    genre: 'Afro-Soul / Retro Pop',
    album: 'Beautiful Imperfection',
    accentColor: '#ec4899',
    src: '/assets/aistudio/Asa_-_Be_my_man__mp3.pm__59ae569a.mp3'
  },
  {
    id: 'bibanke',
    title: 'Bibanke',
    artist: 'Aṣa',
    year: '2007',
    genre: 'Yoruba Soul / Ballad',
    album: 'Aṣa (Asha)',
    accentColor: '#8b5cf6',
    src: '/assets/aistudio/Asa_-_Bibanke__mp3.pm__83f2f235.mp3'
  },
  {
    id: 'praise_jah_in_the_moonlight',
    title: 'Praise Jah In The Moonlight',
    artist: 'YG Marley',
    year: '2023',
    genre: 'Reggae / Afro-Fusion',
    album: 'Single',
    accentColor: '#10b981',
    src: '/assets/aistudio/YG_Marley_-_Praise_Jah_In_The_Moonlight__mp3.pm__cda60e29.mp3'
  }
];

export type PlaybackMode = 'shuffle' | 'selected';

class SoundtrackManager {
  private audio: HTMLAudioElement | null = null;
  public currentTrack: SoundtrackTrack | null = null;
  public isPlaying: boolean = false;
  public isMuted: boolean = false;
  public baseVolume: number = 0.85; // Louder audio per user request
  public isDucked: boolean = false;
  public duckFactor: number = 0.32; // ~32% of base volume when in/interacting with building
  public mode: PlaybackMode = 'shuffle';
  public selectedTrackId: string | null = null;
  
  private currentVolume: number = 0.85;
  private fadeInterval: number | null = null;
  private listeners: Set<() => void> = new Set();
  private hasUnlockedAudio: boolean = false;
  private shouldBePlaying: boolean = false;
  private shuffleQueue: string[] = [];

  constructor() {
    // Generate an initial non-repeating full cycle shuffle queue
    this.refillShuffleQueue();
    const firstId = this.shuffleQueue.shift();
    this.currentTrack = SOUNDTRACK_PLAYLIST.find((t) => t.id === firstId) || SOUNDTRACK_PLAYLIST[0];

    // Setup global unlock listeners for browser autoplay policies
    if (typeof window !== 'undefined') {
      const unlock = () => {
        if (!this.hasUnlockedAudio) {
          this.hasUnlockedAudio = true;
          if (this.shouldBePlaying) {
            this.play();
          }
        }
      };
      window.addEventListener('pointerdown', unlock, { once: true, passive: true });
      window.addEventListener('keydown', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
    }
  }

  private initAudio() {
    if (this.audio) return this.audio;
    if (typeof Audio === 'undefined') return null;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = this.computeTargetVolume();
    this.currentVolume = audio.volume;

    audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });

    audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });

    audio.addEventListener('error', (e) => {
      console.warn('Soundtrack audio error, advancing track:', e);
      // Auto advance to next song if network error or decode glitch
      setTimeout(() => this.nextTrack(), 1000);
    });

    this.audio = audio;
    return audio;
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in soundtrack listener:', err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private computeTargetVolume(): number {
    if (this.isMuted) return 0;
    if (this.isDucked) {
      return Math.max(0.04, this.baseVolume * this.duckFactor);
    }
    return this.baseVolume;
  }

  private startFadeTo(target: number) {
    if (this.fadeInterval !== null) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (!this.audio) return;

    this.fadeInterval = window.setInterval(() => {
      const diff = target - this.currentVolume;
      if (Math.abs(diff) < 0.015) {
        this.currentVolume = target;
        if (this.audio) {
          this.audio.volume = Math.max(0, Math.min(1, target));
        }
        if (this.fadeInterval !== null) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      } else {
        this.currentVolume += diff * 0.18;
        if (this.audio) {
          this.audio.volume = Math.max(0, Math.min(1, this.currentVolume));
        }
      }
    }, 25);
  }

  public setDucked(ducked: boolean) {
    if (this.isDucked === ducked) return;
    this.isDucked = ducked;
    this.startFadeTo(this.computeTargetVolume());
    this.notify();
  }

  public setVolume(newVolume: number) {
    this.baseVolume = Math.max(0, Math.min(1, newVolume));
    if (this.baseVolume > 0 && this.isMuted) {
      this.isMuted = false;
    }
    this.startFadeTo(this.computeTargetVolume());
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.startFadeTo(this.computeTargetVolume());
    this.notify();
  }

  public play() {
    this.shouldBePlaying = true;
    const audio = this.initAudio();
    if (!audio) return;

    if (!this.currentTrack) {
      this.currentTrack = SOUNDTRACK_PLAYLIST[0];
    }

    // Set src if different
    if (!audio.src || !audio.src.endsWith(this.currentTrack.src)) {
      audio.src = this.currentTrack.src;
    }

    this.startFadeTo(this.computeTargetVolume());

    audio.play().then(() => {
      this.isPlaying = true;
      this.hasUnlockedAudio = true;
      this.notify();
    }).catch((err) => {
      // Autoplay blocked pending user gesture
      this.isPlaying = false;
      this.notify();
    });
  }

  public pause() {
    this.shouldBePlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack() {
    if (this.mode === 'shuffle') {
      this.playRandomTrack();
    } else {
      // Advance sequentially in playlist
      const currentIndex = SOUNDTRACK_PLAYLIST.findIndex((t) => t.id === this.currentTrack?.id);
      const nextIndex = (currentIndex + 1) % SOUNDTRACK_PLAYLIST.length;
      this.loadTrack(SOUNDTRACK_PLAYLIST[nextIndex]);
    }
  }

  public previousTrack() {
    const currentIndex = SOUNDTRACK_PLAYLIST.findIndex((t) => t.id === this.currentTrack?.id);
    const prevIndex = (currentIndex - 1 + SOUNDTRACK_PLAYLIST.length) % SOUNDTRACK_PLAYLIST.length;
    this.loadTrack(SOUNDTRACK_PLAYLIST[prevIndex]);
  }

  public selectTrack(trackId: string) {
    const track = SOUNDTRACK_PLAYLIST.find((t) => t.id === trackId);
    if (!track) return;

    this.mode = 'selected';
    this.selectedTrackId = trackId;
    this.loadTrack(track);
  }

  public setShuffleMode() {
    this.mode = 'shuffle';
    this.selectedTrackId = null;
    this.notify();
    // If not already playing, start random
    if (!this.isPlaying) {
      this.playRandomTrack();
    }
  }

  private handleTrackEnded() {
    if (this.mode === 'shuffle') {
      this.playRandomTrack();
    } else {
      // If user selected a specific song, replay it or advance
      if (this.currentTrack) {
        this.loadTrack(this.currentTrack);
      } else {
        this.playRandomTrack();
      }
    }
  }

  // Guarantee all songs play once before repeating any song in shuffle mode
  private refillShuffleQueue() {
    const ids = SOUNDTRACK_PLAYLIST.map((t) => t.id);
    // Fisher-Yates shuffle
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    // Ensure the first song in the new cycle is not identical to the current song if possible
    if (this.currentTrack && ids.length > 1 && ids[0] === this.currentTrack.id) {
      [ids[0], ids[ids.length - 1]] = [ids[ids.length - 1], ids[0]];
    }

    this.shuffleQueue = ids;
  }

  private playRandomTrack() {
    if (SOUNDTRACK_PLAYLIST.length <= 1) {
      this.loadTrack(SOUNDTRACK_PLAYLIST[0]);
      return;
    }

    if (this.shuffleQueue.length === 0) {
      this.refillShuffleQueue();
    }

    const nextId = this.shuffleQueue.shift();
    const nextTrack = SOUNDTRACK_PLAYLIST.find((t) => t.id === nextId) || SOUNDTRACK_PLAYLIST[0];
    this.loadTrack(nextTrack);
  }

  private loadTrack(track: SoundtrackTrack) {
    this.currentTrack = track;
    const audio = this.initAudio();
    if (!audio) return;

    audio.src = track.src;
    audio.load();
    this.startFadeTo(this.computeTargetVolume());

    if (this.shouldBePlaying || this.hasUnlockedAudio) {
      audio.play().then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch(() => {
        this.isPlaying = false;
        this.notify();
      });
    } else {
      this.notify();
    }
  }
}

export const soundtrack = new SoundtrackManager();

// React Hook for components
import { useState, useEffect } from 'react';

export function useSoundtrack() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = soundtrack.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    currentTrack: soundtrack.currentTrack,
    isPlaying: soundtrack.isPlaying,
    isMuted: soundtrack.isMuted,
    volume: soundtrack.baseVolume,
    isDucked: soundtrack.isDucked,
    mode: soundtrack.mode,
    selectedTrackId: soundtrack.selectedTrackId,
    playlist: SOUNDTRACK_PLAYLIST,
    play: () => soundtrack.play(),
    pause: () => soundtrack.pause(),
    togglePlay: () => soundtrack.togglePlay(),
    toggleMute: () => soundtrack.toggleMute(),
    setVolume: (v: number) => soundtrack.setVolume(v),
    nextTrack: () => soundtrack.nextTrack(),
    previousTrack: () => soundtrack.previousTrack(),
    selectTrack: (id: string) => soundtrack.selectTrack(id),
    setShuffleMode: () => soundtrack.setShuffleMode()
  };
}
