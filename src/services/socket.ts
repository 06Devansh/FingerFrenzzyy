import type { RacePlayer, RaceRoomState } from '../types';
import { generateText } from '../utils/logic';
import { WORD_LIST } from '../constants';

// Simulating a backend socket connection
type Listener = (data: any) => void;

class MockSocketService {
  private listeners: Record<string, Listener[]> = {};
  private state: RaceRoomState = {
    roomId: 'lobby-1',
    status: 'waiting',
    players: [],
    text: '',
    startTime: null
  };
  private botInterval: any;
  private botJoinTimeout: any;

  constructor() {
    this.resetState();
  }

  resetState() {
    clearTimeout(this.botJoinTimeout);
    clearInterval(this.botInterval);
    this.state = {
      roomId: Math.random().toString(36).substring(7),
      status: 'waiting',
      players: [],
      text: generateText(30, WORD_LIST),
      startTime: null,
      countdown: 3
    };
  }

  // --- Client Side API ---

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    // Simulate network delay
    setTimeout(() => {
      this.handleServerEvent(event, data);
    }, 50);
  }

  // --- Server Logic Simulation ---

  private handleServerEvent(event: string, data: any) {
    switch (event) {
      case 'join_room':
        this.addPlayer(data.username, false);
        this.broadcast('room_update', this.state);
        
        // Simulate a bot joining after 1.5 seconds
        // Only schedule if no bot exists and we are the only player
        const hasBot = this.state.players.some(p => p.isBot);
        if (this.state.players.length === 1 && !hasBot) {
          clearTimeout(this.botJoinTimeout); // Clear any pending bots
          this.botJoinTimeout = setTimeout(() => {
            this.addPlayer('Bot_Racer_9000', true);
            this.broadcast('room_update', this.state);
            
            // Start countdown
            setTimeout(() => {
              this.startCountdown();
            }, 1000);
          }, 1500);
        }
        break;

      case 'update_progress':
        const player = this.state.players.find(p => p.id === data.id);
        if (player) {
          player.progress = data.progress;
          player.wpm = data.wpm;
          this.checkWinCondition();
          this.broadcast('room_update', this.state);
        }
        break;
        
      case 'play_again':
        // Reset Game State
        clearInterval(this.botInterval); 
        clearTimeout(this.botJoinTimeout);
        this.state.status = 'waiting';
        this.state.text = generateText(30, WORD_LIST);
        this.state.players.forEach(p => {
          p.progress = 0;
          p.wpm = 0;
        });
        this.broadcast('room_update', this.state);
        
        // Restart sequence after short delay
        setTimeout(() => {
          this.startCountdown();
        }, 1000);
        break;

      case 'leave_room':
        clearInterval(this.botInterval);
        clearTimeout(this.botJoinTimeout);
        this.resetState();
        break;
    }
  }

  private addPlayer(username: string, isBot: boolean) {
    // CRITICAL FIX: Strictly prevent adding a second bot
    if (isBot && this.state.players.some(p => p.isBot)) {
      return; 
    }

    const id = isBot ? 'bot-id' : 'player-id';
    
    // Prevent duplicate players by ID
    if (this.state.players.some(p => p.id === id)) {
      return;
    }

    const newPlayer: RacePlayer = {
      id,
      username,
      progress: 0,
      wpm: 0,
      isBot,
      color: isBot ? '#f43f5e' : '#06b6d4' // Red for bot, Cyan for player
    };
    this.state.players.push(newPlayer);
  }

  private startCountdown() {
    // Prevent starting countdown if already racing or counting down
    if (this.state.status === 'racing' || this.state.status === 'countdown') return;

    this.state.status = 'countdown';
    let count = 3;
    // Broadcast initial state
    this.state.countdown = count;
    this.broadcast('room_update', this.state);
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        this.state.countdown = count;
        this.broadcast('room_update', this.state);
      } else {
        clearInterval(interval);
        this.startRace();
      }
    }, 1000);
  }

  private startRace() {
    this.state.status = 'racing';
    this.state.startTime = Date.now();
    delete this.state.countdown;
    this.broadcast('race_start', { startTime: this.state.startTime });
    this.broadcast('room_update', this.state);
    
    // Start Bot Logic
    if (this.botInterval) clearInterval(this.botInterval);
    this.botInterval = setInterval(() => {
      this.updateBotProgress();
    }, 1000);
  }

  private updateBotProgress() {
    if (this.state.status !== 'racing') return;

    const bot = this.state.players.find(p => p.isBot);
    if (bot) {
      // Bot types at ~60 WPM constant, with some variance
      const variance = Math.random() * 10 - 5;
      bot.wpm = Math.max(10, 60 + variance);
      
      // Progress calculation
      const totalChars = this.state.text.length || 150;
      const charsPerSec = (bot.wpm / 60) * 5;
      const progressIncrement = (charsPerSec / totalChars) * 100;

      bot.progress = Math.min(100, bot.progress + progressIncrement); 
      
      this.checkWinCondition();
      this.broadcast('room_update', this.state);
    }
  }

  private checkWinCondition() {
    if (this.state.status === 'finished') return;
    
    const finished = this.state.players.some(p => p.progress >= 100);
    if (finished) {
      this.state.status = 'finished';
      clearInterval(this.botInterval);
      this.broadcast('room_update', this.state);
    }
  }

  private broadcast(event: string, payload: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }
}

export const socket = new MockSocketService();