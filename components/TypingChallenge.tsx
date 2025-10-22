import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Challenge, PlayerStats } from '../types';
import { audioService } from '../services/audioService';
import { CORRUPTION_CHARS } from '../constants';

interface TypingChallengeProps {
    challenge: Challenge;
    playerStats: PlayerStats;
    onComplete: (stats: { wpm: number; accuracy: number; maxCombo: number }) => void;
    onFail?: () => void;
    tutorialStep?: number;
}

interface CharProps {
  char: string;
  isCursor: boolean;
  status: 'untyped' | 'correct' | 'incorrect';
  modifier: Challenge['modifier'];
  isCorrupted: boolean;
}

const Char = React.memo<CharProps>(({ char, isCursor, status, modifier, isCorrupted }) => {
  const getCharClass = () => {
    if (isCursor) return 'cursor-char';
    if (status === 'incorrect') return 'text-red-500 underline';
    if (status === 'correct') return 'text-cyan-300';
    if (isCorrupted) return 'char-corrupted';
    if (modifier === 'REDACTED' && status === 'untyped') return 'text-black bg-gray-400';
    return 'text-gray-500';
  };
  
  const isUnstable = modifier === 'UNSTABLE' && status === 'untyped' && Math.random() < 0.05;

  return <span className={`whitespace-pre-wrap ${getCharClass()} ${isUnstable ? 'animate-pulse-strong opacity-0' : ''}`}>{char}</span>;
});

const TypingChallenge: React.FC<TypingChallengeProps> = ({ challenge, playerStats, onComplete, onFail, tutorialStep }) => {
    const [userInput, setUserInput] = useState('');
    const [displayedCode, setDisplayedCode] = useState(Array.isArray(challenge.payload) ? challenge.payload.join('\n') : challenge.payload);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [errors, setErrors] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [nanoRepairUsed, setNanoRepairUsed] = useState(false);
    const [rerenderKey, setRerenderKey] = useState(0); // For unstable modifier
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const codeToType = useMemo(() => Array.isArray(challenge.payload) ? challenge.payload.join('\n') : challenge.payload, [challenge.payload]);
    const { unlockedUpgrades } = playerStats;
    
    const mistakeForgiveness = unlockedUpgrades.includes('predictive_input') ? 2 : 0;
    const hasNanoRepair = unlockedUpgrades.includes('nano_repair');

    useEffect(() => {
      setUserInput('');
      setStartTime(null);
      setErrors(0);
      setCombo(0);
      setMaxCombo(0);
      setNanoRepairUsed(false);
      setDisplayedCode(codeToType);
    }, [challenge, codeToType]);

    // Effect for UNSTABLE modifier re-render
    useEffect(() => {
        if (challenge.modifier !== 'UNSTABLE') return;
        const interval = setInterval(() => {
            setRerenderKey(k => k + 1);
        }, 150);
        return () => clearInterval(interval);
    }, [challenge.modifier]);

     // Effect for CORRUPTED modifier
    useEffect(() => {
        if (challenge.modifier !== 'CORRUPTED') return;
        const interval = setInterval(() => {
            setDisplayedCode(currentCode => {
                const untypedIndex = userInput.length;
                const codeArr = currentCode.split('');
                const corruptionChance = 0.1; // 10% chance per untyped char to corrupt
                let changed = false;

                for (let i = untypedIndex; i < codeArr.length; i++) {
                    if (Math.random() < corruptionChance) {
                        codeArr[i] = CORRUPTION_CHARS[Math.floor(Math.random() * CORRUPTION_CHARS.length)];
                        changed = true;
                    } else {
                        codeArr[i] = codeToType[i]; // Revert to original
                    }
                }
                if (changed) audioService.playCorruptionGlitch();
                return codeArr.join('');
            });
        }, 200);
        return () => clearInterval(interval);
    }, [challenge.modifier, codeToType, userInput.length]);

    useEffect(() => {
        if (tutorialStep === undefined || tutorialStep === -1) {
            const focusTimeout = setTimeout(() => inputRef.current?.focus(), 0);
            return () => clearTimeout(focusTimeout);
        }
    }, [tutorialStep]);

    useEffect(() => {
      if (userInput.length === codeToType.length && startTime) {
        const endTime = Date.now();
        const durationInMinutes = (endTime - startTime) / 60000;
        const wordsTyped = codeToType.length / 5;
        const wpm = Math.round(wordsTyped / durationInMinutes);
        
        const finalErrors = Math.max(0, errors - mistakeForgiveness);
        const accuracy = Math.round(((codeToType.length - finalErrors) / codeToType.length) * 100);
        
        onComplete({ 
            wpm: wpm > 0 ? wpm : 0, 
            accuracy: accuracy > 0 ? accuracy : 0,
            maxCombo: Math.max(combo, maxCombo),
        });
      }
    }, [userInput.length, codeToType.length, startTime, errors, onComplete, mistakeForgiveness, combo, maxCombo]);
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (userInput.length >= codeToType.length) return;

      const value = e.target.value;
      const typedChar = value.slice(-1);
      const targetChar = codeToType[userInput.length];

      if (!startTime && value.length > 0) {
        setStartTime(Date.now());
      }
      
      if (typedChar === targetChar) {
          audioService.playKeyPress();
          const newCombo = combo + 1;
          setCombo(newCombo);
          if (newCombo > maxCombo) setMaxCombo(newCombo);
          setUserInput(value);
      } else {
          if (challenge.modifier === 'STEALTH' && onFail) {
              audioService.playError();
              onFail();
              return;
          }
          audioService.playError();
          if (hasNanoRepair && !nanoRepairUsed) {
              setNanoRepairUsed(true);
              const correctedInput = userInput + targetChar;
              setUserInput(correctedInput);
              return;
          }
          
          setCombo(0);
          setErrors(prev => prev + 1);
          setUserInput(value);
      }
    };

    const renderedCode = useMemo(() => {
      return codeToType.split('').map((char, index) => {
        let status: 'untyped' | 'correct' | 'incorrect' = 'untyped';
        if (index < userInput.length) {
          status = userInput[index] === char ? 'correct' : 'incorrect';
        }
        return (
            <Char 
                key={`${challenge.id}-${index}`} 
                char={displayedCode[index]} 
                status={status} 
                isCursor={index === userInput.length}
                modifier={challenge.modifier}
                isCorrupted={challenge.modifier === 'CORRUPTED' && status === 'untyped' && displayedCode[index] !== char}
            />
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeToType, userInput, challenge.id, challenge.modifier, rerenderKey, displayedCode]);

    return (
        <div className="relative flex flex-col flex-grow">
            <div className="p-4 bg-black/70 rounded-md font-mono text-lg leading-relaxed tracking-wider flex-grow overflow-y-auto">
                {challenge.modifier && (
                    <div className={`absolute top-2 right-2 font-display text-2xl animate-pulse-strong border-2 px-2 rounded ${challenge.modifier === 'STEALTH' ? 'text-purple-400 border-purple-400' : 'text-red-500 border-red-500'}`}>
                        SYSTEM ALERT: {challenge.modifier}
                    </div>
                )}
                {renderedCode}
            </div>
            <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default"
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
            />
        </div>
    );
};

export default TypingChallenge;