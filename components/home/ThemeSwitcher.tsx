import { useTheme } from '@/contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'cyberSpace' | 'sakuraTrees' | 'sunsetCity') => {
    setTheme(newTheme);
  };

  return (
    <div className='flex space-x-2'>
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
      <button 
        className={`w-6 h-6 rounded-full text-white flex items-center justify-center
          ${theme === 'sunsetCity' ? 'ring-1 ring-orange-300' : 'opacity-75 hover:opacity-100'}`}
        onClick={() => handleThemeChange("sunsetCity")}
        aria-label="sunsetCity"
        title="sunsetCity"
      >
        <span className="sr-only">Sunset City</span>
        🌇
      </button>
    </div>
  );
};

export default ThemeSwitcher;
