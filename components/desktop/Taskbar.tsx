import React from 'react';
import { PlayerStats, WindowInstance, AppId } from '../../types';
import { XP_PER_LEVEL, APPS } from '../../constants';

interface TaskbarProps {
    playerStats: PlayerStats;
    openWindows: WindowInstance[];
    onFocus: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ playerStats, openWindows, onFocus }) => {
    const { level, xp, wpm, accuracy, hackerName } = playerStats;
    const requiredXp = XP_PER_LEVEL[level - 1] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
    const xpPercentage = Math.min((xp / requiredXp) * 100, 100);

    return (
        <div className="taskbar absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-4">
                 <span className="font-display text-3xl text-purple-400 text-glow-purple">{hackerName}</span>
                 <div className="flex items-center gap-2">
                    {openWindows.map(win => (
                        <button key={win.id} onClick={() => onFocus(win.id)} className="font-display text-xl p-1 bg-black/30 rounded hover:bg-cyan-700 text-cyan-300">
                           {APPS[win.appId].icon}
                        </button>
                    ))}
                 </div>
            </div>

            <div className="flex items-center gap-4 text-fuchsia-400 font-display">
                 <div className="text-center">
                    <span className="text-cyan-400 text-sm">LVL</span>
                    <span className="text-2xl ml-2">{level}</span>
                </div>
                <div className="w-48">
                     <div className="w-full flex justify-between items-center text-cyan-400 text-sm -mb-1">
                        <span>XP</span>
                        <span>{xp}/{requiredXp}</span>
                    </div>
                    <div className="w-full bg-fuchsia-900 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-fuchsia-400 h-2 rounded-full" 
                            style={{ width: `${xpPercentage}%`, transition: 'width 0.5s ease-in-out' }}
                        ></div>
                    </div>
                </div>
                 <div className="text-center">
                    <span className="text-cyan-400 text-sm">WPM</span>
                    <span className="text-2xl ml-2">{wpm}</span>
                </div>
                 <div className="text-center">
                    <span className="text-cyan-400 text-sm">ACC</span>
                    <span className="text-2xl ml-2">{accuracy}%</span>
                </div>
            </div>
        </div>
    );
};

export default Taskbar;