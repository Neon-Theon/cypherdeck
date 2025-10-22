import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PlayerStats, WindowInstance, AppId, Challenge, RiskLevel, GameMode } from './types';
import { XP_PER_LEVEL, APPS, UPGRADES, TUTORIAL_CHALLENGE } from './constants';
import { audioService } from './services/audioService';
import DesktopEnvironment from './components/desktop/DesktopEnvironment';
import VirtualDeck from './components/VirtualDeck';
import CyberLabTutorialPrompt from './components/tutorial/CyberLabTutorialPrompt';

const STORAGE_KEY = 'cypherdeck_player_stats_v2';

const DEFAULT_PLAYER_STATS: PlayerStats = {
    hackerName: '',
    level: 1,
    xp: 0,
    wpm: 0,
    accuracy: 0,
    unlockedUpgrades: [],
    missionsCompleted: 0,
    upgradePoints: 0,
};

const App: React.FC = () => {
    const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_PLAYER_STATS, ...parsed };
            }
            return DEFAULT_PLAYER_STATS;
        } catch {
            return DEFAULT_PLAYER_STATS;
        }
    });

    const [windows, setWindows] = useState<WindowInstance[]>([]);
    const [focusedWindow, setFocusedWindow] = useState<string | null>(null);
    const [showCyberLabTutorialPrompt, setShowCyberLabTutorialPrompt] = useState(false);
    const windowIdCounter = useRef(0);

    const getNextZIndex = useCallback(() => {
        if (windows.length === 0) return 1;
        return Math.max(...windows.map(w => w.zIndex)) + 1;
    }, [windows]);

    const focusWindow = useCallback((id: string) => {
        if (focusedWindow === id) return;
        const zIndex = getNextZIndex();
        setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex } : w));
        setFocusedWindow(id);
    }, [focusedWindow, getNextZIndex]);

    const openWindow = useCallback((appId: AppId, data: any = {}, options: { center?: boolean } = {}) => {
        const appDef = APPS[appId];
        const existingWindow = windows.find(w => w.appId === appId);
        
        if (existingWindow && ![AppId.HACKING_MINIGAME, AppId.CHAT, AppId.FLUX, AppId.ICEPIK].includes(appId)) {
            focusWindow(existingWindow.id);
            return;
        }
         if (existingWindow && appId === AppId.CHAT) {
            focusWindow(existingWindow.id);
            return;
        }


        const width = appDef.width || 700;
        const height = appDef.height || 500;
        let x, y;

        if (options.center) {
            x = (window.innerWidth - width) / 2;
            y = (window.innerHeight - height) / 2;
        } else {
            const openWindowCount = windows.filter(w => w.appId !== AppId.WELCOME).length;
            x = 150 + (openWindowCount % 10) * 30;
            y = 70 + (openWindowCount % 10) * 30;
        }

        const newWindow: WindowInstance = {
            id: `win_${windowIdCounter.current++}`,
            appId,
            title: data.title || appDef.name,
            x,
            y,
            width,
            height,
            zIndex: getNextZIndex(),
            data,
        };
        setWindows(prev => [...prev, newWindow]);
        setFocusedWindow(newWindow.id);
    }, [windows, getNextZIndex, focusWindow]);
    
    const closeWindow = useCallback((id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        if (focusedWindow === id) {
            setFocusedWindow(null);
        }
    }, [focusedWindow]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(playerStats));
        } catch (error) {
            console.error("Failed to save player stats:", error);
        }
    }, [playerStats]);

    useEffect(() => {
        if (windows.length > 0) return;
        if (playerStats.hackerName === '') {
            openWindow(AppId.WELCOME, {}, { center: true });
        } else {
            openWindow(AppId.CHAT, {}, { center: true });
        }
    }, [playerStats.hackerName, openWindow, windows.length]);


    const handleWindowResize = useCallback((id: string, newSize: { width: number; height: number }) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, ...newSize } : w));
    }, []);

    const handleHackerNameSet = useCallback((name: string) => {
        setPlayerStats(prev => ({ ...prev, hackerName: name }));
        const welcomeWindow = windows.find(w => w.appId === AppId.WELCOME);
        if (welcomeWindow) {
          closeWindow(welcomeWindow.id);
        }
        openWindow(AppId.CHAT, {}, { center: true });
    }, [closeWindow, openWindow, windows]);
    
    const handleMissionAccept = useCallback((challenge: Challenge) => {
        const newWindowId = `win_${windowIdCounter.current++}`;

        let targetAppId = AppId.HACKING_MINIGAME;
        if (challenge.gameMode === GameMode.DATA_HEIST) targetAppId = AppId.FLUX;
        if (challenge.gameMode === GameMode.FIREWALL_BREACH) targetAppId = AppId.ICEPIK;

        setWindows(currentWindows => {
            const chatWindow = currentWindows.find(w => w.appId === AppId.CHAT);
            const windowsWithoutChat = chatWindow 
                ? currentWindows.filter(w => w.id !== chatWindow.id) 
                : currentWindows;
            
            const appDef = APPS[targetAppId];
            const width = appDef.width || 800;
            const height = appDef.height || 600;

            const openWindowCount = windowsWithoutChat.filter(w => w.appId !== AppId.WELCOME).length;
            const x = 150 + (openWindowCount % 10) * 30;
            const y = 70 + (openWindowCount % 10) * 30;

            const newZIndex = windowsWithoutChat.length > 0 
                ? Math.max(...windowsWithoutChat.map(w => w.zIndex)) + 1 
                : 1;

            const newWindow: WindowInstance = {
                id: newWindowId,
                appId: targetAppId,
                title: appDef.name,
                x, y, width, height,
                zIndex: newZIndex,
                data: { challenge },
            };

            return [...windowsWithoutChat, newWindow];
        });
        
        setFocusedWindow(newWindowId);
    }, []);
    
    const handleMissionFail = useCallback((challenge: Challenge) => {
        const openMinigame = windows.find(w => 
            w.appId === AppId.HACKING_MINIGAME || w.appId === AppId.FLUX || w.appId === AppId.ICEPIK
        );
        if (openMinigame) closeWindow(openMinigame.id);

        const xpPenalty = -50; // Example penalty for failure
        setPlayerStats(prev => ({ ...prev, xp: Math.max(0, prev.xp + xpPenalty) }));
        openWindow(AppId.RESULTS_SCREEN, {
            typingStats: { wpm: 0, accuracy: 0 },
            captchaSuccess: false, // Failure state
            xpGained: xpPenalty,
            isLevelUp: false,
            newLevel: playerStats.level,
            isTutorial: false,
            xpBreakdown: { 'Mission Failure': xpPenalty }
        });

    }, [closeWindow, openWindow, playerStats.level, windows]);

    const handleHackingComplete = useCallback((challenge: Challenge, stats: { wpm: number; accuracy: number; maxCombo: number }) => {
        const isTutorial = challenge.missionType === "Training";
        const openMinigame = windows.find(w => 
            w.appId === AppId.HACKING_MINIGAME || w.appId === AppId.FLUX || w.appId === AppId.ICEPIK
        );

        if (openMinigame) {
            closeWindow(openMinigame.id);
        }
        openWindow(AppId.CAPTCHA_MINIGAME, { challenge, typingStats: stats, isTutorial });
    }, [closeWindow, openWindow, windows]);

    const handleCaptchaComplete = useCallback((challenge: Challenge, typingStats: any, captchaSuccess: boolean, timeBonus: number) => {
        const isTutorial = challenge.missionType === "Training";
        const captchaWindow = windows.find(w => w.appId === AppId.CAPTCHA_MINIGAME);
        if (captchaWindow) {
            closeWindow(captchaWindow.id);
        }
        
        let xpBreakdown: Record<string, number> = {};
        let totalXp = 0;

        // Black ICE Protocol Failure Penalty
        if (playerStats.unlockedUpgrades.includes('black_ice_protocol') && !captchaSuccess) {
            const penalty = -(typingStats.wpm * 2);
            setPlayerStats(prev => ({ ...prev, xp: Math.max(0, prev.xp + penalty) }));
            openWindow(AppId.RESULTS_SCREEN, {
                typingStats, captchaSuccess, xpGained: penalty, isLevelUp: false, newLevel: playerStats.level, isTutorial, xpBreakdown: { 'Black ICE Penalty': penalty }
            });
            return;
        }

        // 1. Base XP from Typing
        let baseTypingXp = typingStats.wpm * (typingStats.accuracy / 100);
        if (playerStats.unlockedUpgrades.includes('overclocked_processor')) {
            const bonus = baseTypingXp * 0.10;
            baseTypingXp += bonus;
            xpBreakdown['Overclocked Processor'] = Math.round(bonus);
        }
        xpBreakdown['Base Typing XP'] = Math.round(baseTypingXp);
        totalXp = baseTypingXp;

        // 2. Combo Bonus
        if (playerStats.unlockedUpgrades.includes('combo_chaining')) {
            const comboMultiplier = Math.min(Math.floor(typingStats.maxCombo / 15) * 0.05, 0.20);
            const comboBonus = totalXp * comboMultiplier;
            totalXp += comboBonus;
            xpBreakdown['Combo Chaining'] = Math.round(comboBonus);
        }
        
        // 3. CAPTCHA Bonus
        if(captchaSuccess){
            const captchaXp = 50 + timeBonus * 2;
            totalXp += captchaXp;
            xpBreakdown['CAPTCHA Bonus'] = Math.round(captchaXp);
        }

        // 4. Flat Bonuses (applied after core gameplay bonuses)
        if (playerStats.unlockedUpgrades.includes('ghost_runner') && typingStats.accuracy === 100) {
            const ghostBonus = totalXp * 0.25;
            totalXp += ghostBonus;
            xpBreakdown['Ghost Runner'] = Math.round(ghostBonus);
        }
        if (playerStats.unlockedUpgrades.includes('ice_breaker') && challenge.modifier) {
            const modifierBonus = totalXp * 0.20;
            totalXp += modifierBonus;
            xpBreakdown['ICE Breaker'] = Math.round(modifierBonus);
        }

        // 5. Risk Multiplier
        let riskMultiplier = 1.0;
        if (challenge.riskLevel === 'Medium') riskMultiplier = 1.25;
        if (challenge.riskLevel === 'High') riskMultiplier = 1.5;
        if (playerStats.unlockedUpgrades.includes('black_ice_protocol')) {
            riskMultiplier += (riskMultiplier - 1.0); // Double the bonus
        }
        if (riskMultiplier > 1.0) {
             const riskBonus = totalXp * (riskMultiplier - 1.0);
             totalXp += riskBonus;
             xpBreakdown[`Risk Multiplier (x${riskMultiplier.toFixed(2)})`] = Math.round(riskBonus);
        }

        // 6. Global Multipliers (applied last)
        if (playerStats.unlockedUpgrades.includes('data_siphon')) {
            const siphonBonus = totalXp * 0.10;
            totalXp += siphonBonus;
            xpBreakdown['Data Siphon'] = Math.round(siphonBonus);
        }
        
        const finalXPGained = isTutorial ? 100 : Math.round(totalXp);
        if (isTutorial) xpBreakdown = { 'Tutorial Completion': 100 };

        const oldLevel = playerStats.level;
        const newXp = playerStats.xp + finalXPGained;
        const requiredXp = XP_PER_LEVEL[playerStats.level - 1] || Infinity;
        
        let newLevel = playerStats.level;
        let finalXp = newXp;
        let gainedUpgradePoints = 0;

        if (newXp >= requiredXp && newLevel < XP_PER_LEVEL.length) {
            newLevel++;
            finalXp = newXp - requiredXp;
            gainedUpgradePoints = 1;
        }
        const isLevelUp = newLevel > oldLevel;
        
        setPlayerStats(prev => ({
            ...prev,
            level: newLevel,
            xp: finalXp,
            wpm: Math.max(prev.wpm, typingStats.wpm),
            accuracy: Math.max(prev.accuracy, typingStats.accuracy),
            missionsCompleted: prev.missionsCompleted + 1,
            upgradePoints: prev.upgradePoints + gainedUpgradePoints
        }));
        
        openWindow(AppId.RESULTS_SCREEN, {
            typingStats, captchaSuccess, xpGained: finalXPGained, isLevelUp, newLevel, isTutorial, xpBreakdown
        });
    }, [closeWindow, openWindow, windows, playerStats]);
    
    const handleResultsContinue = useCallback((isTutorial: boolean, isLevelUp: boolean) => {
        const resultsWindow = windows.find(w => w.appId === AppId.RESULTS_SCREEN);
        if (resultsWindow) {
            closeWindow(resultsWindow.id);
        }

        // The tutorial is now guided by chat, so this prompt is handled there.
        // For now, just open the chat window. A more advanced system could
        // flash the chat icon or send a notification.
        if (!windows.some(w => w.appId === AppId.CHAT)) {
            openWindow(AppId.CHAT, {}, { center: true });
        }
    }, [closeWindow, openWindow, windows]);

    const handlePurchaseUpgrade = useCallback((upgradeId: string) => {
        const cost = UPGRADES[upgradeId].cost;
        if (playerStats.upgradePoints >= cost && !playerStats.unlockedUpgrades.includes(upgradeId)) {
            setPlayerStats(prev => ({
                ...prev,
                unlockedUpgrades: [...prev.unlockedUpgrades, upgradeId],
                upgradePoints: prev.upgradePoints - cost,
            }));
            audioService.playLevelUp();
        }
    }, [playerStats.upgradePoints, playerStats.unlockedUpgrades]);
    
    const handleResetProgress = useCallback(() => {
        if(window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
            localStorage.removeItem(STORAGE_KEY);
            setPlayerStats(DEFAULT_PLAYER_STATS);
            setWindows([]);
        }
    }, []);

    const handleLoreXpGained = useCallback((xpToAdd: number) => {
        if (xpToAdd <= 0) return;

        setPlayerStats(prev => {
            const oldLevel = prev.level;
            const newXp = prev.xp + xpToAdd;
            const requiredXp = XP_PER_LEVEL[prev.level - 1] || Infinity;
            
            let newLevel = prev.level;
            let finalXp = newXp;
            let gainedUpgradePoints = 0;

            if (newXp >= requiredXp && newLevel < XP_PER_LEVEL.length) {
                newLevel++;
                finalXp = newXp - requiredXp;
                gainedUpgradePoints = 1;
                audioService.playLevelUp();
            }

            return {
                ...prev,
                level: newLevel,
                xp: finalXp,
                upgradePoints: prev.upgradePoints + gainedUpgradePoints
            };
        });
    }, []);
    
    return (
        <VirtualDeck playerStats={playerStats}>
            <main className="w-full h-full overflow-hidden desktop-bg relative">
                <DesktopEnvironment
                    playerStats={playerStats}
                    windows={windows}
                    focusedWindow={focusedWindow}
                    openWindow={openWindow}
                    closeWindow={closeWindow}
                    focusWindow={focusWindow}
                    onWindowResize={handleWindowResize}
                    onHackerNameSet={handleHackerNameSet}
                    onMissionAccept={handleMissionAccept}
                    onMissionFail={handleMissionFail}
                    onHackingComplete={handleHackingComplete}
                    onCaptchaComplete={handleCaptchaComplete}
                    onResultsContinue={handleResultsContinue}
                    onPurchaseUpgrade={handlePurchaseUpgrade}
                    onResetProgress={handleResetProgress}
                    onLoreXpGained={handleLoreXpGained}
                />
            </main>
        </VirtualDeck>
    );
};

export default App;