import { Upgrade, UpgradeCategory, AppDef, AppId, Challenge, CaptchaChallenge, GameMode } from './types';

// XP required to advance from level N to N+1 - Extended curve
export const XP_PER_LEVEL = [
    100, 250, 400, 600, 850, 1100, 1400, 1750, 2150, 2600, 
    3100, 3700, 4400, 5200, 6100, 7200, 8400, 9800, 11500, 13500,
    16000, 19000, 22500, 26500, 31000, 36000, 42000, 49000, 57000, 66000
];

export const APPS: Record<AppId, AppDef> = {
    [AppId.CHAT]: { id: AppId.CHAT, name: 'GhostNet', icon: '[GHOST]', width: 900, height: 600 },
    [AppId.CYBERNETICS_LAB]: { id: AppId.CYBERNETICS_LAB, name: 'Cybernetics Lab', icon: '[AUG]', height: 700 },
    [AppId.USER_PROFILE]: { id: AppId.USER_PROFILE, name: 'User Profile', icon: '[ID]' },
    [AppId.HACKING_MINIGAME]: { id: AppId.HACKING_MINIGAME, name: 'SysCore Terminal', icon: '[ICE]', isEssential: true, width: 800, height: 600 },
    [AppId.CAPTCHA_MINIGAME]: { id: AppId.CAPTCHA_MINIGAME, name: 'Security CAPTCHA', icon: '[VERIFY]', isEssential: true, width: 500, height: 600 },
    [AppId.RESULTS_SCREEN]: { id: AppId.RESULTS_SCREEN, name: 'Mission Debrief', icon: '[LOG]', isEssential: true, width: 700 },
    [AppId.WELCOME]: { id: AppId.WELCOME, name: 'Welcome to CypherOS', icon: '[OS]', isEssential: true, width: 550, height: 320 },
    [AppId.FLUX]: { id: AppId.FLUX, name: 'FLUX', icon: '[FLX]', isEssential: true, width: 800, height: 600 },
    [AppId.ICEPIK]: { id: AppId.ICEPIK, name: 'ICEPIK', icon: '[PIK]', isEssential: true, width: 800, height: 600 },
};

export const UPGRADES: Record<string, Upgrade> = {
    // DECK Upgrades (Typing)
    'combo_chaining': { id: 'combo_chaining', name: 'Combo Chaining', description: 'Gain a stacking +5% XP bonus for every 15 consecutive correct chars, up to 4x.', category: UpgradeCategory.DECK, cost: 1 },
    'predictive_input': { id: 'predictive_input', name: 'Predictive Input', description: 'The first 2 typos in each mission do not count against your accuracy.', category: UpgradeCategory.DECK, cost: 1 },
    'nano_repair': { id: 'nano_repair', name: 'Nano-Repair Swarm', description: 'Automatically corrects your first typo in a mission. Does not break combos.', category: UpgradeCategory.DECK, cost: 2 },
    'overclocked_processor': { id: 'overclocked_processor', name: 'Overclocked Processor', description: 'Your WPM score has a 10% higher impact on total XP earned.', category: UpgradeCategory.DECK, cost: 2 },
    
    // COGNITIVE Upgrades (CAPTCHA / Puzzle)
    'image_recognition_ai': { id: 'image_recognition_ai', name: 'Image Recognition AI', description: 'Highlights one correct image for 2 seconds at the start of each CAPTCHA round.', category: UpgradeCategory.COGNITIVE, cost: 1 },
    'time_dilation_shard': { id: 'time_dilation_shard', name: 'Time Dilation Shard', description: 'Adds 3 extra seconds to the CAPTCHA timer for each round.', category: UpgradeCategory.COGNITIVE, cost: 1 },
    'decoy_scrambler': { id: 'decoy_scrambler', name: 'Decoy Scrambler', description: 'Randomly removes one incorrect image from each CAPTCHA grid.', category: UpgradeCategory.COGNITIVE, cost: 2 },
    'pattern_analysis': { id: 'pattern_analysis', name: 'Pattern Analysis', description: 'Reveals the category of the final CAPTCHA round in advance (e.g., "Transportation").', category: UpgradeCategory.COGNITIVE, cost: 2 },
    
    // SYSTEM Upgrades (General / XP)
    'data_siphon': { id: 'data_siphon', name: 'Data Siphon', description: 'Permanently increases all future XP gains by 10%.', category: UpgradeCategory.SYSTEM, cost: 1 },
    'ghost_runner': { id: 'ghost_runner', name: 'Ghost Runner', description: 'Earn a 25% flat XP bonus for completing the typing challenge with 100% accuracy.', category: UpgradeCategory.SYSTEM, cost: 1 },
    'ice_breaker': { id: 'ice_breaker', name: 'ICE Breaker', description: 'Completing a mission with an Instability Modifier grants a 20% XP bonus.', category: UpgradeCategory.SYSTEM, cost: 2 },
    'black_ice_protocol': { id: 'black_ice_protocol', name: 'Black ICE Protocol', description: 'High-risk/high-reward. Doubles XP bonus from mission risk levels, but failing the CAPTCHA results in an XP penalty.', category: UpgradeCategory.SYSTEM, cost: 3 },
};


// --- Tutorial Content ---
export const TUTORIAL_CHALLENGE: Challenge = {
    id: 'tutorial-mission',
    briefing: "Your first run, rookie. I've disabled the ICE on a soft target. This is a simple data snatch. Don't mess it up.",
    payload: "// Connect to server...\nconst target = 'mainframe.corp';",
    // FIX: Changed string literal to enum member to match the `GameMode` type.
    gameMode: GameMode.STANDARD,
    difficulty: 0,
    missionType: "Training Simulation",
    loreSnippet: "Every runner starts somewhere. This is your somewhere.",
    modifier: null,
    riskLevel: 'Low',
};

// --- Character pool for CORRUPTED modifier ---
export const CORRUPTION_CHARS = '!@#$%^&*()_+-=[]{}|;:",.<>/?`~';

// --- CAPTCHA Data ---
export const CAPTCHA_CHALLENGES: CaptchaChallenge[] = [
    {
        theme: "Corporate Warfare",
        rounds: [
            { prompt: "Select all Corporate Logos", images: ['🏢', '📈', '📄', '💼', '📊', '☕️', '🗄️', '📌', '📎'], correctIndices: [0, 1, 3, 4] },
            { prompt: "Select all Financial Documents", images: ['📉', '📈', '📰', '💰', '💳', '🧾', '📂', '💡', '📧'], correctIndices: [0, 1, 3, 4, 5] },
            { prompt: "Select all Office Equipment", images: ['📠', '📞', '🖨️', '🖥️', '⌨️', '🖱️', '📈', '🏢', '🗃️'], correctIndices: [0, 1, 2, 3, 4, 5, 8] }
        ]
    },
    {
        theme: "Data Havens",
        rounds: [
            { prompt: "Select all Data Packets", images: ['📦', '🔗', '🌐', '💾', '💿', '📡', '🛰️', '💡', '🧠'], correctIndices: [0, 1, 2, 3, 4] },
            { prompt: "Select all Network Nodes", images: ['🔴', '🟢', '🔵', '⚫️', '⚪️', '🟡', '🟠', '🟣', '🟤'], correctIndices: [0, 1, 2] },
            { prompt: "Select all Encryption Keys", images: ['🔑', '🔓', '🔒', '🔐', '🗝️', '🛡️', '⚙️', '🔗', '💡'], correctIndices: [0, 1, 2, 3, 4] }
        ]
    },
    {
        theme: "Urban Infrastructure",
        rounds: [
            { prompt: "Select all Transportation", images: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚚'], correctIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
            { prompt: "Select all Power Sources", images: ['💡', '🔌', '🔋', '⚡️', '🗼', '☀️', '☢️', '🏭', '🌊'], correctIndices: [1, 2, 3, 6, 7] },
            { prompt: "Select all Communication Devices", images: ['📡', '🛰️', '📱', '☎️', '📞', '📠', '📻', '📺', '🖥️'], correctIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
        ]
    },
    {
        theme: "Biotech Augments",
        rounds: [
            { prompt: "Select all Cybernetic Eyes", images: ['👁️', '👀', '👓', '🔬', '🔭', '💡', '🤖', '🦾', '🦿'], correctIndices: [0, 1] },
            { prompt: "Select all Genetic Mods", images: ['🧬', '🦠', '🧪', '💉', '💊', '🧠', '💪', '🩸', '⚗️'], correctIndices: [0, 1, 2, 3, 4] },
            { prompt: "Select all Neural Interfaces", images: ['🧠', '🔌', '⚡️', '🔗', '🤖', '💡', '📡', '🛰️', '🖥️'], correctIndices: [0, 1, 2, 3] }
        ]
    }
];