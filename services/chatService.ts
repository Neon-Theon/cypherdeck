import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Store active chat sessions in memory
const activeChats: Map<string, Chat> = new Map();

const LORE_KEYWORDS = [
    'stargate', 'grill flame', 'remote viewing', 'psychic',
    'espionage', 'consciousness', 'ai', 'quantum', 'scalar', 'noetic',
    'psychoenergetics', 'cipher', 'ghostnet', 'warden', 'shade', 'glitch'
].join(', ');

const LORE_XP_AWARD = 15;

/**
 * Uses Gemini to analyze a user's message for genuine, curious questions about lore topics.
 * @param userMessage The message sent by the user.
 * @returns A promise that resolves to the amount of XP to award.
 */
const getLoreXpBonus = async (userMessage: string): Promise<number> => {
    // Basic filter to avoid running analysis on very short or non-question messages.
    if (userMessage.trim().length < 10 || !userMessage.includes('?')) {
        return 0;
    }

    const prompt = `You are an analyzer for a cyberpunk RPG. The game's lore involves these topics: ${LORE_KEYWORDS}.
Analyze if the user's message, provided below, is a genuine, curious question about any of these lore topics.
If it is a relevant question, respond with the number '${LORE_XP_AWARD}'.
If it is not a relevant question, or just a casual mention, respond with the number '0'.
Respond with ONLY the number and nothing else.

User Message: "${userMessage}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Disable thinking for a faster, cheaper analysis.
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const textResponse = response.text.trim();
        const xp = parseInt(textResponse, 10);

        // Validate the response from the model.
        if (!isNaN(xp) && (xp === LORE_XP_AWARD || xp === 0)) {
            return xp;
        }
        return 0; // Default to 0 if parsing fails or response is unexpected.
    } catch (error) {
        console.error("Error analyzing message for lore XP:", error);
        return 0; // Don't award XP if the analysis fails.
    }
};


const createChatSession = (persona: string, history: ChatMessage[] = []): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: persona,
        },
        // TODO: Implement history loading
        // history: history.map(msg => ({
        //     role: msg.role,
        //     parts: [{ text: msg.text }]
        // }))
    });
    return chat;
};


export const chatService = {
    startSession: (contactId: string, persona: string): void => {
        if (!activeChats.has(contactId)) {
            const session = createChatSession(persona);
            activeChats.set(contactId, session);
        }
    },

    sendMessage: async (contactId: string, message: string): Promise<{ stream: AsyncGenerator<string>, xpBonus: number }> => {
        const session = activeChats.get(contactId);
        if (!session) {
            throw new Error(`No active chat session for contactId: ${contactId}`);
        }

        const xpBonus = await getLoreXpBonus(message);

        try {
            const result = await session.sendMessageStream({ message });

            async function* streamGenerator(): AsyncGenerator<string> {
                for await (const chunk of result) {
                    yield chunk.text;
                }
            }
            return { stream: streamGenerator(), xpBonus };

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            async function* errorStream(): AsyncGenerator<string> {
                yield "++ GHOSTFLARE DETECTED. CONNECTION TERMINATED. ++";
            }
            return { stream: errorStream(), xpBonus: 0 };
        }
    },

    getInitialMessage: async (contactId: string): Promise<{ stream: AsyncGenerator<string>, xpBonus: number }> => {
         const session = activeChats.get(contactId);
        if (!session) {
            throw new Error(`No active chat session for contactId: ${contactId}`);
        }
        // Send a "Connect." message to trigger the model's initial response.
        // This does not perform an XP check.
        try {
            const result = await session.sendMessageStream({ message: "Connect." });
            async function* streamGenerator(): AsyncGenerator<string> {
                for await (const chunk of result) {
                    yield chunk.text;
                }
            }
            return { stream: streamGenerator(), xpBonus: 0 };
        } catch (error) {
             console.error("Error getting initial message:", error);
             async function* errorStream(): AsyncGenerator<string> {
                yield "++ GHOSTFLARE DETECTED. CONNECTION TERMINATED. ++";
            }
            return { stream: errorStream(), xpBonus: 0 };
        }
    }
};