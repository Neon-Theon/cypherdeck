import React, { useEffect, useState, useRef } from 'react';
import { audioService } from '../../services/audioService';
import TutorialOverlay from '../tutorial/TutorialOverlay';

interface ResultsAppProps {
    typingStats: { wpm: number; accuracy: number; };
    captchaSuccess: boolean;
    xpGained: number;
    xpBreakdown: Record<string, number>;
    isLevelUp: boolean;
    newLevel: number;
    isTutorial: boolean;
    onContinue: () => void;
}

const tutorialSteps = [
    { text: "Good work. Your performance, bonuses, and upgrades all contribute to your XP reward.", style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
    { text: "Earn enough XP to level up. Leveling up grants Upgrade Points for the Cybernetics Lab. Now, disconnect.", style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
];

const useCountUp = (endValue: number, duration: number = 1000) => {
    const [count, setCount] = useState(0);
    // FIX: Initialize useRef with null. The previous syntax `useRef<number>()` was invalid.
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        let start = 0;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                setCount(Math.round(endValue * progress));
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [endValue, duration]);

    return count;
};

const ResultsApp: React.FC<ResultsAppProps> = ({
    typingStats,
    captchaSuccess,
    xpGained,
    xpBreakdown,
    isLevelUp,
    newLevel,
    isTutorial,
    onContinue
}) => {
    const [tutorialStep, setTutorialStep] = useState(isTutorial ? 0 : -1);
    const [startAnimation, setStartAnimation] = useState(false);
    const displayedXp = useCountUp(xpGained);
    
    useEffect(() => {
        audioService.playMissionComplete();
        if (isLevelUp) {
            setTimeout(() => audioService.playLevelUp(), 400);
        }
        // Trigger CSS animation after a short delay
        const timer = setTimeout(() => setStartAnimation(true), 100);
        return () => clearTimeout(timer);
    }, [isLevelUp]);

    const handleContinue = () => {
        audioService.playUIClick();
        onContinue();
    }

    const handleNextTutorialStep = () => {
        if (tutorialStep < tutorialSteps.length - 1) {
            setTutorialStep(s => s + 1);
        } else {
            setTutorialStep(-1);
        }
    };

    const isPenalty = xpGained < 0;

    return (
        <div className="p-4 text-gray-300 h-full flex flex-col items-center justify-center text-center relative">
            {tutorialStep !== -1 && (
                <TutorialOverlay 
                    text={tutorialSteps[tutorialStep].text}
                    style={tutorialSteps[tutorialStep].style}
                    onNext={handleNextTutorialStep}
                />
            )}
            <h2 className={`font-display text-5xl text-glow-cyan mb-2 ${isPenalty ? 'text-red-500' : 'text-cyan-400'}`}>
                {isPenalty ? 'MISSION FAILED' : 'MISSION DEBRIEF'}
            </h2>
            
            {isLevelUp && (
                 <p className="font-display text-4xl text-purple-400 text-glow-purple animate-pulse mb-2">LEVEL UP! Reached Level {newLevel}</p>
            )}

            <div className="grid grid-cols-2 gap-4 my-4 w-full max-w-2xl">
                {/* Performance Stats */}
                <div className="bg-black/40 p-3 rounded col-span-1">
                    <p className="font-display text-2xl text-cyan-400">WPM</p>
                    <p className="font-display text-5xl text-fuchsia-400 text-glow-fuchsia">{typingStats.wpm}</p>
                </div>
                <div className="bg-black/40 p-3 rounded col-span-1">
                    <p className="font-display text-2xl text-cyan-400">ACCURACY</p>
                    <p className="font-display text-5xl text-fuchsia-400 text-glow-fuchsia">{typingStats.accuracy}%</p>
                </div>
                
                {/* XP Breakdown */}
                <div className="bg-black/40 p-3 rounded col-span-2">
                     <p className={`font-display text-2xl ${isPenalty ? 'text-red-400' : 'text-cyan-400'}`}>
                        XP {isPenalty ? 'LOST' : 'GAINED'}: {isPenalty ? '' : '+'}{displayedXp}
                     </p>
                     <div className="w-full bg-fuchsia-900/80 rounded-full h-4 mt-2 overflow-hidden">
                        <div 
                            className={`${isPenalty ? 'bg-red-500' : 'bg-fuchsia-400'} h-4 rounded-full ${startAnimation ? 'xp-bar-fill' : ''}`}
                            style={{ width: '100%' }}
                        ></div>
                    </div>
                     <div className="text-left mt-2 px-4 text-purple-300">
                         {Object.entries(xpBreakdown).map(([key, value]) => (
                             <div key={key} className="flex justify-between text-lg">
                                 <span>{key}:</span>
                                 <span className={value < 0 ? 'text-red-400' : ''}>{value >= 0 ? '+' : ''}{value}</span>
                             </div>
                         ))}
                     </div>
                </div>
            </div>

            <button
                onClick={handleContinue}
                className="font-display mt-4 text-3xl bg-cyan-600/80 text-white py-2 px-8 rounded border border-cyan-400 hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105"
            >
                Continue
            </button>
        </div>
    );
};

export default ResultsApp;
