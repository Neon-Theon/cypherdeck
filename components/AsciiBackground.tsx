import React, { useState, useEffect, useMemo } from 'react';

const cityscape = [
"                                                                                                                                                                                                                          ",
"                                                                                                                                                                                                                          ",
"                                             .                                                                                                                                                                            ",
"                                            .:.                                                                                                                                                                           ",
"             .                              .::.         .                                                                                                                                                              ",
"            .::.                            .:::.       .::.                                                                                                                                                            ",
"           .::::.                           .::::.     .::::.                                                                                                                                                           ",
"          .::::::.                          .:::::.   .::::::.                          .                                                                                                                               ",
"         .::::::::.                         .::::::. .::::::::.                        .::.                                                                                                                             ",
"        .::::::::::.                        .::::::: .:::::::::.                      .::::.                                                                                                                            ",
"       .::::::::::::.                       .::::::::::::::::::.                     .::::::.                                                                                                                           ",
"      .::::::::::::::.                      .::::::::::::::::::::.                   ::::::::.                                                                                                                          ",
"     .::::::::::::::::.                     .::::::::::::::::::::::.                .:::::::::.                                                                                                                         ",
"    .::::::::::::::::::.      ...   ...     .::::::::::::::::::::::::.     ...   ...  .::::::::::.                                                                                                                        ",
"   .::::::::::::::::::::.   .:::::. .:::::. .::::::::::::::::::::::::::. .:::::. .:::::. .::::::::::::.                                                                                                                      ",
"  .::::::::::::::::::::::. .:::::::.:::::::. .::::::::::::::::::::::::::.:::::::.:::::::. .:::::::::::::.                                                                                                                    ",
" .::::::::::::::::::::::::.::::::::::::::::. .::::::::::::::::::::::::::.::::::::::::::::. .::::::::::::::. ............................................................................................................",
".::::::::::::::::::::::::::.:::::::::::::::. .::::::::::::::::::::::::::.:::::::::::::::. .:::::::::::::::. ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::",
"......................................................................................................................................................................................................................",
];

const chars = '.:*#%&@$01_/?\\|()[]{}';
const charCount = cityscape.join('').length;

const AsciiBackground: React.FC = () => {
    const [glitchedArt, setGlitchedArt] = useState(cityscape.join('\n'));

    const initialCharData = useMemo(() => cityscape.join('\n').split(''), []);

    useEffect(() => {
        const interval = setInterval(() => {
            const newChars = [...initialCharData];
            const glitches = Math.floor(charCount * 0.001); // Glitch 0.1% of characters
            for (let i = 0; i < glitches; i++) {
                const randomIndex = Math.floor(Math.random() * charCount);
                if (newChars[randomIndex] !== ' ' && newChars[randomIndex] !== '\n') {
                    const randomChar = chars[Math.floor(Math.random() * chars.length)];
                    newChars[randomIndex] = randomChar;
                }
            }
            setGlitchedArt(newChars.join(''));
        }, 100); // Update every 100ms

        return () => clearInterval(interval);
    }, [initialCharData]);

    return (
        <pre className="absolute inset-0 w-full h-full text-cyan-900/70 font-mono text-[10px] leading-tight overflow-hidden opacity-50 z-0">
            {glitchedArt}
        </pre>
    );
};

export default AsciiBackground;