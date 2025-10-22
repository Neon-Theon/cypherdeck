import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatContact, ChatMessage, Challenge, RiskLevel, GameMode } from '../../../types';
import { chatService } from '../../../services/chatService';
import { audioService } from '../../../services/audioService';

interface ChatWindowProps {
    contact: ChatContact;
    onAcceptMission: (challenge: Challenge) => void;
    onLoreXpGained: (xp: number) => void;
}

const CONTRACT_REGEX = /\[CONTRACT\](.*)\[\/CONTRACT\]/;

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onAcceptMission, onLoreXpGained }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [offeredChallenge, setOfferedChallenge] = useState<Challenge | null>(null);
    const [xpNotification, setXpNotification] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const fetchInitialMessage = async () => {
            setIsLoading(true);
            setMessages([]);
            setOfferedChallenge(null);

            const messageId = uuidv4();
            const initialMessage: ChatMessage = { id: messageId, role: 'model', text: '', timestamp: Date.now() };
            setMessages([initialMessage]);
            
            let fullText = '';
            try {
                const { stream } = await chatService.getInitialMessage(contact.id);
                for await (const chunk of stream) {
                    audioService.playKeyPress();
                    fullText += chunk;
                    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: fullText } : m));
                }
            } catch (error) {
                 setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: "++ GHOSTFLARE DETECTED. CONNECTION TERMINATED. ++" } : m));
                 console.error(error);
            } finally {
                 checkForContract(fullText);
                 setIsLoading(false);
            }
        };

        fetchInitialMessage();
    }, [contact.id]);

    const checkForContract = (text: string) => {
        const match = text.match(CONTRACT_REGEX);
        if (match && match[1]) {
            try {
                const contractJson = JSON.parse(match[1]);
                const challenge: Challenge = {
                    id: `${new Date().toISOString()}-${contractJson.riskLevel}`,
                    briefing: contractJson.briefing,
                    payload: contractJson.code, // Gemini uses 'code', we map to 'payload'
                    difficulty: 1, // This can be adjusted based on player level later
                    missionType: contractJson.missionType,
                    loreSnippet: contractJson.loreSnippet,
                    modifier: contractJson.modifier || null,
                    riskLevel: contractJson.riskLevel as RiskLevel,
                    gameMode: contractJson.gameMode as GameMode || GameMode.STANDARD,
                };
                setOfferedChallenge(challenge);
            } catch (e) {
                console.error("Failed to parse contract JSON:", e);
            }
        }
    };


    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: ChatMessage = { id: uuidv4(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setOfferedChallenge(null);

        const modelMessageId = uuidv4();
        const modelMessage: ChatMessage = { id: modelMessageId, role: 'model', text: '', timestamp: Date.now() };
        setMessages(prev => [...prev, modelMessage]);

        let fullText = '';
        try {
            const { stream, xpBonus } = await chatService.sendMessage(contact.id, userMessage.text);
            if (xpBonus > 0) {
                onLoreXpGained(xpBonus);
                setXpNotification(`+${xpBonus} XP (Lore Discovery)`);
                setTimeout(() => setXpNotification(null), 3000);
            }

            for await (const chunk of stream) {
                audioService.playKeyPress();
                fullText += chunk;
                setMessages(prev => prev.map(m => m.id === modelMessageId ? { ...m, text: fullText } : m));
            }
        } catch (error) {
            setMessages(prev => prev.map(m => m.id === modelMessageId ? { ...m, text: "++ GHOSTFLARE DETECTED. CONNECTION TERMINATED. ++" } : m));
            console.error(error);
        } finally {
            checkForContract(fullText);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-grow flex flex-col bg-black/30">
            {/* Header */}
            <div className="p-3 border-b-2 border-cyan-400/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center font-display text-2xl text-cyan-300">
                    {contact.avatar}
                </div>
                <h2 className="font-display text-3xl text-fuchsia-400">{contact.name}</h2>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 chat-window">
                {messages.map(msg => (
                    <div key={msg.id} className={`p-3 rounded-lg max-w-xl text-lg chat-message-${msg.role}`}>
                        <p className="whitespace-pre-wrap">{msg.text}{msg.id === messages[messages.length - 1].id && isLoading && <span className="inline-block w-2 h-5 bg-cyan-400 animate-ping ml-1"></span>}</p>
                    </div>
                ))}
                {offeredChallenge && !isLoading && (
                    <div className="p-4 bg-purple-900/50 border-2 border-purple-500 rounded-lg flex flex-col items-center animate-pulse-strong">
                        <h3 className="font-display text-3xl text-purple-300">CONTRACT OFFERED</h3>
                        <p className="text-purple-400 text-center">"{offeredChallenge.briefing}"</p>
                        <button
                            onClick={() => onAcceptMission(offeredChallenge)}
                            className="font-display mt-2 text-2xl bg-fuchsia-600/80 text-white py-1 px-6 rounded border border-fuchsia-400 hover:bg-fuchsia-500 transition-all"
                        >
                            ACCEPT CONTRACT
                        </button>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-container p-3 flex flex-col gap-2">
                {xpNotification && (
                    <div className="text-center text-purple-300 text-glow-purple animate-pulse">
                        {xpNotification}
                    </div>
                )}
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-grow bg-black/50 border-2 border-fuchsia-500/50 rounded-md p-2 text-lg text-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="font-display text-2xl bg-cyan-600/80 text-white py-2 px-6 rounded border border-cyan-400 hover:bg-cyan-500 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;