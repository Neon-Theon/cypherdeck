export enum AppId {
    CHAT = 'CHAT',
    HACKING_MINIGAME = 'HACKING_MINIGAME',
    CAPTCHA_MINIGAME = 'CAPTCHA_MINIGAME',
    RESULTS_SCREEN = 'RESULTS_SCREEN',
    CYBERNETICS_LAB = 'CYBERNETICS_LAB',
    USER_PROFILE = 'USER_PROFILE',
    WELCOME = 'WELCOME',
    FLUX = 'FLUX',
    ICEPIK = 'ICEPIK',
}

export enum GameMode {
    STANDARD = 'STANDARD',
    DATA_HEIST = 'DATA_HEIST',
    FIREWALL_BREACH = 'FIREWALL_BREACH'
}

export interface AppDef {
    id: AppId;
    name: string;
    icon: string; // Typically an emoji or a character
    isEssential?: boolean; // Cannot be closed
    width?: number;
    height?: number;
}

export interface WindowInstance {
    id: string; // Unique ID for this instance
    appId: AppId;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    data?: any; // App-specific data
}

export enum UpgradeCategory {
    DECK = 'DECK',     // Typing related
    COGNITIVE = 'COGNITIVE', // CAPTCHA / Puzzle related
    SYSTEM = 'SYSTEM'  // General / XP related
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    category: UpgradeCategory;
    cost: number; // in Upgrade Points (UP)
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Challenge {
    id:string;
    briefing: string;
    payload: string | string[];
    gameMode: GameMode;
    difficulty: number;
    missionType: string;
    loreSnippet: string;
    modifier: 'REDACTED' | 'UNSTABLE' | 'CORRUPTED' | 'STEALTH' | null;
    riskLevel: RiskLevel;
}

export interface CaptchaRound {
    prompt: string;
    images: string[]; // Emojis
    correctIndices: number[];
}

export interface CaptchaChallenge {
    theme: string;
    rounds: CaptchaRound[];
}

export interface PlayerStats {
    hackerName: string;
    level: number;
    xp: number;
    wpm: number;
    accuracy: number;
    unlockedUpgrades: string[]; // Array of Upgrade IDs
    missionsCompleted: number;
    upgradePoints: number;
}

// --- Chat System Types ---
export interface ChatContact {
    id: string;
    name: string;
    avatar: string; // emoji or character
    persona: string; // System prompt for Gemini
    isUnread: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}