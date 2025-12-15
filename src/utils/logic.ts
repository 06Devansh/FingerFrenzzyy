import type { Stats } from '../types'; 
export const calculateStats = (
  correctChars: number,
  totalTyped: number,
  startTime: number | null
): Stats => {
  if (!startTime) {
    return { 
      wpm: 0, 
      rawWpm: 0, 
      accuracy: 100, 
      correctChars: 0, 
      incorrectChars: 0, 
      timeElapsed: 0 
    };
  }

  const timeElapsedSec = (Date.now() - startTime) / 1000;
  const timeElapsedMin = timeElapsedSec / 60;

  // Gross WPM: (Total Keystrokes / 5) / Minutes
  const grossWPM = (totalTyped / 5) / timeElapsedMin;

  // Net WPM: Gross WPM - (Errors / Minutes)
  // Errors = Total Typed - Correct Chars
  const errors = totalTyped - correctChars;
  const netWPM = grossWPM - (errors / timeElapsedMin);

  // Accuracy
  const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100;

  return {
    wpm: Math.max(0, Math.round(netWPM)),
    rawWpm: Math.round(grossWPM),
    accuracy: Math.round(accuracy),
    correctChars,
    incorrectChars: errors,
    timeElapsed: Math.round(timeElapsedSec)
  };
};

export const generateText = (wordCount: number, wordList: string[]): string => {
  const selected: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    selected.push(wordList[randomIndex]);
  }
  return selected.join(' ');
};