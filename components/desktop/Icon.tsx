import React from 'react';
import { AppDef } from '../../types';
import { audioService } from '../../services/audioService';

interface IconProps {
    app: AppDef;
    onOpen: () => void;
}

const Icon: React.FC<IconProps> = ({ app, onOpen }) => {
    
    const handleDoubleClick = () => {
        audioService.init(); // Init on first interaction
        audioService.playUIClick();
        onOpen();
    }
    
    return (
        <div className="desktop-icon" onDoubleClick={handleDoubleClick}>
            <div className="font-display text-5xl text-cyan-300 text-glow-cyan h-12 flex items-center justify-center">
                {app.icon}
            </div>
            <span className="font-display text-xl">{app.name}</span>
        </div>
    );
};

export default React.memo(Icon);