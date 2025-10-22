
import React, { useEffect } from 'react';
import { PlayerStats, Upgrade } from '../types';
import { UPGRADES } from '../constants';
import { audioService } from '../services/audioService';

interface LevelUpScreenProps {
    stats: {
        wpm: number;
        accuracy: number;
        xpGained: number;
    };
    playerStats: PlayerStats;
    onSelectUpgrade: (upgrade: Upgrade) => void;
}

// FIX: Removed incorrect type assertion. Object.keys returns string[].
const availableUpgrades = Object.keys(UPGRADES);

const LevelUpScreen: React.FC<LevelUpScreenProps> = ({ stats, playerStats, onSelectUpgrade }) => {
    
    useEffect(() => {
        audioService.playLevelUp();
    }, []);

    const handleSelectUpgrade = (upgrade: Upgrade) => {
        audioService.playUIClick();
        onSelectUpgrade(upgrade);
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-black/50 backdrop-blur-sm border border-fuchsia-500/50 rounded-md box-glow-cyan text-center">
            <h2 className="font-display text-6xl text-fuchsia-500 text-glow-fuchsia animate-pulse">LEVEL UP!</h2>
            <p className="font-display text-4xl text-cyan-300 mb-4">Reached Level {playerStats.level}</p>

            {/* Mission Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 w-full max-w-3xl">
                <div className="bg-black/40 p-3 rounded">
                    <p className="font-display text-3xl text-cyan-400">WPM</p>
                    <p className="font-display text-5xl text-fuchsia-400 text-glow-fuchsia">{stats.wpm}</p>
                </div>
                <div className="bg-black/40 p-3 rounded">
                    <p className="font-display text-3xl text-cyan-400">ACCURACY</p>
                    <p className="font-display text-5xl text-fuchsia-400 text-glow-fuchsia">{stats.accuracy}%</p>
                </div>
                <div className="bg-black/40 p-3 rounded">
                    <p className="font-display text-3xl text-cyan-400">XP GAINED</p>
                    <p className="font-display text-5xl text-fuchsia-400 text-glow-fuchsia">+{stats.xpGained}</p>
                </div>
            </div>

            <div className="w-full border-t-2 border-cyan-400/50 my-6"></div>

            {/* Upgrade Selection */}
            <h3 className="font-display text-5xl text-cyan-300 text-glow-cyan mb-4">SYSTEM UPGRADE AVAILABLE</h3>
            <p className="text-gray-400 mb-6 text-lg">Choose one cybernetic enhancement. This choice is permanent.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {availableUpgrades.map((upgradeKey) => {
                    const upgrade = UPGRADES[upgradeKey];
                    const isUnlocked = playerStats.unlockedUpgrades.includes(upgradeKey);
                    return (
                        <div key={upgradeKey} className={`flex flex-col justify-between p-4 rounded border-2 ${isUnlocked ? 'bg-gray-800/80 border-gray-600' : 'bg-black/60 border-cyan-400/70'}`}>
                            <div>
                                <h4 className={`font-display text-4xl ${isUnlocked ? 'text-gray-500' : 'text-fuchsia-400'}`}>{upgrade.name}</h4>
                                <p className={`mt-2 mb-4 ${isUnlocked ? 'text-gray-500' : 'text-gray-300 text-base'}`}>{upgrade.description}</p>
                            </div>
                            <button
                                // FIX: Pass the `upgrade` object instead of the `upgradeKey` string to match the handler's signature.
                                onClick={() => onSelectUpgrade(upgrade)}
                                disabled={isUnlocked}
                                className="font-display text-3xl w-full py-2 px-6 rounded border transition-all duration-300 transform disabled:cursor-not-allowed
                                           border-fuchsia-500 bg-fuchsia-600/80 text-white hover:bg-fuchsia-500 hover:scale-105
                                           disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 disabled:transform-none"
                            >
                                {isUnlocked ? 'INSTALLED' : 'INSTALL'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelUpScreen;