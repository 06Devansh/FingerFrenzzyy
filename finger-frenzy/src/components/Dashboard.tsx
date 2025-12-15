import React, { useEffect, useState } from 'react';
import type{ TestResult } from '../types';

const Dashboard: React.FC = () => {
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('neon_type_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const avgWpm = history.length 
    ? Math.round(history.reduce((acc, curr) => acc + curr.wpm, 0) / history.length) 
    : 0;

  const maxWpm = history.length 
    ? Math.max(...history.map(h => h.wpm)) 
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cyber-panel p-6 rounded-xl border border-cyber-muted/20">
          <h3 className="text-cyber-muted text-sm font-bold uppercase tracking-wider">Tests Taken</h3>
          <p className="text-4xl font-mono text-cyber-text mt-2">{history.length}</p>
        </div>
        <div className="bg-cyber-panel p-6 rounded-xl border border-cyber-muted/20">
          <h3 className="text-cyber-muted text-sm font-bold uppercase tracking-wider">Average WPM</h3>
          <p className="text-4xl font-mono text-cyber-primary mt-2">{avgWpm}</p>
        </div>
        <div className="bg-cyber-panel p-6 rounded-xl border border-cyber-muted/20">
          <h3 className="text-cyber-muted text-sm font-bold uppercase tracking-wider">Best WPM</h3>
          <p className="text-4xl font-mono text-cyber-accent mt-2">{maxWpm}</p>
        </div>
      </div>

      <div className="bg-cyber-panel p-6 rounded-xl border border-cyber-muted/20">
        <h3 className="text-xl font-bold text-cyber-text mb-6">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cyber-muted/20 text-cyber-muted font-mono text-sm">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">WPM</th>
                <th className="py-3 px-4">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-muted/10">
              {history.slice().reverse().slice(0, 5).map((res) => (
                <tr key={res.id} className="text-cyber-text hover:bg-cyber-dark/30">
                  <td className="py-3 px-4 text-sm">{new Date(res.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm capitalize">{res.mode}</td>
                  <td className="py-3 px-4 font-bold text-cyber-primary">{res.wpm}</td>
                  <td className="py-3 px-4">{res.accuracy}%</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-cyber-muted">No tests taken yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;