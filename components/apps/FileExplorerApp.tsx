import React, { useState, useEffect, useMemo } from 'react';
import { Challenge, PlayerStats, CaptchaRound, CaptchaChallenge } from '../../types';
import { audioService } from '../../services/audioService';
import TutorialOverlay from '../tutorial/TutorialOverlay';
import { CAPTCHA_CHALLENGES } from '../../constants';

interface CaptchaMinigameAppProps {
    challenge: Challenge;
    typingStats: { wpm: number; accuracy: number; maxCombo: number };
    playerStats: PlayerStats;
    isTutorial: boolean;
    onComplete: (challenge: Challenge, typingStats: any, success: boolean, timeBonus: number) => void;
}

const ROUND_DURATION = 30; // in seconds

const tutorialSteps = [
    { text: "Breach successful. Final security layer detected: a verification CAPTCHA. You're being traced, so move fast.", style: { top: '20px', right: '20px' }, arrow: 'down' as const },
    { text: "The 'Image Recognition AI' highlights a correct image. Select all matching images from the grid. A wrong submission will shake the system and cost you precious time.", style: { top: '80px', left: '20px' }, arrow: 'down' as const },
    { text: "Bypass all security layers before the timer runs out to secure the data. Let's get to work.", style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
];

const CaptchaMinigameApp: React.FC<CaptchaMinigameAppProps> = ({
    challenge,
    typingStats,
    playerStats,
    isTutorial,
    onComplete
}) => {
    const [captchaChallenge] = useState<CaptchaChallenge>(() => CAPTCHA_CHALLENGES[Math.floor(Math.random() * CAPTCHA_CHALLENGES.length)]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION + (playerStats.unlockedUpgrades.includes('time_dilation_shard') ? 3 : 0));
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
    const [scrambledIndex, setScrambledIndex] = useState<number | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(isTutorial ? 0 : -1);

    const recognitionAIActive = playerStats.unlockedUpgrades.includes('image_recognition_ai');
    const decoyScramblerActive = playerStats.unlockedUpgrades.includes('decoy_scrambler');
    
    const currentRound = captchaChallenge.rounds[currentRoundIndex];

    useEffect(() => {
        // Handle Decoy Scrambler
        if (decoyScramblerActive) {
            const incorrectIndices = currentRound.images.map((_, i) => i).filter(i => !currentRound.correctIndices.includes(i));
            if (incorrectIndices.length > 0) {
                setScrambledIndex(incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)]);
            }
        }
        
        // Handle Image Recognition AI
        if (recognitionAIActive) {
            const correct = currentRound.correctIndices;
            if (correct.length > 0) {
                setHighlightIndex(correct[Math.floor(Math.random() * correct.length)]);
            }
        }

    }, [currentRound, decoyScramblerActive, recognitionAIActive]);


    useEffect(() => {
        if (tutorialStep !== -1) return;

        if (timeLeft <= 0) {
            onComplete(challenge, typingStats, false, 0);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
            if (timeLeft <= 6 && timeLeft > 1) {
                audioService.playTimerTick();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete, challenge, typingStats, tutorialStep]);

    const handleImageClick = (index: number) => {
        if (scrambledIndex === index) return; // Cannot select scrambled images
        audioService.playKeyPress();
        setSelectedIndices(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleSubmit = () => {
        audioService.playUIClick();
        const correct = currentRound.correctIndices;
        const selected = selectedIndices.sort();
        const isCorrect = correct.length === selected.length && correct.every((val, index) => val === selected[index]);

        if (isCorrect) {
            audioService.playCaptchaRoundSuccess();
            if (currentRoundIndex === captchaChallenge.rounds.length - 1) {
                onComplete(challenge, typingStats, true, timeLeft);
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    setCurrentRoundIndex(prev => prev + 1);
                    setTimeLeft(ROUND_DURATION + (playerStats.unlockedUpgrades.includes('time_dilation_shard') ? 3 : 0));
                    setSelectedIndices([]);
                    setHighlightIndex(null);
                    setScrambledIndex(null);
                    setIsSuccess(false);
                }, 500);
            }
        } else {
            audioService.playError();
            setTimeLeft(prev => Math.max(0, prev - 3)); // 3 second penalty
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 820);
        }
    };

    const handleNextTutorialStep = () => {
        if (tutorialStep < tutorialSteps.length - 1) {
            setTutorialStep(s => s + 1);
        } else {
            setTutorialStep(-1);
        }
    };
    
    return (
        <div className={`p-4 text-gray-300 h-full flex flex-col relative transition-all duration-500 ${isShaking ? 'shake-anim' : ''} ${isSuccess ? 'border-4 border-green-500' : ''}`}>
             {tutorialStep !== -1 && (
                <TutorialOverlay 
                    text={tutorialSteps[tutorialStep].text}
                    style={tutorialSteps[tutorialStep].style}
                    arrow={tutorialSteps[tutorialStep].arrow}
                    onNext={handleNextTutorialStep}
                />
            )}
            <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-cyan-400/50">
                <p className="text-lg text-cyan-300">Round {currentRoundIndex + 1} / {captchaChallenge.rounds.length}</p>
                 <div className="text-center">
                    <p className="font-display text-lg text-red-400">TIME REMAINING</p>
                    <p className={`font-display text-5xl ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-fuchsia-400'}`}>{timeLeft}</p>
                </div>
            </div>
             <div className="text-center p-2 bg-black/30 rounded mb-2">
                 <p className="text-cyan-300 text-sm">PROMPT</p>
                 <p className="text-fuchsia-400 text-xl">"{currentRound.prompt}"</p>
                 {playerStats.unlockedUpgrades.includes('pattern_analysis') && currentRoundIndex < captchaChallenge.rounds.length - 1 && (
                    <p className="text-purple-400 text-xs animate-pulse mt-1">[Pattern Analysis]: Final round prompt will be "{captchaChallenge.rounds[captchaChallenge.rounds.length - 1].prompt}"</p>
                )}
            </div>
            <div className="flex-grow bg-black/50 p-2 rounded overflow-y-auto">
                 <div className="grid grid-cols-3 gap-4 text-6xl text-center">
                    {currentRound.images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => handleImageClick(index)}
                            disabled={scrambledIndex === index}
                            className={`p-4 rounded border-2 transition-all duration-200 aspect-square flex items-center justify-center
                                ${selectedIndices.includes(index) ? 'bg-fuchsia-500/50 border-fuchsia-400 scale-105' : 'bg-black/50 border-cyan-600'}
                                ${highlightIndex === index ? 'captcha-hint' : ''}
                                ${scrambledIndex === index ? 'captcha-scrambled' : 'hover:bg-cyan-500/30'}`}
                        >
                            {image}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={handleSubmit}
                className="font-display mt-4 text-3xl w-full bg-cyan-600/80 text-white py-2 px-8 rounded border border-cyan-400 hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105"
            >
                SUBMIT
            </button>
        </div>
    );
};

export default CaptchaMinigameApp;