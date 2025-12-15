import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import type{ RaceRoomState, Stats } from '../types';
import TypingArea from './TypingArea';
import { motion, AnimatePresence } from 'framer-motion';

const RaceRoom: React.FC = () => {
  const [roomState, setRoomState] = useState<RaceRoomState | null>(null);
  const [currentStats, setCurrentStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Join room on mount
    socket.emit('join_room', { username: 'Player1' });

    const handleUpdate = (state: RaceRoomState) => {
      setRoomState({ ...state });
    };

    socket.on('room_update', handleUpdate);

    return () => {
      socket.off('room_update', handleUpdate);
      socket.emit('leave_room', {});
    };
  }, []);

  const handleStatsUpdate = (stats: Stats) => {
    setCurrentStats(stats);
    // Send progress to server
    if (roomState && roomState.text) {
      const progress = Math.min(100, (stats.correctChars / roomState.text.length) * 100);
      socket.emit('update_progress', {
        id: 'player-id',
        wpm: stats.wpm,
        progress: progress
      });
    }
  };

  if (!roomState) return <div className="text-center p-10 text-cyber-primary animate-pulse">Connecting to server...</div>;

  const isRacing = roomState.status === 'racing';
  const isFinished = roomState.status === 'finished';
  const isCountdown = roomState.status === 'countdown';

  // Sort players for leaderboard
  const sortedPlayers = [...roomState.players].sort((a, b) => {
    if (b.progress === a.progress) {
      return b.wpm - a.wpm;
    }
    return b.progress - a.progress;
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 relative min-h-[600px]">
      
      {/* --- RACE TRACK --- */}
      <div className="mb-8 space-y-6 bg-cyber-panel/50 p-6 rounded-xl border border-cyber-muted/20 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 border-b border-cyber-muted/20 pb-2">
           <h2 className="text-xl font-bold text-cyber-primary font-mono tracking-wider">/// RACE STATUS: {roomState.status.toUpperCase()}</h2>
           <div className="text-xs text-cyber-muted font-mono">ROOM: {roomState.roomId}</div>
        </div>
        
        {roomState.players.map((player) => (
          <div key={player.id} className="relative group">
            <div className="flex justify-between text-sm text-cyber-muted mb-1 font-mono items-center">
              <span className={`flex items-center gap-2 ${player.id === 'player-id' ? 'text-cyber-primary font-bold' : 'text-cyber-accent'}`}>
                {player.id === 'player-id' ? 'YOU' : player.username}
                {player.progress >= 100 && <span className="text-xs bg-cyber-primary text-cyber-dark px-1 rounded">FINISHED</span>}
              </span>
              <span>{Math.round(player.wpm)} WPM</span>
            </div>
            
            <div className="h-3 w-full bg-cyber-dark rounded-full overflow-hidden relative border border-cyber-muted/30">
               {/* Progress Fill */}
              <motion.div 
                className="h-full rounded-full relative z-10"
                style={{ backgroundColor: player.color }}
                initial={{ width: 0 }}
                animate={{ width: `${player.progress}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
              {/* Grid background for track */}
              <div className="absolute inset-0 w-full h-full opacity-10" 
                   style={{backgroundImage: 'linear-gradient(90deg, transparent 95%, #fff 95%)', backgroundSize: '5% 100%'}}></div>
            </div>
            
            {/* Avatar Icon */}
            <motion.div 
              className="absolute top-7 z-20 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              initial={{ left: 0 }}
              animate={{ left: `${player.progress}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
              style={{ x: "-50%" }}
            >
               {player.id === 'player-id' ? (
                  <div className="text-2xl mt-[-8px]">🏎️</div>
               ) : (
                  <div className="text-2xl mt-[-8px]">🤖</div>
               )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* --- COUNTDOWN OVERLAY --- */}
      <AnimatePresence>
        {isCountdown && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl"
          >
            <div className="flex flex-col items-center">
               <p className="text-cyber-primary text-xl font-mono mb-4 tracking-[0.5em]">RACE STARTING IN</p>
               <motion.div 
                 key={roomState.countdown}
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1.5, opacity: 1 }}
                 exit={{ scale: 2, opacity: 0 }}
                 transition={{ duration: 0.5 }}
                 className="text-9xl font-black text-white font-mono drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"
               >
                 {roomState.countdown}
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- RESULTS OVERLAY --- */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 bg-cyber-dark/95 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-xl p-8"
          >
            <h2 className="text-4xl font-bold text-cyber-text mb-2 tracking-widest uppercase">Race Results</h2>
            <div className={`text-xl font-mono mb-8 ${sortedPlayers[0].id === 'player-id' ? 'text-green-400' : 'text-cyber-accent'}`}>
               {sortedPlayers[0].id === 'player-id' ? '🏆 VICTORY' : '💀 DEFEAT'}
            </div>

            <div className="w-full max-w-lg bg-cyber-panel border border-cyber-muted/30 rounded-lg overflow-hidden mb-8">
              <table className="w-full text-left">
                <thead className="bg-cyber-dark/50 text-cyber-muted font-mono text-sm uppercase">
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Racer</th>
                    <th className="p-4 text-right">WPM</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-muted/10">
                  {sortedPlayers.map((player, index) => (
                    <tr key={player.id} className={`${player.id === 'player-id' ? 'bg-cyber-primary/10' : ''}`}>
                      <td className="p-4 font-mono text-cyber-muted">#{index + 1}</td>
                      <td className="p-4 font-bold text-cyber-text flex items-center gap-2">
                        {index === 0 && '👑'} {player.username} {player.id === 'player-id' && '(You)'}
                      </td>
                      <td className="p-4 text-right font-mono text-cyber-primary">{Math.round(player.wpm)}</td>
                      <td className="p-4 text-right text-xs">
                        {player.progress >= 100 ? (
                           <span className="text-green-400">FINISHED</span>
                        ) : (
                           <span className="text-cyber-accent">DNF</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
               onClick={() => socket.emit('play_again', {})}
               className="group relative px-8 py-3 bg-cyber-primary text-cyber-dark font-bold rounded overflow-hidden transition-transform active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <span className="relative z-10">PLAY AGAIN</span>
              <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TYPING AREA --- */}
      <div className={`transition-all duration-500 ${isFinished || isCountdown ? 'blur-sm opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <TypingArea 
          text={roomState.text}
          active={isRacing}
          onStatsUpdate={handleStatsUpdate}
          isMultiplayer={true}
        />
      </div>
    </div>
  );
};

export default RaceRoom;