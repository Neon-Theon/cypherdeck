import React, { useState } from 'react';
import { PlayerStats, WindowInstance, AppId, Challenge } from '../../types';
import { APPS } from '../../constants';
import Taskbar from './Taskbar';
import Window from './Window';
import Icon from './Icon';
import { audioService } from '../../services/audioService';

// App component imports
import ChatApp from '../apps/ChatApp';
import HackingMinigameApp from '../apps/HackingMinigameApp';
import CaptchaMinigameApp from '../apps/FileExplorerApp'; // Repurposed component
import ResultsApp from '../apps/ResultsApp';
import CyberneticsLabApp from '../apps/CyberneticsLabApp';
import UserProfileApp from '../apps/UserProfileApp';
import DataHeistApp from '../apps/DataHeistApp';
import FirewallBreachApp from '../apps/FirewallBreachApp';

interface WelcomeAppProps {
    onHackerNameSet: (name: string) => void;
}

const WelcomeApp: React.FC<WelcomeAppProps> = ({ onHackerNameSet }) => {
    const [name, setName] = useState('');

    const handleInitialize = () => {
        if (!name.trim()) return;
        audioService.init(); // Initialize audio on first user interaction
        audioService.playUIClick();
        onHackerNameSet(name);
    };

    return (
        <div className="p-4 flex flex-col items-center justify-center h-full text-center">
            <h2 className="font-display text-4xl text-cyan-400">Welcome to CypherOS</h2>
            <p className="my-4 text-purple-400">Enter your handle to begin.</p>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleInitialize(); }}
                placeholder="HACKER_HANDLE"
                maxLength={20}
                className="font-display text-2xl bg-black/70 text-cyan-300 border-2 border-cyan-500/50 rounded-md text-center px-4 py-1 w-full max-w-xs mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            />
            <button
                onClick={handleInitialize}
                disabled={!name.trim()}
                className="font-display text-2xl bg-purple-600/80 text-white py-1 px-6 rounded border-2 border-purple-400 disabled:opacity-50 hover:bg-purple-500 transition-colors"
            >
                Initialize
            </button>
        </div>
    );
}


interface DesktopEnvironmentProps {
    playerStats: PlayerStats;
    windows: WindowInstance[];
    focusedWindow: string | null;
    openWindow: (appId: AppId, data?: any) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    onWindowResize: (id: string, size: { width: number; height: number }) => void;
    onHackerNameSet: (name: string) => void;
    onMissionAccept: (challenge: Challenge) => void;
    onMissionFail: (challenge: Challenge) => void;
    onHackingComplete: (challenge: Challenge, stats: { wpm: number; accuracy: number; maxCombo: number }) => void;
    onCaptchaComplete: (challenge: Challenge, typingStats: any, success: boolean, timeBonus: number) => void;
    onResultsContinue: (isTutorial: boolean, isLevelUp: boolean) => void;
    onPurchaseUpgrade: (upgradeId: string) => void;
    onResetProgress: () => void;
    onLoreXpGained: (xp: number) => void;
}

const DesktopEnvironment: React.FC<DesktopEnvironmentProps> = (props) => {
    const { playerStats, windows, focusedWindow, openWindow, closeWindow, focusWindow, onWindowResize } = props;

    const renderAppContent = (appId: AppId, data: any, windowId: string) => {
        switch (appId) {
            case AppId.WELCOME:
                return <WelcomeApp onHackerNameSet={props.onHackerNameSet} />;
            case AppId.CHAT:
                return <ChatApp playerStats={playerStats} onAcceptMission={props.onMissionAccept} onLoreXpGained={props.onLoreXpGained} />;
            case AppId.HACKING_MINIGAME:
                return <HackingMinigameApp challenge={data.challenge} playerStats={playerStats} isTutorial={!!data.isTutorial} onComplete={props.onHackingComplete} onFail={props.onMissionFail} />;
            case AppId.CAPTCHA_MINIGAME:
                return <CaptchaMinigameApp challenge={data.challenge} typingStats={data.typingStats} playerStats={playerStats} isTutorial={!!data.isTutorial} onComplete={props.onCaptchaComplete} />;
            case AppId.RESULTS_SCREEN:
                return <ResultsApp {...data} onContinue={() => props.onResultsContinue(!!data.isTutorial, !!data.isLevelUp)} />;
            case AppId.CYBERNETICS_LAB:
                return <CyberneticsLabApp playerStats={playerStats} onPurchaseUpgrade={props.onPurchaseUpgrade} isTutorial={!!data.isTutorial} />;
            case AppId.USER_PROFILE:
                return <UserProfileApp playerStats={playerStats} onResetProgress={props.onResetProgress} />;
            case AppId.FLUX:
                return <DataHeistApp challenge={data.challenge} playerStats={playerStats} onComplete={props.onHackingComplete} onFail={props.onMissionFail} />;
            case AppId.ICEPIK:
                return <FirewallBreachApp challenge={data.challenge} playerStats={playerStats} onComplete={props.onHackingComplete} onFail={props.onMissionFail} />;
            default:
                return <div className="p-4">App not found: {appId}</div>;
        }
    };
    
    const desktopApps = [AppId.CHAT, AppId.CYBERNETICS_LAB, AppId.USER_PROFILE, AppId.FLUX, AppId.ICEPIK];

    return (
        <div className="w-full h-full relative">
            <Taskbar playerStats={playerStats} openWindows={windows} onFocus={focusWindow} />
            
            <div className="absolute top-16 left-4 flex flex-col gap-4">
                {desktopApps.map(appId => (
                    <Icon key={appId} app={APPS[appId]} onOpen={() => openWindow(appId)} />
                ))}
            </div>

            {windows.map(win => {
                const appDef = APPS[win.appId];
                return (
                    <Window
                        key={win.id}
                        id={win.id}
                        title={win.title}
                        initialX={win.x}
                        initialY={win.y}
                        width={win.width}
                        height={win.height}
                        zIndex={win.zIndex}
                        isFocused={focusedWindow === win.id}
                        onClose={() => !appDef.isEssential && closeWindow(win.id)}
                        onFocus={() => focusWindow(win.id)}
                        onResize={onWindowResize}
                        canClose={!appDef.isEssential}
                    >
                        {renderAppContent(win.appId, win.data, win.id)}
                    </Window>
                );
            })}
        </div>
    );
};

export default DesktopEnvironment;