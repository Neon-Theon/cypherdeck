import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Challenge, PlayerStats } from '../../types';
import { audioService } from '../../services/audioService';

interface FirewallBreachAppProps {
    challenge: Challenge;
    playerStats: PlayerStats;
    onComplete: (challenge: Challenge, stats: { wpm: number; accuracy: number; maxCombo: number }) => void;
    onFail: (challenge: Challenge) => void;
}

const VULNERABILITY_LIFETIME = 5000; // 5 seconds
const TOTAL_DURATION = 60; // 60 seconds

interface Vulnerability {
    id: number;
    text: string;
    timeLeft: number;
}

const FirewallBreachApp: React.FC<FirewallBreachAppProps> = ({ challenge, playerStats, onComplete, onFail }) => {
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [userInput, setUserInput] = useState('');
    const [breachedCount, setBreachedCount] = useState(0);
    const [totalTyped, setTotalTyped] = useState(0);
    const [totalErrors, setTotalErrors] = useState(0);
    const [gameTimeLeft, setGameTimeLeft] = useState(TOTAL_DURATION);
    const inputRef = useRef<HTMLInputElement>(null);

    const vulnerabilityPool = useMemo(() => Array.isArray(challenge.payload) ? challenge.payload : [], [challenge.payload]);
    const requiredBreaches = vulnerabilityPool.length;

    // Game Timer
    useEffect(() => {
        audioService.playMissionStart();
        const timer = setInterval(() => {
            setGameTimeLeft(prev => {
                if (prev <= 1) {
                    onFail(challenge);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [challenge, onFail]);

    // Vulnerability Spawner & Timer
    useEffect(() => {
        const spawnInterval = setInterval(() => {
            if (vulnerabilities.length < 5 && vulnerabilityPool.length > breachedCount + vulnerabilities.length) {
                const newVuln: Vulnerability = {
                    id: Date.now(),
                    text: vulnerabilityPool[breachedCount + vulnerabilities.length],
                    timeLeft: VULNERABILITY_LIFETIME,
                };
                setVulnerabilities(prev => [...prev, newVuln]);
            }
        }, 1000);

        const tickInterval = setInterval(() => {
            setVulnerabilities(prev => prev.map(v => ({ ...v, timeLeft: v.timeLeft - 100 })).filter(v => v.timeLeft > 0));
        }, 100);

        return () => {
            clearInterval(spawnInterval);
            clearInterval(tickInterval);
        };
    }, [vulnerabilities.length, breachedCount, vulnerabilityPool]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
    useEffect(() => {
        if(breachedCount === requiredBreaches) {
             const durationInMinutes = (TOTAL_DURATION - gameTimeLeft) / 60;
             const wordsTyped = totalTyped / 5;
             const wpm = Math.round(wordsTyped / durationInMinutes) || 0;
             const accuracy = totalTyped > 0 ? Math.round(((totalTyped - totalErrors) / totalTyped) * 100) : 100;

             onComplete(challenge, { wpm, accuracy, maxCombo: 0 });
        }
    }, [breachedCount, requiredBreaches, challenge, onComplete, gameTimeLeft, totalTyped, totalErrors])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserInput(value);

        const match = vulnerabilities.find(v => v.text === value);
        if (match) {
            audioService.playCaptchaRoundSuccess();
            setVulnerabilities(prev => prev.filter(v => v.id !== match.id));
            setBreachedCount(prev => prev + 1);
            setTotalTyped(prev => prev + value.length);
            setUserInput('');
        } else if (vulnerabilities.some(v => v.text.startsWith(value))) {
            // Correct so far
        } else {
            // Mistake
            audioService.playError();
            setTotalErrors(prev => prev + 1);
        }
    };

    return (
        <div className="p-4 flex flex-col h-full relative bg-black/50">
            <div className="grid grid-cols-3 gap-4 mb-4">
                 <div className="bg-black/40 p-2 rounded text-center">
                    <p className="font-display text-xl text-red-400">SYSTEM LOCKDOWN IN</p>
                    <p className={`font-display text-5xl ${gameTimeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-fuchsia-400'}`}>{gameTimeLeft}</p>
                </div>
                 <div className="bg-black/40 p-2 rounded text-center col-span-2">
                    <p className="font-display text-xl text-cyan-400">FIREWALL INTEGRITY</p>
                    <div className="w-full bg-cyan-900/80 rounded-full h-10 mt-1 overflow-hidden border-2 border-cyan-500">
                        <div 
                            className="bg-cyan-400 h-full transition-all duration-500" 
                            style={{ width: `${(breachedCount / requiredBreaches) * 100}%`}}
                        >
                           <span className="absolute w-full text-center font-display text-2xl text-black">{breachedCount} / {requiredBreaches} Breached</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-black/70 rounded p-4 relative grid grid-cols-3 grid-rows-3 gap-4">
                 {vulnerabilities.map((vuln, i) => (
                    <div key={vuln.id} className="bg-purple-900/50 border-2 border-purple-500 p-4 rounded-lg flex flex-col justify-center items-center">
                        <p className="font-mono text-4xl text-fuchsia-300 tracking-widest">{vuln.text}</p>
                        <div className="w-full bg-red-900 h-1 mt-2 rounded">
                            <div className="bg-red-500 h-1" style={{width: `${(vuln.timeLeft / VULNERABILITY_LIFETIME) * 100}%`}}></div>
                        </div>
                    </div>
                 ))}
            </div>
            
            <div className="mt-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleChange}
                    className="w-full font-mono text-4xl bg-black/80 text-cyan-300 border-2 border-cyan-500/50 rounded-md text-center p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder=">_"
                />
            </div>
        </div>
    );
};

export default FirewallBreachApp;
