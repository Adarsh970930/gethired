import { useTheme } from '../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-bg-card-hover text-secondary hover:text-heading transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent-light"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <HiOutlineSun className="w-5 h-5 text-warning" />
            ) : (
                <HiOutlineMoon className="w-5 h-5 text-accent" />
            )}
        </button>
    );
}
