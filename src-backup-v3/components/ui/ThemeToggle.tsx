import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    // Default to dark mode as per "Invisible UI" preference
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Initialize theme
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors shadow-lg z-50 pointer-events-auto"
            aria-label="Toggle Theme"
        >
            {isDark ? <Moon className="w-5 h-5 fill-white" /> : <Sun className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
        </motion.button>
    );
}
