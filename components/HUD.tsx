import React from 'react';
import { PlayerStats, Upgrade } from '../types';
import { XP_PER_LEVEL, UPGRADES } from '../constants';

interface HUDProps {
    playerStats: PlayerStats;
}

// FIX: Changed prop type from `Upgrade` to `string` to match the upgrade ID being passed.
const UpgradeIndicator: React.FC<{ upgrade: string }> = ({ upgrade }) => {
    const upgradeInfo = UPGRADES[upgrade];
    return (
        <div className="bg-cyan-900/70 border border-cyan-700 text-cyan-300 text-sm font-mono rounded px-2 py-0.5" title={upgradeInfo.description}>
            {upgradeInfo.name}
        </div>
    );
};

const HUD: React.FC<HUDProps> = ({ playerStats }) => {
    const { level, xp, wpm, accuracy, unlockedUpgrades } = playerStats;
    const requiredXp = XP_PER_LEVEL[level - 1] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
    const xpPercentage = Math.min((xp / requiredXp) * 100, 100);

    return (
        <div className="w-full bg-black/50 backdrop-blur-sm border border-cyan-400/50 rounded-md p-2 box-glow-cyan flex flex-col gap-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-fuchsia-400 font-display text-3xl">
                <div className="flex flex-col items-center justify-center p-2 bg-black/30 rounded">
                    <span className="text-cyan-400 text-lg">LEVEL</span>
                    <span className="text-glow-fuchsia">{level}</span>
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-2 bg-black/30 rounded">
                    <div className="w-full flex justify-between items-center text-cyan-400 text-lg">
                        <span>XP</span>
                        <span>{xp} / {requiredXp}</span>
                    </div>
                    <div className="w-full bg-fuchsia-900/80 rounded-full h-2.5 mt-1 overflow-hidden">
                        <div 
                            className="bg-fuchsia-400 h-2.5 rounded-full" 
                            style={{ width: `${xpPercentage}%`, transition: 'width 0.5s ease-in-out' }}
                        ></div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-black/30 rounded">
                    <span className="text-cyan-400 text-lg">WPM</span>
                    <span className="text-glow-fuchsia">{wpm}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-black/30 rounded">
                    <span className="text-cyan-400 text-lg">ACCURACY</span>
                    <span className="text-glow-fuchsia">{accuracy}%</span>
                </div>
            </div>
            {unlockedUpgrades.length > 0 && (
                 <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-black/30 rounded">
                    <span className="text-cyan-400 text-sm font-bold mr-2">UPGRADES:</span>
                     {unlockedUpgrades.map(u => <UpgradeIndicator key={u} upgrade={u} />)}
                 </div>
            )}
        </div>
    );
};

export default HUD;