import React, { useState, useEffect, useMemo } from 'react';
import { Challenge, PlayerStats } from '../../types';
import MissionBriefing from '../MissionBriefing';
import TypingChallenge from '../TypingChallenge';
import { audioService } from '../../services/audioService';

interface DataHeistAppProps {
    challenge: Challenge;
    playerStats: PlayerStats;
    onComplete: (challenge: Challenge, stats: { wpm: number; accuracy: number; maxCombo: number }) => void;
    onFail: (challenge: Challenge) => void;
}

const HEIST_DURATION = 90; // 90 seconds

const DataHeistApp: React.FC<DataHeistAppProps> = ({ challenge, playerStats, onComplete, onFail }) => {
    const [timeLeft, setTimeLeft] = useState(HEIST_DURATION);
    const [trace, setTrace] = useState(0);
    const [finalStats, setFinalStats] = useState(null);

    const codeToType = useMemo(() => Array.isArray(challenge.payload) ? challenge.payload.join('\n') : challenge.payload, [challenge.payload]);

    useEffect(() => {
        audioService.playMissionStart();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onFail(challenge);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
            setTrace(prev => Math.min(100, prev + 0.5)); // Trace increases over time
        }, 1000);

        return () => clearInterval(timer);
    }, [challenge, onFail]);

     useEffect(() => {
        if (trace >= 100) {
            onFail(challenge);
        }
    }, [trace, challenge, onFail]);

    const handleChallengeComplete = (stats: { wpm: number; accuracy: number; maxCombo: number }) => {
        onComplete(challenge, stats);
    };

    // This is a simplified error handler for the trace meter
    const handleTypingError = () => {
        setTrace(prev => Math.min(100, prev + 2)); // Each error adds 2% to trace
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full relative">
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-black/40 p-2 rounded text-center">
                    <p className="font-display text-xl text-red-400">TIME REMAINING</p>
                    <p className={`font-display text-5xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-fuchsia-400'}`}>{timeLeft}</p>
                </div>
                 <div className="bg-black/40 p-2 rounded text-center">
                    <p className="font-display text-xl text-cyan-400">TRACE LEVEL</p>
                    <div className="w-full bg-cyan-900/80 rounded-full h-10 mt-1 overflow-hidden border-2 border-cyan-500">
                        <div 
                            className="bg-cyan-400 h-full transition-all duration-500" 
                            style={{ width: `${trace}%`}}
                        >
                           <span className="absolute w-full text-center font-display text-2xl text-black">{Math.floor(trace)}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <TypingChallenge
                challenge={challenge}
                playerStats={playerStats}
                onComplete={handleChallengeComplete}
                onFail={() => onFail(challenge)}
            />
        </div>
    );
};

export default DataHeistApp;
