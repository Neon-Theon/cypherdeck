import React from 'react';
import AsciiBackground from './AsciiBackground';
import { PlayerStats } from '../types';

interface VirtualDeckProps {
    children: React.ReactNode;
    playerStats: PlayerStats;
}

const VirtualDeck: React.FC<VirtualDeckProps> = ({ children, playerStats }) => {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center p-4">
            <div className="virtual-deck w-full h-full flex flex-col">
                <div className="deck-titlebar flex justify-between items-center">
                    <span>
                        CYPHERDECK v3.0.0 - [HANDLE: {playerStats.hackerName || '...'} // LVL: {playerStats.level}]
                    </span>
                </div>
                <div className="virtual-deck-inner flex-grow relative">
                    <AsciiBackground />
                    {children}
                </div>
            </div>
        </div>
    );
};

export default VirtualDeck;