import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { audioService } from '../services/audioService';

interface MainMenuProps {
    onStart: (hackerName: string) => void;
    onReset: () => void;
    error: string | null;
    playerStats: PlayerStats;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onReset, error, playerStats }) => {
    const [hackerName, setHackerName] = useState('');
    const hasProfile = playerStats.hackerName !== '';

    const handleStart = () => {
        if (!hasProfile && hackerName.trim() === '') return;
        audioService.init(); // Initialize audio on first user interaction
        audioService.playUIClick();
        onStart(hackerName.trim());
    };
    
    const handleResetClick = () => {
        audioService.playUIClick();
        onReset();
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-black/50 backdrop-blur-sm border border-cyan-400/50 rounded-md box-glow-cyan text-center">
            <h1 className="font-display text-9xl text-cyan-400 text-glow-cyan">CYPHERDECK</h1>
            <p className="text-fuchsia-400 text-2xl mt-2 mb-8">A Touch-Typing Role-Playing Game</p>

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md mb-6 max-w-md">
                    <p className="font-bold">Connection Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            {hasProfile ? (
                 <div className="my-4">
                    <p className="text-xl text-gray-400">Welcome back, runner.</p>
                    <p className="font-display text-5xl text-fuchsia-400 text-glow-fuchsia">{playerStats.hackerName}</p>
                 </div>
            ) : (
                <input
                    type="text"
                    value={hackerName}
                    onChange={(e) => setHackerName(e.target.value)}
                    placeholder="ENTER YOUR HANDLE"
                    maxLength={20}
                    className="font-display text-3xl bg-black/70 text-fuchsia-400 border-2 border-fuchsia-500/50 rounded-md text-center px-4 py-2 w-full max-w-sm mb-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400"
                />
            )}

            <button
                onClick={handleStart}
                disabled={!hasProfile && hackerName.trim() === ''}
                className="font-display text-5xl bg-fuchsia-600/80 text-white py-3 px-12 rounded border-2 border-fuchsia-500 transition-all duration-300 transform hover:scale-110 animate-pulse hover:animate-none disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 disabled:transform-none disabled:cursor-not-allowed disabled:animate-none"
            >
                JACK IN
            </button>
            <div className="flex items-center gap-4">
                <p className="text-gray-500 mt-8 text-sm">Powered by Gemini AI</p>
                {hasProfile && (
                    <button onClick={handleResetClick} className="text-gray-500 mt-8 text-sm underline hover:text-red-400">Reset Progress</button>
                )}
            </div>
        </div>
    );
};

export default MainMenu;