import React from 'react';
import { Challenge, PlayerStats } from '../types';
import HUD from './HUD';
import MissionBriefing from './MissionBriefing';
import TypingChallenge from './TypingChallenge';

interface GameUIProps {
    challenge: Challenge;
    playerStats: PlayerStats;
    onComplete: (stats: { wpm: number; accuracy: number; maxCombo: number }) => void;
}

const GameUI: React.FC<GameUIProps> = ({ challenge, playerStats, onComplete }) => {
    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <HUD playerStats={playerStats} />
            <div className="bg-black/50 backdrop-blur-sm border border-cyan-400/50 p-4 rounded-md box-glow-cyan flex flex-col gap-4">
                <MissionBriefing 
                    missionType={challenge.missionType}
                    briefing={challenge.briefing} 
                    loreSnippet={challenge.loreSnippet}
                />
                <TypingChallenge 
                    challenge={challenge} 
                    playerStats={playerStats}
                    onComplete={onComplete} 
                />
            </div>
        </div>
    );
};

export default GameUI;