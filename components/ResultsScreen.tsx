import React, { useEffect } from 'react';
import { PlayerStats } from '../types';
import { audioService } from '../services/audioService';

interface ResultsScreenProps {
    stats: {
        wpm: number;
        accuracy: number;
        xpGained: number;
    };
    playerStats: PlayerStats;
    onNext: () => void;
    onMenu: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ stats, playerStats, onNext, onMenu }) => {
    const oldLevel = stats.xpGained + playerStats.xp < 0 ? playerStats.level - 1 : playerStats.level;
    const isLevelUp = oldLevel < playerStats.level;

    useEffect(() => {
        audioService.playMissionComplete();
    }, []);

    const handleNext = () => {
        audioService.playUIClick();
        onNext();
    };

    const handleMenu = () => {
        audioService.playUIClick();
        onMenu();
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-black/50 backdrop-blur-sm border border-cyan-400/50 rounded-md box-glow-cyan">
            <h2 className="font-display text-6xl text-cyan-400 text-glow-cyan mb-4">MISSION COMPLETE</h2>
            
            {isLevelUp && (
                 <p className="font-display text-5xl text-fuchsia-500 text-glow-fuchsia animate-pulse mb-4">LEVEL UP! Reached Level {playerStats.level}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 w-full max-w-3xl text-center">
                <div className="bg-black/40 p-4 rounded">
                    <p className="font-display text-3xl text-cyan-400">WPM</p>
                    <p className="font-display text-6xl text-fuchsia-400 text-glow-fuchsia">{stats.wpm}</p>
                </div>
                <div className="bg-black/40 p-4 rounded">
                    <p className="font-display text-3xl text-cyan-400">ACCURACY</p>
                    <p className="font-display text-6xl text-fuchsia-400 text-glow-fuchsia">{stats.accuracy}%</p>
                </div>
                <div className="bg-black/40 p-4 rounded">
                    <p className="font-display text-3xl text-cyan-400">XP GAINED</p>
                    <p className="font-display text-6xl text-fuchsia-400 text-glow-fuchsia">+{stats.xpGained}</p>
                </div>
            </div>

            <div className="flex gap-4 mt-4">
                <button
                    onClick={handleMenu}
                    className="font-display text-3xl bg-red-600/80 text-white py-2 px-8 rounded border border-red-400 hover:bg-red-500 transition-all duration-300 transform hover:scale-105"
                >
                    Disconnect
                </button>
                <button
                    onClick={handleNext}
                    className="font-display text-3xl bg-cyan-600/80 text-white py-2 px-8 rounded border border-cyan-400 hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105"
                >
                    Next Mission
                </button>
            </div>
        </div>
    );
};

export default ResultsScreen;