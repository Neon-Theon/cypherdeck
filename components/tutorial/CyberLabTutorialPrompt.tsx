
import React from 'react';

interface CyberLabTutorialPromptProps {
    onConfirm: () => void;
}

const CyberLabTutorialPrompt: React.FC<CyberLabTutorialPromptProps> = ({ onConfirm }) => {
    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[2000]">
            <div 
                className="bg-stone-900 border-2 border-purple-500 rounded-lg p-6 max-w-lg text-lg text-gray-200 shadow-lg shadow-purple-500/30 text-center animate-pulse-strong"
            >
                <h2 className="font-display text-4xl text-purple-400 text-glow-purple mb-4">LEVEL 2 REACHED</h2>
                <p className="mb-6">You've earned your first Upgrade Point. Let's visit the Cybernetics Lab to install an augment and enhance your abilities.</p>
                <button 
                    onClick={onConfirm}
                    className="w-full font-display text-3xl bg-purple-600/80 text-white py-2 px-4 rounded border border-purple-400 hover:bg-purple-500 transition-colors"
                >
                    Show Me The Lab
                </button>
            </div>
        </div>
    );
};

export default CyberLabTutorialPrompt;
