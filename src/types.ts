export type GameMode = 'time' | 'words';
export type TimeOption = 15 | 30 | 60;
export type WordOption = 10 | 25 | 50;

export interface GameSettings {
  mode: GameMode;
  timeLimit: TimeOption;
  wordLimit: WordOption;
}

export interface Stats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  timeElapsed: number; // in seconds
}

export interface TestResult extends Stats {
  id: string;
  date: string;
  mode: GameMode;
}

// Multiplayer Types
export interface RacePlayer {
  id: string;
  username: string;
  progress: number; // 0 to 100
  wpm: number;
  isBot?: boolean;
  color: string;
}

export type RaceStatus = 'waiting' | 'countdown' | 'racing' | 'finished';

export interface RaceRoomState {
  roomId: string;
  status: RaceStatus;
  players: RacePlayer[];
  text: string;
  startTime: number | null;
  countdown?: number;
}
