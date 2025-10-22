import React, { useState } from 'react';
import { PlayerStats, Upgrade, UpgradeCategory } from '../../types';
import { UPGRADES } from '../../constants';
import { audioService } from '../../services/audioService';
import TutorialOverlay from '../tutorial/TutorialOverlay';

interface CyberneticsLabAppProps {
    playerStats: PlayerStats;
    onPurchaseUpgrade: (upgradeId: string) => void;
    isTutorial?: boolean;
}

const tutorialSteps = [
    { text: "This is the Cybernetics Lab. Here you can spend Upgrade Points to enhance your abilities.", style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
    { text: "You earn Upgrade Points each time you level up. Your current total is shown here.", style: { top: '20px', right: '20px' }, arrow: 'down' as const },
    { text: "Upgrades improve your hacking. 'Combo Chaining' in the DECK category is a great first choice to boost future XP gain.", style: { top: '150px', left: '20px' }, arrow: 'right' as const },
    { text: "Go ahead and install an upgrade by clicking the 'INSTALL' button. This will spend your point.", style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }
];

const UpgradeCard: React.FC<{
    upgrade: Upgrade;
    isUnlocked: boolean;
    canAfford: boolean;
    onPurchase: (id: string) => void;
}> = ({ upgrade, isUnlocked, canAfford, onPurchase }) => {

    const handlePurchase = () => {
        audioService.playUIClick();
        onPurchase(upgrade.id);
    };

    return (
        <div className={`p-3 rounded border-2 flex flex-col justify-between ${isUnlocked ? 'bg-gray-800/80 border-gray-600' : 'bg-black/60 border-cyan-400/70'}`}>
            <div>
                <h4 className={`font-display text-2xl ${isUnlocked ? 'text-gray-500' : 'text-fuchsia-400'}`}>{upgrade.name}</h4>
                <p className={`mt-1 mb-3 text-sm ${isUnlocked ? 'text-gray-500' : 'text-gray-300'}`}>{upgrade.description}</p>
            </div>
            <div className='flex items-center justify-between'>
                <span className={`font-display text-2xl ${isUnlocked ? 'text-gray-500' : 'text-fuchsia-400'}`}>
                    {upgrade.cost} UP
                </span>
                <button
                    onClick={handlePurchase}
                    disabled={isUnlocked || !canAfford}
                    className="font-display text-xl py-1 px-4 rounded border transition-all duration-300 transform disabled:cursor-not-allowed
                               border-fuchsia-400 bg-fuchsia-600/80 text-white hover:bg-fuchsia-500 hover:scale-105
                               disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 disabled:transform-none"
                >
                    {isUnlocked ? 'INSTALLED' : 'INSTALL'}
                </button>
            </div>
        </div>
    );
};

const MemoizedUpgradeCard = React.memo(UpgradeCard);

const CyberneticsLabApp: React.FC<CyberneticsLabAppProps> = ({ playerStats, onPurchaseUpgrade, isTutorial }) => {
    const [tutorialStep, setTutorialStep] = useState(isTutorial ? 0 : -1);

    const handleNextTutorialStep = () => {
        if (tutorialStep < tutorialSteps.length - 1) {
            setTutorialStep(s => s + 1);
        } else {
            setTutorialStep(-1);
        }
    };
    
    const renderCategory = (category: UpgradeCategory, title: string, color: string) => {
        const categoryUpgrades = Object.values(UPGRADES).filter(u => u.category === category);
        return (
            <div>
                <h3 className={`font-display text-4xl ${color} text-glow-cyan`}>{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {categoryUpgrades.map(upgrade => (
                        <MemoizedUpgradeCard
                            key={upgrade.id}
                            upgrade={upgrade}
                            isUnlocked={playerStats.unlockedUpgrades.includes(upgrade.id)}
                            canAfford={playerStats.upgradePoints >= upgrade.cost}
                            onPurchase={onPurchaseUpgrade}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 text-gray-300 h-full overflow-y-auto relative">
             {tutorialStep !== -1 && (
                <TutorialOverlay 
                    text={tutorialSteps[tutorialStep].text}
                    style={tutorialSteps[tutorialStep].style}
                    arrow={tutorialSteps[tutorialStep].arrow}
                    onNext={handleNextTutorialStep}
                />
            )}
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-cyan-400/50">
                <h2 className="font-display text-4xl text-cyan-300">Cybernetics Lab</h2>
                <div className="text-right">
                    <p className="text-cyan-300 font-display text-lg">Upgrade Points</p>
                    <p className="font-display text-4xl text-fuchsia-400 text-glow-fuchsia">{playerStats.upgradePoints}</p>
                </div>
            </div>
            
            <div className="space-y-6">
                {renderCategory(UpgradeCategory.DECK, 'DECK // Typing Implants', 'text-cyan-400')}
                {renderCategory(UpgradeCategory.COGNITIVE, 'COGNITIVE // Puzzle Solvers', 'text-purple-400')}
                {renderCategory(UpgradeCategory.SYSTEM, 'SYSTEM // Core Mods', 'text-fuchsia-400')}
            </div>
        </div>
    );
};

export default CyberneticsLabApp;