import React, { useState } from 'react';
import TypingArea from './components/TypingArea';
import RaceRoom from './components/RaceRoom';
import Dashboard from './components/Dashboard';
import { generateText } from './utils/logic';
import { WORD_LIST } from './constants';
import type { TestResult, Stats } from './types';

function App() {
  const [view, setView] = useState<'solo' | 'race' | 'dashboard'>('solo');
  const [soloText, setSoloText] = useState(generateText(25, WORD_LIST));
  const [lastStats, setLastStats] = useState<Stats | null>(null);

  const handleSoloComplete = () => {
    // Save to local storage mock DB
    if (lastStats) {
      const result: TestResult = {
        ...lastStats,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mode: 'words'
      };
      
      const existing = JSON.parse(localStorage.getItem('neon_type_history') || '[]');
      localStorage.setItem('neon_type_history', JSON.stringify([...existing, result]));
      
      // Reset after brief delay
      setTimeout(() => {
         setSoloText(generateText(25, WORD_LIST));
         setLastStats(null);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-text font-sans selection:bg-cyber-primary selection:text-cyber-dark">
      {/* Navbar */}
      <nav className="border-b border-cyber-muted/20 bg-cyber-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyber-primary rounded-full animate-pulse" />
            <span className="text-xl font-bold font-mono tracking-tighter">FINGER<span className="text-cyber-primary">FRENZY</span></span>
          </div>
          
          <div className="flex gap-1 bg-cyber-panel p-1 rounded-lg">
            {(['solo', 'race', 'dashboard'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === v 
                    ? 'bg-cyber-primary text-cyber-dark shadow-lg shadow-cyber-primary/20' 
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-white/5'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {view === 'solo' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Test Your Speed</h1>
              <p className="text-cyber-muted">Type the words below as fast as you can.</p>
            </div>
            
            {lastStats && (
               <div className="flex gap-8 mb-6 text-xl font-mono">
                  <div className="text-cyber-primary">WPM: {lastStats.wpm}</div>
                  <div className="text-cyber-accent">ACC: {lastStats.accuracy}%</div>
               </div>
            )}

            <TypingArea 
              text={soloText} 
              active={true}
              onStatsUpdate={setLastStats}
              onComplete={handleSoloComplete}
              isMultiplayer={false}
            />
            
            <button 
              onClick={() => setSoloText(generateText(25, WORD_LIST))}
              className="mt-8 text-cyber-muted hover:text-cyber-text flex items-center gap-2 text-sm uppercase tracking-widest font-bold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              Restart Test
            </button>
          </div>
        )}

        {view === 'race' && <RaceRoom />}
        
        {view === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

export default App;