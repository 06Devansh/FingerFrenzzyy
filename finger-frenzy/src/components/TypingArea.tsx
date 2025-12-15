import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Stats, GameMode } from '../types';
import { calculateStats } from '../utils/logic';

interface Props {
  text: string;
  active: boolean;
  onStatsUpdate: (stats: Stats) => void;
  onComplete?: () => void;
  isMultiplayer?: boolean;
}

const TypingArea: React.FC<Props> = ({ text, active, onStatsUpdate, onComplete, isMultiplayer }) => {
  const [typedHistory, setTypedHistory] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Focus input when game becomes active
  useEffect(() => {
    if (active && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [active]);

  // Reset state when text changes (e.g. restart game)
  useEffect(() => {
    setTypedHistory('');
    setStartTime(null);
    setCorrectCharCount(0);
  }, [text]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!active) return;
    
    const val = e.target.value;
    const isDelete = val.length < typedHistory.length;

    // Handle timer start
    if (!startTime && !isMultiplayer) { // In multiplayer, timer is external
      setStartTime(Date.now());
    }
    if (isMultiplayer && !startTime) {
       setStartTime(Date.now());
    }

    // Logic: "Flow Mode" - we allow typing errors but count them
    setTypedHistory(val);

    // Calculate correct chars
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correct++;
    }
    setCorrectCharCount(correct);

    // Update Stats
    const stats = calculateStats(correct, val.length, startTime || Date.now());
    onStatsUpdate(stats);

    // Completion Check
    if (val.length >= text.length) {
      if (onComplete) onComplete();
    }
  }, [active, startTime, text, typedHistory, isMultiplayer, onStatsUpdate, onComplete]);

  // Keep focus
  const handleContainerClick = () => {
    hiddenInputRef.current?.focus();
  };

  // Render text with highlighting
  const renderText = () => {
    return text.split('').map((char, index) => {
      // Base styles for all characters
      const baseClass = "font-mono text-2xl transition-colors duration-75 ";
      let className = baseClass;
      
      const typedChar = typedHistory[index];

      if (index === typedHistory.length) {
        // Cursor position - The character 'under' the cursor
        return (
          <span key={index} className="relative inline-block">
            <span className="absolute -left-0.5 -top-1 w-0.5 h-8 bg-cyber-primary animate-cursor-blink"></span>
            <span className={`${baseClass} text-cyber-muted opacity-50`}>{char === ' ' ? '\u00A0' : char}</span>
          </span>
        );
      }

      if (typedChar == null) {
        className += "text-cyber-muted opacity-50"; // Untyped
      } else if (typedChar === char) {
        className += "text-cyber-text"; // Correct
      } else {
        // Incorrect: Show red. If space is wrong, show a red block or underline
        className += "text-cyber-accent";
        if (char === ' ') {
            className += " bg-cyber-accent/20"; // Highlight space if incorrect
        }
      }

      // Handle space rendering to prevent collapse
      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto mt-8 p-8 bg-cyber-panel rounded-xl shadow-2xl border border-cyber-muted/20"
      onClick={handleContainerClick}
    >
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default"
        value={typedHistory}
        onChange={handleInput}
        autoFocus={active}
        disabled={!active}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      
      <div 
        ref={containerRef}
        className="flex flex-wrap break-words select-none leading-relaxed tracking-wide"
      >
        {renderText()}
      </div>

      {!active && typedHistory.length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center text-cyber-primary/50 text-xl font-mono animate-pulse pointer-events-none">
           {isMultiplayer ? "Waiting for race..." : "Click or type to start"}
         </div>
      )}
    </div>
  );
};

export default TypingArea;