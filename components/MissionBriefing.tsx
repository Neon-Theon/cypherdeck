import React, { useState, useEffect } from 'react';

interface MissionBriefingProps {
    missionType: string;
    briefing: string;
    loreSnippet: string;
}

const MissionBriefing: React.FC<MissionBriefingProps> = ({ missionType, briefing, loreSnippet }) => {
    const [displayBriefing, setDisplayBriefing] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        setDisplayBriefing('');
        setIsTyping(true);
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < briefing.length) {
                setDisplayBriefing(prev => prev + briefing.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, 20); // Adjust speed of typing effect

        return () => clearInterval(typingInterval);
    }, [briefing]);

    return (
        <div>
            <h2 className="font-display text-3xl text-cyan-400 text-glow-cyan mb-2">INCOMING... // {missionType}</h2>
            <div className="text-fuchsia-400 min-h-[3rem] flex items-start text-lg">
                <span className="text-glow-fuchsia mr-2">></span>
                <p className="flex-1">
                    <span className="text-glow-fuchsia">{displayBriefing}</span>
                    {isTyping && <span className="inline-block w-2 h-5 bg-fuchsia-400 animate-ping ml-1"></span>}
                </p>
            </div>
            {!isTyping && loreSnippet && (
                <p className="text-xs text-cyan-500 mt-2 italic border-t border-cyan-800/50 pt-2">
                    {loreSnippet}
                </p>
            )}
        </div>
    );
};

export default MissionBriefing;