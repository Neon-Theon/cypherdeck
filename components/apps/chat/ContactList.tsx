import React from 'react';
import { ChatContact } from '../../../types';

interface ContactListProps {
    contacts: ChatContact[];
    activeContactId: string | null;
    onSelectContact: (id: string) => void;
}

const ContactListItem: React.FC<{
    contact: ChatContact;
    isActive: boolean;
    onSelect: () => void;
}> = ({ contact, isActive, onSelect }) => {
    return (
        <li
            className={`contact-list-item flex items-center gap-3 p-3 cursor-pointer border-l-4 ${isActive ? 'bg-fuchsia-500/20 border-fuchsia-500' : 'border-transparent hover:bg-cyan-500/10'}`}
            onClick={onSelect}
        >
            <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center font-display text-2xl text-cyan-300">
                {contact.avatar}
            </div>
            <div className="flex-grow">
                <span className="font-bold text-lg text-gray-200">{contact.name}</span>
            </div>
            {contact.isUnread && (
                <div className="unread-indicator w-3 h-3 rounded-full animate-pulse"></div>
            )}
        </li>
    );
};


const ContactList: React.FC<ContactListProps> = ({ contacts, activeContactId, onSelectContact }) => {
    return (
        <div className="w-64 bg-black/50 border-r-2 border-cyan-400/50 flex flex-col">
            <div className="p-3 border-b-2 border-cyan-400/50">
                <h2 className="font-display text-3xl text-cyan-300">Contacts</h2>
            </div>
            <ul className="flex-grow overflow-y-auto">
                {contacts.map(contact => (
                    <ContactListItem
                        key={contact.id}
                        contact={contact}
                        isActive={contact.id === activeContactId}
                        onSelect={() => onSelectContact(contact.id)}
                    />
                ))}
            </ul>
        </div>
    );
};

export default ContactList;
