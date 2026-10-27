// Music system disabled per user request - only sound effects are used.
// Stub file exported to ensure any residual imports compile without errors.

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  durationSec: number;
  audioUrl?: string;
  bpm: number;
}

export const AFROBEATS_PLAYLIST: MusicTrack[] = [];

class SilentMusicEngine {
  public isPlaying: boolean = false;
  public currentTrackIndex: number = 0;
  public volume: number = 0;
  public isMuted: boolean = true;

  public init() {}
  public togglePlay() { return false; }
  public play() {}
  public pause() {}
  public nextTrack() {}
  public previousTrack() {}
  public selectTrack(_index: number) {}
  public setVolume(_vol: number) {}
  public toggleMute() { return true; }
  public getPlaylist() { return []; }
  public getCurrentTrack() { return null; }
  public addListener(_listener: () => void) { return () => {}; }
}

export const afrobeatsMusic = new SilentMusicEngine();
