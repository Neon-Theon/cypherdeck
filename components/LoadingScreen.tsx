
import React, { useState, useEffect } from 'react';

const loadingMessages = [
    'Compiling kernel modules...',
    'Decrypting data stream...',
    'Bypassing corporate ICE...',
    'Establishing neural link...',
    'Querying darknet archives...',
    'Splicing daemon subroutines...'
];

const LoadingScreen: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % loadingMessages.length);
        }, 2000);

        const dotsInterval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        return () => {
            clearInterval(messageInterval);
            clearInterval(dotsInterval);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-black/50 backdrop-blur-sm border border-cyan-400/50 rounded-md box-glow-cyan">
            <h2 className="font-display text-5xl text-cyan-400 text-glow-cyan mb-4">LOADING MISSION</h2>
            <p className="text-fuchsia-400 text-xl font-mono">
                {loadingMessages[messageIndex]}{dots}
            </p>
            <div className="mt-6 w-full max-w-md bg-fuchsia-900/80 rounded-full h-4 overflow-hidden">
                <div className="bg-fuchsia-400 h-4 rounded-full animate-pulse" style={{width: "100%"}}></div>
            </div>
        </div>
    );
};

export default LoadingScreen;