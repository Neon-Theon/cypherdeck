import React, { useState } from 'react';
import { Challenge, PlayerStats } from '../../types';
import MissionBriefing from '../MissionBriefing';
import TypingChallenge from '../TypingChallenge';
import { audioService } from '../../services/audioService';

interface HackingMinigameAppProps {
    challenge: Challenge;
    playerStats: PlayerStats;
    isTutorial: boolean;
    onComplete: (challenge: Challenge, stats: { wpm: number; accuracy: number; maxCombo: number }) => void;
    onFail: (challenge: Challenge) => void;
}

const HackingMinigameApp: React.FC<HackingMinigameAppProps> = ({ challenge, playerStats, isTutorial, onComplete, onFail }) => {
    
    React.useEffect(() => {
        audioService.playMissionStart();
    }, []);

    const handleChallengeComplete = (stats: { wpm: number; accuracy: number; maxCombo: number }) => {
        onComplete(challenge, stats);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full relative">
            <MissionBriefing
                missionType={challenge.missionType}
                briefing={challenge.briefing}
                loreSnippet={challenge.loreSnippet}
            />
            <TypingChallenge
                challenge={challenge}
                playerStats={playerStats}
                onComplete={handleChallengeComplete}
                onFail={() => onFail(challenge)}
            />
        </div>
    );
};

export default HackingMinigameApp;