import { useTheme } from '@/contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'cyberSpace' | 'sakuraTrees') => {
    setTheme(newTheme);
  };

  return (
    <div className='flex justify-center items-center space-x-4 bg-transparent z-50 relative h-6'>
      <button 
        className={`w-6 h-6 rounded-full text-white flex items-center justify-center
          ${theme === 'cyberSpace' ? 'ring-1 ring-blue-400' : 'opacity-75 hover:opacity-100'}`}
        onClick={() => handleThemeChange("cyberSpace")}
        aria-label="cyberSpace"
        title="cyberSpace"
      >
        <span className="sr-only">Cyber Space</span>
        🤖
      </button>
      <button 
        className={`w-6 h-6 rounded-full text-white flex items-center justify-center
          ${theme === 'sakuraTrees' ? 'ring-1 ring-red-300' : 'opacity-75 hover:opacity-100'}`}
        onClick={() => handleThemeChange("sakuraTrees")}
        aria-label="sakuraTrees"
        title="sakuraTrees"
      >
        <span className="sr-only">Sakura Trees</span>
        🌸
      </button>
    </div>
  );
};

export default ThemeSwitcher;