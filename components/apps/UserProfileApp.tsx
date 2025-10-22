import React from 'react';
import { PlayerStats } from '../../types';
import { XP_PER_LEVEL } from '../../constants';

interface UserProfileAppProps {
    playerStats: PlayerStats;
    onResetProgress: () => void;
}

const UserProfileApp: React.FC<UserProfileAppProps> = ({ playerStats, onResetProgress }) => {
    const { level, xp, wpm, accuracy, hackerName, missionsCompleted } = playerStats;
    const requiredXp = XP_PER_LEVEL[level - 1] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];

    return (
        <div className="p-4 text-gray-300 h-full overflow-y-auto">
            <h2 className="font-display text-4xl text-cyan-300 text-glow-cyan border-b-2 border-cyan-400/50 pb-2">
                {hackerName}
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-black/30 p-2 rounded">
                    <p className="text-cyan-400 text-sm font-display">LEVEL</p>
                    <p className="text-fuchsia-400 text-3xl font-display">{level}</p>
                </div>
                 <div className="bg-black/30 p-2 rounded">
                    <p className="text-cyan-400 text-sm font-display">XP</p>
                    <p className="text-purple-400 text-3xl font-display">{xp} / {requiredXp}</p>
                </div>
                 <div className="bg-black/30 p-2 rounded">
                    <p className="text-cyan-400 text-sm font-display">PEAK WPM</p>
                    <p className="text-fuchsia-400 text-3xl font-display">{wpm}</p>
                </div>
                 <div className="bg-black/30 p-2 rounded">
                    <p className="text-cyan-400 text-sm font-display">PEAK ACCURACY</p>
                    <p className="text-purple-400 text-3xl font-display">{accuracy}%</p>
                </div>
            </div>
            <div className="bg-black/30 p-2 rounded mt-4">
                <p className="text-cyan-400 text-sm font-display">MISSIONS COMPLETED</p>
                <p className="text-fuchsia-400 text-3xl font-display">{missionsCompleted}</p>
            </div>

            <div className="absolute bottom-2 right-2">
                 <button onClick={onResetProgress} className="text-gray-500 text-xs underline hover:text-red-400">Reset Progress</button>
            </div>
        </div>
    );
};

export default UserProfileApp;