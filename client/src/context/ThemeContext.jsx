import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('app-theme');
        if (savedTheme) {
            return savedTheme;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark'; // Default theme
    });

    useEffect(() => {
        // Update DOM when theme changes
        const root = window.document.documentElement;

        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            root.classList.remove('dark');
            root.classList.add('light');
        } else {
            root.removeAttribute('data-theme'); // default is dark based on our CSS variables
            root.classList.remove('light');
            root.classList.add('dark');
        }

        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
