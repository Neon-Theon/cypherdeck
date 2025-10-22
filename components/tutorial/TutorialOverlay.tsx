import React from 'react';

interface TutorialOverlayProps {
    text: string;
    onNext: () => void;
    style?: React.CSSProperties;
    arrow?: 'up' | 'down' | 'left' | 'right';
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ text, onNext, style, arrow }) => {
    // Basic arrow styles
    const arrowBaseStyle: React.CSSProperties = {
        content: '""',
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
    };

    const arrowStyles: Record<string, React.CSSProperties> = {
        down: { ...arrowBaseStyle, borderWidth: '10px 10px 0 10px', borderColor: '#d946ef transparent transparent transparent', top: '-10px', left: 'calc(50% - 10px)' },
        up: { ...arrowBaseStyle, borderWidth: '0 10px 10px 10px', borderColor: 'transparent transparent #d946ef transparent', bottom: '-10px', left: 'calc(50% - 10px)' },
        right: { ...arrowBaseStyle, borderWidth: '10px 0 10px 10px', borderColor: 'transparent transparent transparent #d946ef', left: '-10px', top: 'calc(50% - 10px)' },
        left: { ...arrowBaseStyle, borderWidth: '10px 10px 10px 0', borderColor: 'transparent #d946ef transparent transparent', right: '-10px', top: 'calc(50% - 10px)' },
    };


    return (
        <div 
            className="absolute bg-stone-900 border-2 border-fuchsia-500 rounded-lg p-4 max-w-sm text-lg text-gray-200 shadow-lg shadow-fuchsia-500/30 z-[1000] animate-pulse-strong"
            style={style}
        >
            {arrow && <div style={arrowStyles[arrow]}></div>}
            <p>{text}</p>
            <button 
                onClick={onNext}
                className="mt-4 w-full font-display text-2xl bg-fuchsia-600/80 text-white py-1 px-4 rounded border border-fuchsia-400 hover:bg-fuchsia-500"
            >
                Next
            </button>
        </div>
    );
};

export default TutorialOverlay;