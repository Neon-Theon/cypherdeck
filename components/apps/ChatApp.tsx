import React, { useState, useEffect } from 'react';
import { ChatContact, PlayerStats, Challenge } from '../../types';
import { INITIAL_CONTACTS } from '../../data/contacts';
import { chatService } from '../../services/chatService';
import ContactList from './chat/ContactList';
import ChatWindow from './chat/ChatWindow';

interface ChatAppProps {
    playerStats: PlayerStats;
    onAcceptMission: (challenge: Challenge) => void;
    onLoreXpGained: (xp: number) => void;
}

const ChatApp: React.FC<ChatAppProps> = ({ playerStats, onAcceptMission, onLoreXpGained }) => {
    const [contacts, setContacts] = useState<ChatContact[]>(Object.values(INITIAL_CONTACTS));
    const [activeContactId, setActiveContactId] = useState<string | null>(null);

    // Auto-select the first unread message on launch
    useEffect(() => {
        const firstUnread = contacts.find(c => c.isUnread);
        if (firstUnread) {
            handleSelectContact(firstUnread.id);
        }
    }, []);

    const handleSelectContact = (id: string) => {
        chatService.startSession(id, INITIAL_CONTACTS[id].persona);
        setActiveContactId(id);
        setContacts(prev => prev.map(c => c.id === id ? { ...c, isUnread: false } : c));
    };

    const activeContact = activeContactId ? contacts.find(c => c.id === activeContactId) : null;

    return (
        <div className="w-full h-full flex text-gray-200">
            <ContactList
                contacts={contacts}
                activeContactId={activeContactId}
                onSelectContact={handleSelectContact}
            />
            {activeContact ? (
                <ChatWindow 
                    contact={activeContact} 
                    onAcceptMission={onAcceptMission} 
                    onLoreXpGained={onLoreXpGained} 
                />
            ) : (
                <div className="flex-grow flex items-center justify-center bg-black/30">
                    <p className="font-display text-3xl text-cyan-400/50">Select a contact to begin.</p>
                </div>
            )}
        </div>
    );
};

export default ChatApp;